"use server";

import { createHash, randomBytes, randomUUID } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/profile";
import { getTrustedClientIp } from "@/lib/audit/request-context";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import {
  STANDARD_CONSENT_TITLE,
  STANDARD_CONSENT_VERSION,
  standardConsentPlainText
} from "@/lib/consent/standard-consent";
import { sendEmail } from "@/lib/email/resend";
import {
  CONSENTIMIENTO_MODALITIES,
  CONSENTIMIENTO_STATUSES,
  type ExpedienteIdentificationData
} from "@/lib/expedientes/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ExpedienteActionState = {
  message?: string;
  ok?: boolean;
};

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

const createExpedienteSchema = z.object({
  patientId: z.string().uuid(),
  initialConsultationReason: z.string().trim().min(5, "Describe el motivo de consulta inicial.")
});

const identificationSchema = z.object({
  expedienteId: z.string().uuid(),
  birthDate: optionalText,
  age: z.coerce.number().int().min(0).max(130).optional().or(z.literal("")),
  sex: z.enum(["masculino", "femenino"]).optional().or(z.literal("")),
  phone: optionalText,
  residence: optionalText,
  emergencyContactName: optionalText,
  emergencyContactPhone: optionalText,
  legalGuardianName: optionalText,
  legalGuardianPhone: optionalText,
  initialConsultationReason: z.string().trim().min(5, "Describe el motivo de consulta inicial.")
});

const historiaSchema = z.object({
  expedienteId: z.string().uuid(),
  motivoConsulta: optionalText,
  historiaProblemaActual: optionalText,
  antecedentesPsicologicos: optionalText,
  antecedentesPsiquiatricos: optionalText,
  antecedentesMedicos: optionalText,
  antecedentesFamiliares: optionalText,
  antecedentesTratamiento: optionalText,
  antecedentesMedicacion: optionalText,
  contextoFamiliar: optionalText,
  contextoRelacional: optionalText,
  contextoLaboralAcademico: optionalText,
  contextoEspiritualReligioso: optionalText,
  factoresRiesgo: optionalText,
  factoresProtectores: optionalText,
  recursosPersonales: optionalText,
  observacionesClinicasIniciales: optionalText
});

const consentimientoSchema = z.object({
  expedienteId: z.string().uuid(),
  status: z.enum(CONSENTIMIENTO_STATUSES),
  acceptanceActorPhone: z.string().trim().min(7).max(40),
  acceptanceActorRfc: z.string().trim().min(10).max(20),
  legalAcceptance: z.literal("on")
});

const sendStandardConsentSchema = z.object({
  expedienteId: z.string().uuid()
});

const archiveSchema = z.object({
  expedienteId: z.string().uuid()
});

const lifeHistorySchema = z.object({
  expedienteId: z.string().uuid(),
  mode: z.enum(["activate", "reopen"])
});

const consentFileSchema = z
  .preprocess((value) => (value instanceof File ? value : undefined), z.instanceof(File).optional())
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, "El archivo no puede exceder 10 MB.")
  .refine(
    (file) =>
      !file ||
      file.size === 0 ||
      ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Solo se permiten PDF, JPG, PNG o WEBP."
  );

async function getActiveProfessional() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return null;
  }

  return profile;
}

async function assertExpedienteOwner(expedienteId: string, professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("expedientes")
    .select("id, patient_id, professional_id, status")
    .eq("id", expedienteId)
    .eq("professional_id", professionalId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    patient_id: string;
    professional_id: string;
    status: string;
  };
}

