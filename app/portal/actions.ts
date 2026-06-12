"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getCurrentProfile } from "@/lib/auth/profile";
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

async function getActivePatient() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "paciente" || profile.account_status !== "activo") {
    return null;
  }

  return profile;
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

  if (!appointment || startsAt > Date.now()) {
    await safeWriteAuditLog({
      userId: patient.id,
      role: patient.role,
      action: "portal_experience_review",
      entityType: "patient_experience_reviews",
      entityId: parsed.data.appointmentId,
      result: "denied",
      context: "audit_portal_experience_review_denied"
    });

    return { message: "Solo puedes evaluar citas pasadas.", ok: false };
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

  if (!joinUrl) {
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
