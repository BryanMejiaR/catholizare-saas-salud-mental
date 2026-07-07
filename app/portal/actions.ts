"use server";

import { createHash, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { getTrustedClientIp } from "@/lib/audit/request-context";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  STANDARD_CONSENT_METHOD,
  STANDARD_CONSENT_PROCEDURE,
  STANDARD_CONSENT_TEXT,
  STANDARD_CONSENT_TITLE,
  STANDARD_CONSENT_VERSION,
  standardConsentHash,
  standardConsentPlainText
} from "@/lib/consent/standard-consent";
import { sendEmail } from "@/lib/email/resend";
import { getServerEnv } from "@/lib/env";
import { LIFE_HISTORY_SECTIONS, type LifeHistoryAnswers } from "@/lib/life-history/schema";
import { APPOINTMENT_REQUEST_TYPES } from "@/lib/portal/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PortalActionState = {
  message?: string;
  ok?: boolean;
};

const appointmentRequestSchema = z.object({
  appointmentId: z.string().uuid(),
  requestType: z.enum(APPOINTMENT_REQUEST_TYPES),
  message: z.string().trim().min(5).max(1200)
});

const reviewSchema = z.object({
  appointmentId: z.string().uuid(),
  score: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1200).optional()
});

const zoomJoinSchema = z.object({
  appointmentId: z.string().uuid()
});

const lifeHistorySchema = z.object({
  lifeHistoryId: z.string().uuid(),
  intent: z.enum(["draft", "submit"])
});

const assessmentUploadSchema = z.object({
  requestId: z.string().uuid()
});

const standardConsentCodeSchema = z.object({
  consentimientoId: z.string().uuid()
});

const acceptStandardConsentSchema = z.object({
  consentimientoId: z.string().uuid(),
  code: z.string().trim().regex(/^\d{4}$/, "Ingresa el codigo de 4 digitos."),
  acceptanceActorPhone: z.string().trim().min(7).max(40),
  acceptanceActorRfc: z.string().trim().min(10).max(20),
  legalAcceptance: z.literal("on")
});

const ALLOWED_ASSESSMENT_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);
const MAX_ASSESSMENT_FILE_BYTES = 10 * 1024 * 1024;

async function getActivePatient() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "paciente" || profile.account_status !== "activo") {
    return null;
  }

  return profile;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createFolio(prefix: string) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

function hashSignatureCode(consentimientoId: string, patientId: string, code: string) {
  return sha256(`${consentimientoId}:${patientId}:${code}`);
}

function codeMatches(expectedHash: string | null, consentimientoId: string, patientId: string, code: string) {
  if (!expectedHash) {
    return false;
  }

  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(hashSignatureCode(consentimientoId, patientId, code), "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function getRequestContext() {
  const headerStore = await headers();

  return {
    ipAddress: getTrustedClientIp(headerStore),
    userAgent: headerStore.get("user-agent")
  };
}

async function getPendingStandardConsent(consentimientoId: string, patientId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: consentimiento, error } = await supabaseAdmin
    .from("consentimientos")
    .select(
      "id, expediente_id, status, signature_code_hash, signature_code_expires_at, signature_code_attempts"
    )
    .eq("id", consentimientoId)
    .eq("consent_flow", "standard")
    .eq("status", "pendiente")
    .single();

  if (error || !consentimiento) {
    return null;
  }

  const { data: expediente, error: expedienteError } = await supabaseAdmin
    .from("expedientes")
    .select("id, patient_id, professional_id, status")
    .eq("id", consentimiento.expediente_id)
    .eq("patient_id", patientId)
    .eq("status", "activo")
    .single();

  if (expedienteError || !expediente) {
    return null;
  }

  return {
    consentimiento: consentimiento as {
      id: string;
      expediente_id: string;
      status: "pendiente";
      signature_code_hash: string | null;
      signature_code_expires_at: string | null;
      signature_code_attempts: number;
    },
    expediente: expediente as {
      id: string;
      patient_id: string;
      professional_id: string;
      status: string;
    }
  };
}