function consentModalityForStatus(status: (typeof CONSENTIMIENTO_STATUSES)[number]) {
  if (status === "firmado_fisico") {
    return "fisico" satisfies (typeof CONSENTIMIENTO_MODALITIES)[number];
  }

  if (status === "firmado_digital") {
    return "digital" satisfies (typeof CONSENTIMIENTO_MODALITIES)[number];
  }

  return "pendiente" satisfies (typeof CONSENTIMIENTO_MODALITIES)[number];
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createFolio(prefix: string) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

async function getRequestContext() {
  const headerStore = await headers();

  return {
    ipAddress: getTrustedClientIp(headerStore),
    userAgent: headerStore.get("user-agent")
  };
}

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function ensureAssignedPatient(patientId: string, professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, role, account_status, assigned_professional_ids")
    .eq("id", patientId)
    .eq("role", "paciente")
    .single();

  if (error || !data) {
    return false;
  }

  return Array.isArray(data.assigned_professional_ids)
    ? data.assigned_professional_ids.includes(professionalId)
    : false;
}

export async function createExpedienteAction(
  _previousState: ExpedienteActionState,
  formData: FormData
): Promise<ExpedienteActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = createExpedienteSchema.safeParse({
    patientId: formData.get("patientId"),
    initialConsultationReason: formData.get("initialConsultationReason")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  const isAssigned = await ensureAssignedPatient(parsed.data.patientId, actor.id);

  if (!isAssigned) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "expediente_create",
      entityType: "expedientes",
      result: "denied",
      metadata: {
        patient_id: parsed.data.patientId
      },
      context: "audit_expediente_create_denied"
    });

    return { message: "Solo puedes crear expedientes de Pacientes asignados.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("expedientes")
    .insert({
      patient_id: parsed.data.patientId,
      professional_id: actor.id,
      initial_consultation_reason: parsed.data.initialConsultationReason,
      identification_data: {},
      created_by: actor.id
    })
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Expediente insert did not return an id"), {
      extra: {
        patient_id: parsed.data.patientId,
        professional_id: actor.id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "expediente_create",
      entityType: "expedientes",
      result: "error",
      metadata: {
        patient_id: parsed.data.patientId
      },
      context: "audit_expediente_create_error"
    });

    return {
      message:
        error?.code === "23505"
          ? "Ya existe un expediente activo para este Paciente."
          : "No fue posible crear el expediente.",
      ok: false
    };
  }

  const { error: consentimientoError } = await supabaseAdmin.from("consentimientos").insert({
    expediente_id: data.id,
    status: "pendiente",
    modality: "pendiente",
    registered_by: actor.id
  });

  if (consentimientoError) {
    if (consentimientoError) {
      Sentry.captureException(consentimientoError, {
        extra: {
          expediente_id: data.id,
          patient_id: parsed.data.patientId,
          professional_id: actor.id,
          failed_step: "consentimientos_insert"
        }
      });
    }

    const failedStep = "consentimientos_insert";

    Sentry.captureMessage("Expediente initialization failed", {
      level: "error",
      extra: {
        expediente_id: data.id,
        patient_id: parsed.data.patientId,
        professional_id: actor.id,
        consentimiento_error: true
      }
    });

    await supabaseAdmin
      .from("expedientes")
      .update({
        status: "bloqueado",
        clinical_status: "incomplete_initialization"
      })
      .eq("id", data.id);

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "expediente_create",
      entityType: "expedientes",
      entityId: data.id,
      result: "error",
      metadata: {
        patient_id: parsed.data.patientId,
        failed_step: failedStep,
        consentimiento_error: true
      },
      context: "audit_expediente_child_create_error"
    });

    return {
      message: "No fue posible inicializar todos los componentes del expediente.",
      ok: false
    };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "expediente_create",
    entityType: "expedientes",
    entityId: data.id,
    result: "success",
    metadata: {
      patient_id: parsed.data.patientId
    },
    context: "audit_expediente_create_success"
  });

  revalidatePath("/professional/expedientes");
  revalidatePath("/professional/patients");

  return { message: "Expediente clinico creado.", ok: true };
}

