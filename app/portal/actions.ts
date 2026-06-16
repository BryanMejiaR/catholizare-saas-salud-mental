"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  PATIENT_ASSESSMENT_UPLOAD_LABEL,
  PATIENT_ASSESSMENT_UPLOAD_TYPES
} from "@/lib/evaluaciones/types";
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
  expedienteId: z.string().uuid(),
  assessmentCode: z.enum(PATIENT_ASSESSMENT_UPLOAD_TYPES),
  otherAssessmentLabel: z.string().trim().max(120).optional()
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
    expedienteId: formData.get("expedienteId"),
    assessmentCode: formData.get("assessmentCode"),
    otherAssessmentLabel: `${formData.get("otherAssessmentLabel") ?? ""}` || undefined
  });
  const file = getFormFile(formData, "assessmentFile");

  if (!parsed.success || !file) {
    return { message: "Selecciona la prueba y adjunta un archivo valido.", ok: false };
  }

  if (!ALLOWED_ASSESSMENT_FILE_TYPES.has(file.type) || file.size > MAX_ASSESSMENT_FILE_BYTES) {
    return { message: "Solo se aceptan PDF, JPG, PNG o WEBP de hasta 10 MB.", ok: false };
  }

  const assessmentLabel =
    parsed.data.assessmentCode === "otra"
      ? parsed.data.otherAssessmentLabel?.trim()
      : PATIENT_ASSESSMENT_UPLOAD_LABEL[parsed.data.assessmentCode];

  if (!assessmentLabel || assessmentLabel.length < 2) {
    return { message: "Escribe el nombre de la prueba.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: expediente, error: expedienteError } = await supabaseAdmin
    .from("expedientes")
    .select("id, patient_id, professional_id, status")
    .eq("id", parsed.data.expedienteId)
    .eq("patient_id", patient.id)
    .single();

  if (expedienteError || !expediente || expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_assessment_upload",
      entityType: "patient_assessment_uploads",
      entityId: parsed.data.expedienteId,
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

  const { error: insertError } = await supabaseAdmin.from("patient_assessment_uploads").insert({
    expediente_id: expediente.id,
    patient_id: patient.id,
    professional_id: expediente.professional_id,
    assessment_code: parsed.data.assessmentCode,
    assessment_label: assessmentLabel,
    file_storage_path: storagePath,
    file_name: sanitizedName,
    file_content_type: file.type,
    file_size_bytes: file.size
  });

  if (insertError) {
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

  await safeWriteAuditLog({
    userId: patient.id,
    role: patient.role,
    action: "portal_assessment_upload",
    entityType: "patient_assessment_uploads",
    entityId: expediente.id,
    result: "success",
    metadata: {
      assessment_code: parsed.data.assessmentCode,
      file_content_type: file.type,
      file_size_bytes: file.size
    },
    context: "audit_portal_assessment_upload_success"
  });

  revalidatePath("/portal");

  return { message: "Prueba enviada a tu profesional.", ok: true };
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