function renderLegalAcceptanceEmail(input: {
  folio: string;
  acceptedAt: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientRfc: string;
  professionalName: string;
  professionalEmail: string;
  ipAddress: string | null;
  userAgent: string | null;
  sessionReference: string;
  documentHash: string;
}) {
  const legalRows = [
    ["Nombre de procedimiento", STANDARD_CONSENT_PROCEDURE],
    ["Folio de aceptacion", input.folio],
    ["Documento", STANDARD_CONSENT_TITLE],
    ["Version", STANDARD_CONSENT_VERSION],
    ["Fecha y hora", input.acceptedAt],
    ["Nombre completo del paciente", input.patientName],
    ["Correo electronico del paciente", input.patientEmail],
    ["Telefono", input.patientPhone],
    ["RFC", input.patientRfc],
    ["Profesional responsable", input.professionalName],
    ["Correo del profesional", input.professionalEmail],
    ["Direccion IP", input.ipAddress ?? "no disponible"],
    ["Metodo de aceptacion", STANDARD_CONSENT_METHOD],
    ["HASH del documento", input.documentHash],
    ["Referencia de sesion", input.sessionReference],
    ["User agent", input.userAgent ?? "no disponible"]
  ];
  const rowsHtml = legalRows
    .map(
      ([label, value]) =>
        `<tr><th style="text-align:left;padding:6px;border:1px solid #ddd;">${label}</th><td style="padding:6px;border:1px solid #ddd;">${value}</td></tr>`
    )
    .join("");
  const textRows = legalRows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const acceptedHtml = STANDARD_CONSENT_TEXT.map(
    (section) => `<h3>${section.title}</h3><p>${section.body}</p>`
  ).join("");

  return {
    html: `<p>Haz aceptado el consentimiento informado hemos enviado una copia a tu correo</p><table style="border-collapse:collapse;">${rowsHtml}</table><h2>Informacion aceptada</h2>${acceptedHtml}`,
    text: `Haz aceptado el consentimiento informado hemos enviado una copia a tu correo\n\n${textRows}\n\nInformacion aceptada\n\n${standardConsentPlainText()}`
  };
}

function safeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function getFormFile(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function hasAllowedFileSignature(bytes: Buffer, contentType: string) {
  if (contentType === "application/pdf") {
    return bytes.subarray(0, 4).toString("ascii") === "%PDF";
  }

  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (contentType === "image/png") {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (contentType === "image/webp") {
    return (
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
}

async function getPatientAppointment(appointmentId: string, patientId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("citas")
    .select(
      "id, patient_id, professional_id, scheduled_at, duration_minutes, status, zoom_join_url"
    )
    .eq("id", appointmentId)
    .eq("patient_id", patientId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    patient_id: string;
    professional_id: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    zoom_join_url: string | null;
  };
}

function collectLifeHistoryAnswers(formData: FormData) {
  const answers: LifeHistoryAnswers = {};

  for (const section of LIFE_HISTORY_SECTIONS) {
    for (const field of section.fields) {
      if (field.type === "checkbox_group") {
        const values = formData
          .getAll(field.id)
          .map((value) => `${value}`.trim())
          .filter(Boolean);
        answers[field.id] = values.slice(0, 30);

        if (field.otherFieldId) {
          answers[field.otherFieldId] = `${formData.get(field.otherFieldId) ?? ""}`
            .trim()
            .slice(0, 5000);
        }
      } else {
        answers[field.id] = `${formData.get(field.id) ?? ""}`.trim().slice(0, 5000);
      }
    }
  }

  return answers;
}

export async function createAppointmentRequestAction(
  _previousState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  const patient = await getActivePatient();

  if (!patient) {
    return { message: "No tienes una sesion de Paciente activa.", ok: false };
  }

  const parsed = appointmentRequestSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    requestType: formData.get("requestType"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return { message: "Completa la solicitud con un mensaje valido.", ok: false };
  }

  const appointment = await getPatientAppointment(parsed.data.appointmentId, patient.id);

  if (
    !appointment ||
    appointment.status !== "programada" ||
    new Date(appointment.scheduled_at).getTime() <= Date.now()
  ) {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_appointment_request",
      entityType: "patient_appointment_requests",
      entityId: parsed.data.appointmentId,
      result: "denied",
      context: "audit_portal_appointment_request_denied"
    });

    return { message: "Solo puedes solicitar cambios sobre citas futuras programadas.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("patient_appointment_requests").insert({
    appointment_id: appointment.id,
    patient_id: patient.id,
    professional_id: appointment.professional_id,
    request_type: parsed.data.requestType,
    message: parsed.data.message
  });

  if (error) {
    if (error.code === "23505") {
      return { message: "Ya enviaste una solicitud para esta cita.", ok: false };
    }

    Sentry.captureException(error, {
      extra: {
        context: "portal_appointment_request_create",
        appointment_id: appointment.id,
        patient_id: patient.id
      }
    });

    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_appointment_request",
      entityType: "patient_appointment_requests",
      entityId: appointment.id,
      result: "error",
      context: "audit_portal_appointment_request_error"
    });

    return { message: "No fue posible enviar la solicitud.", ok: false };
  }

  await safeWriteAuditLog({
    userId: patient.id,
    role: patient.role,
    action: "portal_appointment_request",
    entityType: "patient_appointment_requests",
    entityId: appointment.id,
    result: "success",
    metadata: {
      request_type: parsed.data.requestType
    },
    context: "audit_portal_appointment_request_success"
  });

  revalidatePath("/portal");

  return { message: "Solicitud enviada.", ok: true };
}