export async function updateExpedienteIdentificationAction(
  _previousState: ExpedienteActionState,
  formData: FormData
): Promise<ExpedienteActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = identificationSchema.safeParse({
    expedienteId: formData.get("expedienteId"),
    birthDate: formData.get("birthDate"),
    age: formData.get("age") || undefined,
    sex: formData.get("sex"),
    phone: formData.get("phone"),
    residence: formData.get("residence"),
    emergencyContactName: formData.get("emergencyContactName"),
    emergencyContactPhone: formData.get("emergencyContactPhone"),
    legalGuardianName: formData.get("legalGuardianName"),
    legalGuardianPhone: formData.get("legalGuardianPhone"),
    initialConsultationReason: formData.get("initialConsultationReason")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  const expediente = await assertExpedienteOwner(parsed.data.expedienteId, actor.id);

  if (!expediente) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "expediente_update",
      entityType: "expedientes",
      entityId: parsed.data.expedienteId,
      result: "denied",
      context: "audit_expediente_update_denied"
    });

    return { message: "No tienes permiso para modificar este expediente.", ok: false };
  }

  if (expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "expediente_update",
      entityType: "expedientes",
      entityId: expediente.id,
      result: "denied",
      context: "audit_expediente_update_denied_not_active"
    });

    return { message: "El expediente no esta activo y no puede modificarse.", ok: false };
  }

  const identificationData: ExpedienteIdentificationData = {
    birthDate: parsed.data.birthDate ?? undefined,
    age: parsed.data.age === "" ? undefined : parsed.data.age,
    sex: parsed.data.sex || undefined,
    phone: parsed.data.phone ?? undefined,
    residence: parsed.data.residence ?? undefined,
    emergencyContactName: parsed.data.emergencyContactName ?? undefined,
    emergencyContactPhone: parsed.data.emergencyContactPhone ?? undefined,
    legalGuardianName: parsed.data.legalGuardianName ?? undefined,
    legalGuardianPhone: parsed.data.legalGuardianPhone ?? undefined
  };

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("expedientes")
    .update({
      identification_data: identificationData,
      initial_consultation_reason: parsed.data.initialConsultationReason,
      last_clinical_activity_at: new Date().toISOString()
    })
    .eq("id", expediente.id)
    .eq("professional_id", actor.id);

  if (error) {
    Sentry.captureException(error, {
      extra: {
        expediente_id: expediente.id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "expediente_update",
      entityType: "expedientes",
      entityId: expediente.id,
      result: "error",
      context: "audit_expediente_update_error"
    });

    return { message: "No fue posible actualizar el expediente.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "expediente_update",
    entityType: "expedientes",
    entityId: expediente.id,
    result: "success",
    context: "audit_expediente_update_success"
  });

  revalidatePath(`/professional/expedientes/${expediente.id}`);
  revalidatePath("/professional/expedientes");

  return { message: "Datos de identificacion actualizados.", ok: true };
}

export async function updateHistoriaClinicaAction(
  _previousState: ExpedienteActionState,
  formData: FormData
): Promise<ExpedienteActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = historiaSchema.safeParse({
    expedienteId: formData.get("expedienteId"),
    motivoConsulta: formData.get("motivoConsulta"),
    historiaProblemaActual: formData.get("historiaProblemaActual"),
    antecedentesPsicologicos: formData.get("antecedentesPsicologicos"),
    antecedentesPsiquiatricos: formData.get("antecedentesPsiquiatricos"),
    antecedentesMedicos: formData.get("antecedentesMedicos"),
    antecedentesFamiliares: formData.get("antecedentesFamiliares"),
    antecedentesTratamiento: formData.get("antecedentesTratamiento"),
    antecedentesMedicacion: formData.get("antecedentesMedicacion"),
    contextoFamiliar: formData.get("contextoFamiliar"),
    contextoRelacional: formData.get("contextoRelacional"),
    contextoLaboralAcademico: formData.get("contextoLaboralAcademico"),
    contextoEspiritualReligioso: formData.get("contextoEspiritualReligioso"),
    factoresRiesgo: formData.get("factoresRiesgo"),
    factoresProtectores: formData.get("factoresProtectores"),
    recursosPersonales: formData.get("recursosPersonales"),
    observacionesClinicasIniciales: formData.get("observacionesClinicasIniciales")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  const expediente = await assertExpedienteOwner(parsed.data.expedienteId, actor.id);

  if (!expediente) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "historia_clinica_update",
      entityType: "historias_clinicas",
      entityId: parsed.data.expedienteId,
      result: "denied",
      context: "audit_historia_clinica_update_denied"
    });

    return { message: "No tienes permiso para modificar esta historia clinica.", ok: false };
  }

  if (expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "historia_clinica_update",
      entityType: "historias_clinicas",
      entityId: expediente.id,
      result: "denied",
      context: "audit_historia_clinica_update_denied_not_active"
    });

    return { message: "El expediente no esta activo y no puede modificarse.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("historias_clinicas").insert({
      expediente_id: expediente.id,
      created_by: actor.id,
      motivo_consulta: parsed.data.motivoConsulta,
      historia_problema_actual: parsed.data.historiaProblemaActual,
      antecedentes_psicologicos: parsed.data.antecedentesPsicologicos,
      antecedentes_psiquiatricos: parsed.data.antecedentesPsiquiatricos,
      antecedentes_medicos: parsed.data.antecedentesMedicos,
      antecedentes_familiares: parsed.data.antecedentesFamiliares,
      antecedentes_tratamiento: parsed.data.antecedentesTratamiento,
      antecedentes_medicacion: parsed.data.antecedentesMedicacion,
      contexto_familiar: parsed.data.contextoFamiliar,
      contexto_relacional: parsed.data.contextoRelacional,
      contexto_laboral_academico: parsed.data.contextoLaboralAcademico,
      contexto_espiritual_religioso: parsed.data.contextoEspiritualReligioso,
      factores_riesgo: parsed.data.factoresRiesgo,
      factores_protectores: parsed.data.factoresProtectores,
      recursos_personales: parsed.data.recursosPersonales,
      observaciones_clinicas_iniciales: parsed.data.observacionesClinicasIniciales
    });

  if (error) {
    Sentry.captureException(error, {
      extra: {
        expediente_id: expediente.id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "historia_clinica_update",
      entityType: "historias_clinicas",
      entityId: expediente.id,
      result: "error",
      context: "audit_historia_clinica_update_error"
    });

    return { message: "No fue posible actualizar la historia clinica.", ok: false };
  }

  await supabaseAdmin
    .from("expedientes")
    .update({ last_clinical_activity_at: new Date().toISOString() })
    .eq("id", expediente.id);

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "historia_clinica_update",
    entityType: "historias_clinicas",
    entityId: expediente.id,
    result: "success",
    context: "audit_historia_clinica_update_success"
  });

  revalidatePath(`/professional/expedientes/${expediente.id}`);

  return { message: "Nueva version de historia clinica guardada.", ok: true };
}

