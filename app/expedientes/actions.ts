"use server";

import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/profile";
import { safeWriteAuditLog } from "@/lib/audit/safe";
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
  sex: optionalText,
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
  modality: z.enum(CONSENTIMIENTO_MODALITIES),
  signedAt: optionalText,
  documentReference: optionalText
});

const archiveSchema = z.object({
  expedienteId: z.string().uuid()
});

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

  const { error: historiaError } = await supabaseAdmin.from("historias_clinicas").insert({
    expediente_id: data.id,
    created_by: actor.id,
    motivo_consulta: parsed.data.initialConsultationReason
  });

  const { error: consentimientoError } = await supabaseAdmin.from("consentimientos").insert({
    expediente_id: data.id,
    status: "pendiente",
    modality: "pendiente",
    registered_by: actor.id
  });

  if (historiaError || consentimientoError) {
    if (historiaError) {
      Sentry.captureException(historiaError, {
        extra: {
          expediente_id: data.id,
          patient_id: parsed.data.patientId,
          professional_id: actor.id,
          failed_step: "historias_clinicas_insert"
        }
      });
    }

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

    const failedStep = historiaError
      ? "historias_clinicas_insert"
      : "consentimientos_insert";

    Sentry.captureMessage("Expediente initialization failed", {
      level: "error",
      extra: {
        expediente_id: data.id,
        patient_id: parsed.data.patientId,
        professional_id: actor.id,
        historia_error: Boolean(historiaError),
        consentimiento_error: Boolean(consentimientoError)
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
        historia_error: Boolean(historiaError),
        consentimiento_error: Boolean(consentimientoError)
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
    sex: parsed.data.sex ?? undefined,
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
    modality: formData.get("modality"),
    signedAt: formData.get("signedAt"),
    documentReference: formData.get("documentReference")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
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
  const { error } = await supabaseAdmin.from("consentimientos").insert({
    expediente_id: expediente.id,
    status: parsed.data.status,
    signed_at: parsed.data.signedAt,
    modality: parsed.data.modality,
    document_reference: parsed.data.documentReference,
    obtained_by_professional_id: actor.id,
    registered_by: actor.id,
    document_uploaded_at: parsed.data.documentReference ? new Date().toISOString() : null
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
      consent_status: parsed.data.status
    },
    context: "audit_consentimiento_update_success"
  });

  revalidatePath(`/professional/expedientes/${expediente.id}`);
  revalidatePath("/professional/expedientes");

  return { message: "Consentimiento registrado.", ok: true };
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