export async function saveLifeHistoryAction(
  _previousState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  const patient = await getActivePatient();

  if (!patient) {
    return { message: "No tienes una sesion de Paciente activa.", ok: false };
  }

  const parsed = lifeHistorySchema.safeParse({
    lifeHistoryId: formData.get("lifeHistoryId"),
    intent: formData.get("intent")
  });

  if (!parsed.success) {
    return { message: "Datos de historia de vida invalidos.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: lifeHistory, error: loadError } = await supabaseAdmin
    .from("patient_life_histories")
    .select("id, expediente_id, patient_id, professional_id, status, submitted_at")
    .eq("id", parsed.data.lifeHistoryId)
    .eq("patient_id", patient.id)
    .single();

  if (loadError || !lifeHistory || !["borrador", "reabierta"].includes(lifeHistory.status)) {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_life_history_update",
      entityType: "patient_life_histories",
      entityId: parsed.data.lifeHistoryId,
      result: "denied",
      context: "audit_portal_life_history_update_denied"
    });

    return { message: "La historia de vida no esta disponible para edicion.", ok: false };
  }

  const nextStatus = parsed.data.intent === "submit" ? "enviada" : lifeHistory.status;
  const updatePayload = {
    answers: collectLifeHistoryAnswers(formData),
    status: nextStatus,
    ...(parsed.data.intent === "submit" ? { submitted_at: new Date().toISOString() } : {})
  };
  const { error } = await supabaseAdmin
    .from("patient_life_histories")
    .update(updatePayload)
    .eq("id", lifeHistory.id)
    .eq("patient_id", patient.id)
    .in("status", ["borrador", "reabierta"]);

  if (error) {
    Sentry.captureException(error, {
      extra: {
        life_history_id: lifeHistory.id,
        patient_id: patient.id
      }
    });

    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_life_history_update",
      entityType: "patient_life_histories",
      entityId: lifeHistory.id,
      result: "error",
      context: "audit_portal_life_history_update_error"
    });

    return { message: "No fue posible guardar la historia de vida.", ok: false };
  }

  await safeWriteAuditLog({
    userId: patient.id,
    role: patient.role,
    action: "portal_life_history_update",
    entityType: "patient_life_histories",
    entityId: lifeHistory.id,
    result: "success",
    metadata: {
      intent: parsed.data.intent,
      next_status: nextStatus
    },
    context: "audit_portal_life_history_update_success"
  });

  revalidatePath("/portal");

  return {
    message:
      parsed.data.intent === "submit"
        ? "Historia de vida enviada a tu profesional."
        : "Borrador guardado.",
    ok: true
  };
}