export async function updateConsentimientoAction(
  _previousState: ExpedienteActionState,
  formData: FormData
): Promise<ExpedienteActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = consentimientoSchema.safeParse({
    expedienteId: formData.get("expedienteId"),
    status: formData.get("status"),
    acceptanceActorPhone: formData.get("acceptanceActorPhone"),
    acceptanceActorRfc: formData.get("acceptanceActorRfc"),
    legalAcceptance: formData.get("legalAcceptance")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  const fileResult = consentFileSchema.safeParse(formData.get("consentDocument"));

  if (!fileResult.success) {
    return { message: fileResult.error.issues[0]?.message ?? "Archivo invalido.", ok: false };
  }

  const expediente = await assertExpedienteOwner(parsed.data.expedienteId, actor.id);

  if (!expediente) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "consentimiento_update",
      entityType: "consentimientos",
      entityId: parsed.data.expedienteId,
      result: "denied",
      context: "audit_consentimiento_update_denied"
    });

    return { message: "No tienes permiso para modificar este consentimiento.", ok: false };
  }

  if (expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "consentimiento_update",
      entityType: "consentimientos",
      entityId: expediente.id,
      result: "denied",
      context: "audit_consentimiento_update_denied_not_active"
    });

    return { message: "El expediente no esta activo y no puede modificarse.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: existingConsent } = await supabaseAdmin
    .from("consentimientos")
    .select("document_storage_path, document_file_name, document_content_type, document_size_bytes")
    .eq("expediente_id", expediente.id)
    .eq("consent_flow", "custom")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const consentFile = fileResult.data;
  const hasNewFile = Boolean(consentFile && consentFile.size > 0);
  const hasExistingFile = Boolean(existingConsent?.document_storage_path);

  if (
    parsed.data.status !== "pendiente" &&
    parsed.data.status !== "excepcion_justificada" &&
    !hasNewFile &&
    !hasExistingFile
  ) {
    return {
      message: "Sube el archivo o foto del consentimiento antes de marcarlo como firmado.",
      ok: false
    };
  }

  let uploadedDocument:
    | {
        path: string;
        fileName: string;
        contentType: string;
        size: number;
      }
    | null = null;

  if (hasNewFile && consentFile) {
    const fileName = safeFileName(consentFile.name || "consentimiento");
    const storagePath = `${actor.id}/${expediente.id}/${randomUUID()}-${fileName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("clinical-consents")
      .upload(storagePath, Buffer.from(await consentFile.arrayBuffer()), {
        contentType: consentFile.type || "application/octet-stream",
        upsert: false
      });

    if (uploadError) {
      Sentry.captureException(uploadError, {
        extra: {
          expediente_id: expediente.id,
          file_name: fileName
        }
      });

      await safeWriteAuditLog({
        userId: actor.id,
        role: actor.role,
        action: "consentimiento_document_upload",
        entityType: "consentimientos",
        entityId: expediente.id,
        result: "error",
        context: "audit_consentimiento_document_upload_error"
      });

      return { message: "No fue posible subir el archivo del consentimiento.", ok: false };
    }

    uploadedDocument = {
      path: storagePath,
      fileName,
      contentType: consentFile.type || "application/octet-stream",
      size: consentFile.size
    };
  }

  const acceptedAt = new Date().toISOString();
  const acceptanceFolio = createFolio("CONS");
  const sessionReference = randomUUID();
  const { ipAddress, userAgent } = await getRequestContext();
  const acceptanceDocument = JSON.stringify({
    folio: acceptanceFolio,
    document:
      uploadedDocument?.fileName ??
      existingConsent?.document_file_name ??
      existingConsent?.document_storage_path ??
      "sin_archivo",
    document_version: "1.0",
    accepted_at: acceptedAt,
    actor_id: actor.id,
    actor_role: actor.role,
    actor_full_name: actor.full_name,
    actor_email: actor.email,
    actor_phone: parsed.data.acceptanceActorPhone,
    actor_rfc: parsed.data.acceptanceActorRfc.toUpperCase(),
    ip_address: ipAddress,
    method: "Checkbox + boton Registrar consentimiento; codigo de 6 digitos pendiente MVP",
    session_reference: sessionReference,
    expediente_id: expediente.id,
    consent_status: parsed.data.status
  });

  const { error } = await supabaseAdmin.from("consentimientos").insert({
    expediente_id: expediente.id,
    status: parsed.data.status,
    signed_at: acceptedAt.slice(0, 10),
    modality: consentModalityForStatus(parsed.data.status),
    consent_flow: "custom",
    document_reference: uploadedDocument?.fileName ?? existingConsent?.document_file_name ?? null,
    document_storage_path: uploadedDocument?.path ?? existingConsent?.document_storage_path ?? null,
    document_file_name: uploadedDocument?.fileName ?? existingConsent?.document_file_name ?? null,
    document_content_type:
      uploadedDocument?.contentType ?? existingConsent?.document_content_type ?? null,
    document_size_bytes: uploadedDocument?.size ?? existingConsent?.document_size_bytes ?? null,
    obtained_by_professional_id: actor.id,
    registered_by: actor.id,
    document_uploaded_at: uploadedDocument ? acceptedAt : null,
    acceptance_folio: acceptanceFolio,
    acceptance_document:
      uploadedDocument?.fileName ??
      existingConsent?.document_file_name ??
      existingConsent?.document_storage_path ??
      null,
    acceptance_document_version: "1.0",
    legal_accepted_at: acceptedAt,
    acceptance_actor_full_name: actor.full_name,
    acceptance_actor_email: actor.email,
    acceptance_actor_phone: parsed.data.acceptanceActorPhone,
    acceptance_actor_rfc: parsed.data.acceptanceActorRfc.toUpperCase(),
    acceptance_ip: ipAddress,
    acceptance_user_agent: userAgent,
    acceptance_method: "Checkbox + boton Registrar consentimiento; codigo de 6 digitos pendiente MVP",
    acceptance_document_hash: sha256(acceptanceDocument),
    acceptance_session_reference: sessionReference
  });

  if (!error) {
    await supabaseAdmin
      .from("expedientes")
      .update({
        consent_status: parsed.data.status,
        last_clinical_activity_at: new Date().toISOString()
      })
      .eq("id", expediente.id);
  }

  if (error) {
    if (uploadedDocument) {
      await supabaseAdmin.storage.from("clinical-consents").remove([uploadedDocument.path]);
    }

    Sentry.captureException(error, {
      extra: {
        expediente_id: expediente.id,
        consent_status: parsed.data.status
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "consentimiento_update",
      entityType: "consentimientos",
      entityId: expediente.id,
      result: "error",
      context: "audit_consentimiento_update_error"
    });

    return { message: "No fue posible registrar el consentimiento.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "consentimiento_update",
    entityType: "consentimientos",
    entityId: expediente.id,
    result: "success",
    metadata: {
      consent_status: parsed.data.status,
      acceptance_folio: acceptanceFolio
    },
    context: "audit_consentimiento_update_success"
  });

  revalidatePath(`/professional/expedientes/${expediente.id}`);
  revalidatePath("/professional/expedientes");

  return { message: "Consentimiento registrado.", ok: true };
}

export async function sendStandardConsentAction(
  _previousState: ExpedienteActionState,
  formData: FormData
): Promise<ExpedienteActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = sendStandardConsentSchema.safeParse({
    expedienteId: formData.get("expedienteId")
  });

  if (!parsed.success) {
    return { message: "Datos invalidos.", ok: false };
  }

  const expediente = await assertExpedienteOwner(parsed.data.expedienteId, actor.id);

  if (!expediente || expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "consentimiento_standard_send",
      entityType: "consentimientos",
      entityId: parsed.data.expedienteId,
      result: "denied",
      context: "audit_consentimiento_standard_send_denied"
    });

    return { message: "Solo puedes enviar consentimiento en expedientes activos propios.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: patient, error: patientError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", expediente.patient_id)
    .single();

  if (patientError || !patient) {
    return { message: "No fue posible cargar los datos del paciente.", ok: false };
  }

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("consentimientos").insert({
    expediente_id: expediente.id,
    status: "pendiente",
    modality: "digital",
    consent_flow: "standard",
    document_reference: STANDARD_CONSENT_TITLE,
    obtained_by_professional_id: actor.id,
    registered_by: actor.id,
    standard_document_title: STANDARD_CONSENT_TITLE,
    standard_document_version: STANDARD_CONSENT_VERSION,
    standard_sent_at: now,
    standard_sent_by_professional_id: actor.id
  });

  if (!error) {
    await supabaseAdmin
      .from("expedientes")
      .update({
        consent_status: "pendiente",
        last_clinical_activity_at: now
      })
      .eq("id", expediente.id);
  }

  if (error) {
    Sentry.captureException(error, {
      extra: {
        expediente_id: expediente.id,
        context: "standard_consent_insert"
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "consentimiento_standard_send",
      entityType: "consentimientos",
      entityId: expediente.id,
      result: "error",
      context: "audit_consentimiento_standard_send_error"
    });

    return { message: "No fue posible enviar el consentimiento estandar.", ok: false };
  }

  const emailResult = await sendEmail({
    to: patient.email as string,
    subject: "Consentimiento informado disponible",
    html: `<p>Hola ${patient.full_name},</p><p>Tu profesional envio el consentimiento informado estandar para revision y firma en tu portal de paciente.</p><p>Ingresa a Catholizare para leerlo y firmarlo.</p><pre>${standardConsentPlainText()}</pre>`,
    text: `Hola ${patient.full_name},\n\nTu profesional envio el consentimiento informado estandar para revision y firma en tu portal de paciente.\n\nIngresa a Catholizare para leerlo y firmarlo.\n\n${standardConsentPlainText()}`
  });

  if (!emailResult.ok) {
    Sentry.captureMessage("standard_consent_notification_email_failed", {
      level: "warning",
      extra: {
        expediente_id: expediente.id,
        patient_id: patient.id,
        error: emailResult.error
      }
    });
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "consentimiento_standard_send",
    entityType: "consentimientos",
    entityId: expediente.id,
    result: "success",
    metadata: {
      document: STANDARD_CONSENT_TITLE,
      version: STANDARD_CONSENT_VERSION,
      email_sent: emailResult.ok
    },
    context: "audit_consentimiento_standard_send_success"
  });

  revalidatePath(`/professional/expedientes/${expediente.id}`);
  revalidatePath("/portal");

  return {
    message: "El consentimiento informado estandar se hizo llegar al paciente en su portal.",
    ok: true
  };
}

export async function updateLifeHistoryAccessAction(
  _previousState: ExpedienteActionState,
  formData: FormData
): Promise<ExpedienteActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = lifeHistorySchema.safeParse({
    expedienteId: formData.get("expedienteId"),
    mode: formData.get("mode")
  });

  if (!parsed.success) {
    return { message: "Datos invalidos.", ok: false };
  }

  const expediente = await assertExpedienteOwner(parsed.data.expedienteId, actor.id);

  if (!expediente || expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "patient_life_history_access",
      entityType: "patient_life_histories",
      entityId: parsed.data.expedienteId,
      result: "denied",
      context: "audit_patient_life_history_access_denied"
    });

    return { message: "Solo puedes activar historias de vida en expedientes activos propios.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data: existing } = await supabaseAdmin
    .from("patient_life_histories")
    .select("id, status")
    .eq("expediente_id", expediente.id)
    .maybeSingle();

  const nextStatus = parsed.data.mode === "reopen" ? "reabierta" : "borrador";

  if (existing && parsed.data.mode === "activate" && existing.status !== "inactiva") {
    return { message: "La historia de vida ya fue activada para este paciente.", ok: false };
  }

  if (parsed.data.mode === "reopen" && existing?.status !== "enviada") {
    return { message: "Solo puedes reabrir una historia de vida enviada.", ok: false };
  }

  const payload =
    parsed.data.mode === "reopen"
      ? {
          status: nextStatus,
          reopened_by_professional_id: actor.id,
          reopened_at: now
        }
      : {
          status: nextStatus,
          activated_by_professional_id: actor.id,
          activated_at: now
        };

  const { data, error } = existing
    ? await supabaseAdmin
        .from("patient_life_histories")
        .update(payload)
        .eq("id", existing.id)
        .select("id")
        .single()
    : await supabaseAdmin
        .from("patient_life_histories")
        .insert({
          expediente_id: expediente.id,
          patient_id: expediente.patient_id,
          professional_id: actor.id,
          ...payload
        })
        .select("id")
        .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Life history access update did not return id"), {
      extra: {
        expediente_id: expediente.id,
        mode: parsed.data.mode
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "patient_life_history_access",
      entityType: "patient_life_histories",
      entityId: expediente.id,
      result: "error",
      context: "audit_patient_life_history_access_error"
    });

    return { message: "No fue posible actualizar el acceso a la historia de vida.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "patient_life_history_access",
    entityType: "patient_life_histories",
    entityId: data.id,
    result: "success",
    metadata: {
      mode: parsed.data.mode,
      next_status: nextStatus
    },
    context: "audit_patient_life_history_access_success"
  });

  revalidatePath(`/professional/expedientes/${expediente.id}`);
  revalidatePath("/portal");

  return {
    message:
      parsed.data.mode === "reopen"
        ? "Historia de vida reabierta para edicion del paciente."
        : "Historia de vida activada para el paciente.",
    ok: true
  };
}

export async function archiveExpedienteAction(
  _previousState: ExpedienteActionState,
  formData: FormData
): Promise<ExpedienteActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = archiveSchema.safeParse({
    expedienteId: formData.get("expedienteId")
  });

  if (!parsed.success) {
    return { message: "Datos invalidos.", ok: false };
  }

  const expediente = await assertExpedienteOwner(parsed.data.expedienteId, actor.id);

  if (!expediente) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "expediente_archive",
      entityType: "expedientes",
      entityId: parsed.data.expedienteId,
      result: "denied",
      context: "audit_expediente_archive_denied"
    });

    return { message: "No tienes permiso para archivar este expediente.", ok: false };
  }

  if (expediente.status !== "activo") {
    return { message: "Solo los expedientes activos pueden archivarse.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("expedientes")
    .update({
      status: "archivado",
      archived_at: new Date().toISOString()
    })
    .eq("id", expediente.id)
    .eq("professional_id", actor.id)
    .eq("status", "activo");

  if (error) {
    Sentry.captureException(error, {
      extra: {
        expediente_id: expediente.id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "expediente_archive",
      entityType: "expedientes",
      entityId: expediente.id,
      result: "error",
      context: "audit_expediente_archive_error"
    });

    return { message: "No fue posible archivar el expediente.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "expediente_archive",
    entityType: "expedientes",
    entityId: expediente.id,
    result: "success",
    context: "audit_expediente_archive_success"
  });

  revalidatePath(`/professional/expedientes/${expediente.id}`);
  revalidatePath("/professional/expedientes");

  return { message: "Expediente archivado.", ok: true };
}