export async function uploadAssessmentDocumentAction(
  _previousState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  const patient = await getActivePatient();

  if (!patient) {
    return { message: "No tienes una sesion de Paciente activa.", ok: false };
  }

  const parsed = assessmentUploadSchema.safeParse({
    requestId: formData.get("requestId")
  });
  const file = getFormFile(formData, "assessmentFile");

  if (!parsed.success || !file) {
    return { message: "Selecciona la prueba y adjunta un archivo valido.", ok: false };
  }

  if (!ALLOWED_ASSESSMENT_FILE_TYPES.has(file.type) || file.size > MAX_ASSESSMENT_FILE_BYTES) {
    return { message: "Solo se aceptan PDF, JPG, PNG o WEBP de hasta 10 MB.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: request, error: requestError } = await supabaseAdmin
    .from("patient_assessment_requests")
    .select(
      "id, expediente_id, patient_id, professional_id, assessment_code, assessment_label, status"
    )
    .eq("id", parsed.data.requestId)
    .eq("patient_id", patient.id)
    .single();

  if (requestError || !request || request.status !== "pendiente") {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_assessment_upload",
      entityType: "patient_assessment_requests",
      entityId: parsed.data.requestId,
      result: "denied",
      context: "audit_portal_assessment_upload_request_denied"
    });

    return { message: "Esta prueba no esta disponible para subir.", ok: false };
  }

  const { data: expediente, error: expedienteError } = await supabaseAdmin
    .from("expedientes")
    .select("id, patient_id, professional_id, status")
    .eq("id", request.expediente_id)
    .eq("patient_id", patient.id)
    .single();

  if (expedienteError || !expediente || expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_assessment_upload",
      entityType: "patient_assessment_uploads",
      entityId: request.expediente_id,
      result: "denied",
      context: "audit_portal_assessment_upload_denied"
    });

    return { message: "No puedes subir pruebas para este expediente.", ok: false };
  }

  const sanitizedName = safeFileName(file.name) || "prueba";
  const storagePath = `${patient.id}/${expediente.id}/${randomUUID()}-${sanitizedName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (!hasAllowedFileSignature(bytes, file.type)) {
    return { message: "El contenido del archivo no coincide con el tipo permitido.", ok: false };
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from("assessment-submissions")
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    Sentry.captureException(uploadError, {
      extra: {
        context: "portal_assessment_storage_upload",
        patient_id: patient.id,
        expediente_id: expediente.id
      }
    });

    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_assessment_upload",
      entityType: "patient_assessment_uploads",
      entityId: expediente.id,
      result: "error",
      context: "audit_portal_assessment_upload_storage_error"
    });

    return { message: "No fue posible subir el archivo.", ok: false };
  }

  const { data: upload, error: insertError } = await supabaseAdmin
    .from("patient_assessment_uploads")
    .insert({
      expediente_id: expediente.id,
      patient_id: patient.id,
      professional_id: expediente.professional_id,
      assessment_code: request.assessment_code,
      assessment_label: request.assessment_label,
      request_id: request.id,
      file_storage_path: storagePath,
      file_name: sanitizedName,
      file_content_type: file.type,
      file_size_bytes: file.size
    })
    .select("id")
    .single();

  if (insertError || !upload) {
    Sentry.captureException(insertError, {
      extra: {
        context: "portal_assessment_upload_insert",
        patient_id: patient.id,
        expediente_id: expediente.id
      }
    });

    await supabaseAdmin.storage.from("assessment-submissions").remove([storagePath]);
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_assessment_upload",
      entityType: "patient_assessment_uploads",
      entityId: expediente.id,
      result: "error",
      context: "audit_portal_assessment_upload_insert_error"
    });

    return { message: "No fue posible registrar la prueba.", ok: false };
  }

  const { error: requestUpdateError } = await supabaseAdmin
    .from("patient_assessment_requests")
    .update({
      status: "subida",
      uploaded_at: new Date().toISOString(),
      upload_id: upload.id
    })
    .eq("id", request.id)
    .eq("patient_id", patient.id)
    .eq("status", "pendiente");

  if (requestUpdateError) {
    Sentry.captureException(requestUpdateError, {
      extra: {
        context: "portal_assessment_request_mark_uploaded",
        request_id: request.id,
        upload_id: upload.id
      }
    });
  }

  await safeWriteAuditLog({
    userId: patient.id,
    role: patient.role,
    action: "portal_assessment_upload",
    entityType: "patient_assessment_uploads",
    entityId: expediente.id,
    result: "success",
    metadata: {
      assessment_code: request.assessment_code,
      request_id: request.id,
      file_content_type: file.type,
      file_size_bytes: file.size
    },
    context: "audit_portal_assessment_upload_success"
  });

  revalidatePath("/portal");

  return { message: "Prueba enviada a tu profesional.", ok: true };
}

export async function requestStandardConsentCodeAction(
  _previousState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  const patient = await getActivePatient();

  if (!patient) {
    return { message: "No tienes una sesion de Paciente activa.", ok: false };
  }

  const parsed = standardConsentCodeSchema.safeParse({
    consentimientoId: formData.get("consentimientoId")
  });

  if (!parsed.success) {
    return { message: "Datos invalidos.", ok: false };
  }

  const pending = await getPendingStandardConsent(parsed.data.consentimientoId, patient.id);

  if (!pending) {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_standard_consent_code",
      entityType: "consentimientos",
      entityId: parsed.data.consentimientoId,
      result: "denied",
      context: "audit_portal_standard_consent_code_denied"
    });

    return { message: "No fue posible encontrar un consentimiento pendiente.", ok: false };
  }

  const code = String(randomInt(0, 10000)).padStart(4, "0");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("consentimientos")
    .update({
      signature_code_hash: hashSignatureCode(pending.consentimiento.id, patient.id, code),
      signature_code_expires_at: expiresAt,
      signature_code_sent_at: new Date().toISOString(),
      signature_code_attempts: 0
    })
    .eq("id", pending.consentimiento.id)
    .eq("status", "pendiente");

  if (error) {
    Sentry.captureException(error, {
      extra: {
        context: "standard_consent_code_update",
        consentimiento_id: pending.consentimiento.id
      }
    });

    return { message: "No fue posible generar el codigo de firma.", ok: false };
  }

  const emailResult = await sendEmail({
    to: patient.email,
    subject: "Codigo para firmar consentimiento informado",
    html: `<p>Tu codigo para firmar el consentimiento informado es:</p><p style="font-size:24px;font-weight:700;">${code}</p><p>Este codigo vence en 10 minutos.</p>`,
    text: `Tu codigo para firmar el consentimiento informado es: ${code}\n\nEste codigo vence en 10 minutos.`
  });

  if (!emailResult.ok) {
    Sentry.captureMessage("standard_consent_code_email_failed", {
      level: "warning",
      extra: {
        consentimiento_id: pending.consentimiento.id,
        patient_id: patient.id,
        error: emailResult.error
      }
    });

    return { message: "No fue posible enviar el codigo por correo.", ok: false };
  }

  await safeWriteAuditLog({
    userId: patient.id,
    role: patient.role,
    action: "portal_standard_consent_code",
    entityType: "consentimientos",
    entityId: pending.consentimiento.id,
    result: "success",
    context: "audit_portal_standard_consent_code_success"
  });

  return { message: "Enviamos un codigo de 4 digitos a tu correo.", ok: true };
}

export async function acceptStandardConsentAction(
  _previousState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  const patient = await getActivePatient();

  if (!patient) {
    return { message: "No tienes una sesion de Paciente activa.", ok: false };
  }

  const parsed = acceptStandardConsentSchema.safeParse({
    consentimientoId: formData.get("consentimientoId"),
    code: formData.get("code"),
    acceptanceActorPhone: formData.get("acceptanceActorPhone"),
    acceptanceActorRfc: formData.get("acceptanceActorRfc"),
    legalAcceptance: formData.get("legalAcceptance")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  const pending = await getPendingStandardConsent(parsed.data.consentimientoId, patient.id);

  if (!pending) {
    return { message: "No fue posible encontrar un consentimiento pendiente.", ok: false };
  }

  const attempts = pending.consentimiento.signature_code_attempts ?? 0;
  const expiresAt = pending.consentimiento.signature_code_expires_at
    ? new Date(pending.consentimiento.signature_code_expires_at).getTime()
    : 0;
  const isValidCode =
    attempts < 5 &&
    expiresAt >= Date.now() &&
    codeMatches(
      pending.consentimiento.signature_code_hash,
      pending.consentimiento.id,
      patient.id,
      parsed.data.code
    );

  if (!isValidCode) {
    const supabaseAdmin = createSupabaseAdminClient();
    await supabaseAdmin
      .from("consentimientos")
      .update({ signature_code_attempts: attempts + 1 })
      .eq("id", pending.consentimiento.id);

    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_standard_consent_accept",
      entityType: "consentimientos",
      entityId: pending.consentimiento.id,
      result: "denied",
      context: "audit_portal_standard_consent_accept_denied_code"
    });

    return { message: "El codigo no es valido o ya expiro.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const [{ data: professional }, { ipAddress, userAgent }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", pending.expediente.professional_id)
      .single()
      .then((result) => result),
    getRequestContext()
  ]);
  const acceptedAt = new Date().toISOString();
  const acceptanceFolio = createFolio("CONS-PAC");
  const sessionReference = randomUUID();
  const patientRfc = parsed.data.acceptanceActorRfc.toUpperCase();
  const acceptanceDocument = JSON.stringify({
    folio: acceptanceFolio,
    procedure: STANDARD_CONSENT_PROCEDURE,
    document: STANDARD_CONSENT_TITLE,
    document_version: STANDARD_CONSENT_VERSION,
    standard_document_hash: standardConsentHash(),
    accepted_at: acceptedAt,
    actor_id: patient.id,
    actor_role: patient.role,
    actor_full_name: patient.full_name,
    actor_email: patient.email,
    actor_phone: parsed.data.acceptanceActorPhone,
    actor_rfc: patientRfc,
    professional_id: pending.expediente.professional_id,
    professional_full_name: professional?.full_name ?? "Profesional no disponible",
    professional_email: professional?.email ?? "",
    ip_address: ipAddress,
    user_agent: userAgent,
    method: STANDARD_CONSENT_METHOD,
    session_reference: sessionReference,
    expediente_id: pending.expediente.id,
    consent_status: "firmado_digital"
  });
  const acceptanceHash = sha256(acceptanceDocument);

  const { error } = await supabaseAdmin.from("consentimientos").insert({
    expediente_id: pending.expediente.id,
    status: "firmado_digital",
    signed_at: acceptedAt.slice(0, 10),
    modality: "digital",
    consent_flow: "standard",
    document_reference: STANDARD_CONSENT_TITLE,
    obtained_by_professional_id: pending.expediente.professional_id,
    registered_by: patient.id,
    standard_document_title: STANDARD_CONSENT_TITLE,
    standard_document_version: STANDARD_CONSENT_VERSION,
    acceptance_folio: acceptanceFolio,
    acceptance_document: STANDARD_CONSENT_TITLE,
    acceptance_document_version: STANDARD_CONSENT_VERSION,
    legal_accepted_at: acceptedAt,
    acceptance_actor_full_name: patient.full_name,
    acceptance_actor_email: patient.email,
    acceptance_actor_phone: parsed.data.acceptanceActorPhone,
    acceptance_actor_rfc: patientRfc,
    acceptance_ip: ipAddress,
    acceptance_user_agent: userAgent,
    acceptance_method: STANDARD_CONSENT_METHOD,
    acceptance_document_hash: acceptanceHash,
    acceptance_session_reference: sessionReference
  });

  if (!error) {
    await supabaseAdmin
      .from("expedientes")
      .update({
        consent_status: "firmado_digital",
        last_clinical_activity_at: acceptedAt
      })
      .eq("id", pending.expediente.id)
      .eq("patient_id", patient.id);
  }

  if (error) {
    Sentry.captureException(error, {
      extra: {
        context: "standard_consent_accept_insert",
        consentimiento_id: pending.consentimiento.id
      }
    });

    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_standard_consent_accept",
      entityType: "consentimientos",
      entityId: pending.consentimiento.id,
      result: "error",
      context: "audit_portal_standard_consent_accept_error"
    });

    return { message: "No fue posible registrar la aceptacion del consentimiento.", ok: false };
  }

  const env = getServerEnv();
  const email = renderLegalAcceptanceEmail({
    folio: acceptanceFolio,
    acceptedAt,
    patientName: patient.full_name,
    patientEmail: patient.email,
    patientPhone: parsed.data.acceptanceActorPhone,
    patientRfc,
    professionalName: professional?.full_name ?? "Profesional no disponible",
    professionalEmail: professional?.email ?? "",
    ipAddress,
    userAgent,
    sessionReference,
    documentHash: acceptanceHash
  });
  const emailResult = await sendEmail({
    to: [patient.email, env.CATHOLIZARE_LEGAL_EMAIL],
    subject: "Copia de consentimiento informado aceptado",
    html: email.html,
    text: email.text
  });

  if (!emailResult.ok) {
    Sentry.captureMessage("standard_consent_acceptance_email_failed", {
      level: "warning",
      extra: {
        consentimiento_id: pending.consentimiento.id,
        patient_id: patient.id,
        error: emailResult.error
      }
    });
  }

  await safeWriteAuditLog({
    userId: patient.id,
    role: patient.role,
    action: "portal_standard_consent_accept",
    entityType: "consentimientos",
    entityId: pending.consentimiento.id,
    result: "success",
    metadata: {
      acceptance_folio: acceptanceFolio,
      email_sent: emailResult.ok
    },
    context: "audit_portal_standard_consent_accept_success"
  });

  revalidatePath("/portal");
  revalidatePath(`/professional/expedientes/${pending.expediente.id}`);

  return {
    message: "Haz aceptado el consentimiento informado hemos enviado una copia a tu correo",
    ok: true
  };
}

export async function submitExperienceReviewAction(
  _previousState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  const patient = await getActivePatient();

  if (!patient) {
    return { message: "No tienes una sesion de Paciente activa.", ok: false };
  }

  const parsed = reviewSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    score: formData.get("score"),
    comment: `${formData.get("comment") ?? ""}` || undefined
  });

  if (!parsed.success) {
    return { message: "Selecciona una puntuacion valida.", ok: false };
  }

  const appointment = await getPatientAppointment(parsed.data.appointmentId, patient.id);
  const startsAt = appointment ? new Date(appointment.scheduled_at).getTime() : 0;

  if (!appointment || appointment.status !== "completada" || startsAt > Date.now()) {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_experience_review",
      entityType: "patient_experience_reviews",
      entityId: parsed.data.appointmentId,
      result: "denied",
      context: "audit_portal_experience_review_denied"
    });

    return { message: "Solo puedes evaluar citas completadas.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("patient_experience_reviews").insert({
    appointment_id: appointment.id,
    patient_id: patient.id,
    professional_id: appointment.professional_id,
    score: parsed.data.score,
    comment: parsed.data.comment || null
  });

  if (error) {
    if (error.code === "23505") {
      return { message: "Ya enviaste una evaluacion para esta cita.", ok: false };
    }

    Sentry.captureException(error, {
      extra: {
        context: "portal_experience_review_create",
        appointment_id: appointment.id,
        patient_id: patient.id
      }
    });

    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_experience_review",
      entityType: "patient_experience_reviews",
      entityId: appointment.id,
      result: "error",
      context: "audit_portal_experience_review_error"
    });

    return { message: "No fue posible enviar la evaluacion.", ok: false };
  }

  await safeWriteAuditLog({
    userId: patient.id,
    role: patient.role,
    action: "portal_experience_review",
    entityType: "patient_experience_reviews",
    entityId: appointment.id,
    result: "success",
    metadata: {
      score: parsed.data.score
    },
    context: "audit_portal_experience_review_success"
  });

  revalidatePath("/portal");

  return { message: "Evaluacion enviada.", ok: true };
}

export async function openZoomJoinUrlAction(formData: FormData) {
  const patient = await getActivePatient();

  if (!patient) {
    redirect("/auth/login");
  }

  const parsed = zoomJoinSchema.safeParse({
    appointmentId: formData.get("appointmentId")
  });

  if (!parsed.success) {
    redirect("/portal");
  }

  const appointment = await getPatientAppointment(parsed.data.appointmentId, patient.id);
  const now = Date.now();
  const startsAt = appointment ? new Date(appointment.scheduled_at).getTime() : 0;
  const endsAt = appointment ? startsAt + appointment.duration_minutes * 60 * 1000 : 0;
  const canOpen =
    appointment?.status === "programada" &&
    appointment.zoom_join_url &&
    startsAt - now <= 24 * 60 * 60 * 1000 &&
    endsAt > now;

  if (!appointment || !canOpen) {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_zoom_join",
      entityType: "citas",
      entityId: parsed.data.appointmentId,
      result: "denied",
      context: "audit_portal_zoom_join_denied"
    });

    redirect("/portal");
  }

  const joinUrl = appointment.zoom_join_url;

  if (!joinUrl || !joinUrl.startsWith("https://zoom.us/")) {
    redirect("/portal");
  }

  await safeWriteAuditLog({
    userId: patient.id,
    role: patient.role,
    action: "portal_zoom_join",
    entityType: "citas",
    entityId: appointment.id,
    result: "success",
    context: "audit_portal_zoom_join_success"
  });

  redirect(joinUrl);
}
