"use server";

import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/profile";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { APPOINTMENT_TYPES } from "@/lib/agenda/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AgendaActionState = {
  message?: string;
  ok?: boolean;
};

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  scheduledAt: z.string().trim().min(16),
  durationMinutes: z.coerce.number().int().min(15).max(240),
  type: z.enum(APPOINTMENT_TYPES)
});

const cancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  cancellationReason: z.string().trim().min(5).max(1000)
});

async function getActiveProfessional() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return null;
  }

  return profile;
}

async function assertActiveExpedienteForPatient(patientId: string, professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("expedientes")
    .select("id, patient_id, professional_id, status")
    .eq("patient_id", patientId)
    .eq("professional_id", professionalId)
    .eq("status", "activo")
    .maybeSingle();

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

export async function createAppointmentAction(
  _previousState: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const scheduledDate = `${formData.get("scheduledDate") ?? ""}`;
  const scheduledTime = `${formData.get("scheduledTime") ?? ""}`;
  const parsed = createAppointmentSchema.safeParse({
    patientId: formData.get("patientId"),
    scheduledAt: `${scheduledDate}T${scheduledTime}`,
    durationMinutes: formData.get("durationMinutes"),
    type: formData.get("type")
  });

  if (!parsed.success) {
    return { message: "Datos de cita invalidos.", ok: false };
  }

  const scheduledAt = new Date(parsed.data.scheduledAt);

  if (Number.isNaN(scheduledAt.getTime())) {
    return { message: "Fecha u hora invalida.", ok: false };
  }

  if (scheduledAt.getTime() <= Date.now()) {
    return { message: "La cita debe programarse en una fecha futura.", ok: false };
  }

  const expediente = await assertActiveExpedienteForPatient(parsed.data.patientId, actor.id);

  if (!expediente) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "appointment_create",
      entityType: "citas",
      result: "denied",
      metadata: {
        patient_id: parsed.data.patientId
      },
      context: "audit_appointment_create_denied_patient"
    });

    return { message: "Solo puedes agendar pacientes con expediente activo.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const overlapEnd = new Date(
    scheduledAt.getTime() + parsed.data.durationMinutes * 60 * 1000
  ).toISOString();
  const { data: overlappingAppointment } = await supabaseAdmin
    .from("citas")
    .select("id")
    .eq("professional_id", actor.id)
    .eq("patient_id", parsed.data.patientId)
    .eq("status", "programada")
    .gte("scheduled_at", scheduledAt.toISOString())
    .lt("scheduled_at", overlapEnd)
    .maybeSingle();

  if (overlappingAppointment) {
    return { message: "Ya existe una cita programada para este Paciente en esa franja.", ok: false };
  }

  const { data, error } = await supabaseAdmin
    .from("citas")
    .insert({
      professional_id: actor.id,
      patient_id: expediente.patient_id,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: parsed.data.durationMinutes,
      type: parsed.data.type,
      created_by_user_id: actor.id
    })
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Appointment insert did not return an id"), {
      extra: {
        professional_id: actor.id,
        patient_id: expediente.patient_id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "appointment_create",
      entityType: "citas",
      result: "error",
      metadata: {
        patient_id: expediente.patient_id
      },
      context: "audit_appointment_create_error"
    });

    return { message: "No fue posible crear la cita.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "appointment_create",
    entityType: "citas",
    entityId: data.id,
    result: "success",
    metadata: {
      patient_id: expediente.patient_id,
      type: parsed.data.type
    },
    context: "audit_appointment_create_success"
  });

  revalidatePath("/professional/agenda");

  return { message: "Cita programada.", ok: true };
}

export async function cancelAppointmentAction(
  _previousState: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = cancelAppointmentSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    cancellationReason: formData.get("cancellationReason")
  });

  if (!parsed.success) {
    return { message: "Agrega un motivo de cancelacion.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: appointment, error: appointmentError } = await supabaseAdmin
    .from("citas")
    .select("id, scheduled_at, professional_id, status")
    .eq("id", parsed.data.appointmentId)
    .eq("professional_id", actor.id)
    .single();

  if (appointmentError || !appointment || appointment.status !== "programada") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "appointment_cancel",
      entityType: "citas",
      entityId: parsed.data.appointmentId,
      result: "denied",
      context: "audit_appointment_cancel_denied"
    });

    return { message: "Solo puedes cancelar citas programadas propias.", ok: false };
  }

  if (new Date(appointment.scheduled_at).getTime() <= Date.now()) {
    return { message: "Las citas pasadas son de solo lectura.", ok: false };
  }

  const { error } = await supabaseAdmin
    .from("citas")
    .update({
      status: "cancelada",
      cancellation_reason: parsed.data.cancellationReason,
      cancelled_at: new Date().toISOString(),
      cancelled_by_user_id: actor.id
    })
    .eq("id", appointment.id)
    .eq("professional_id", actor.id)
    .eq("status", "programada");

  if (error) {
    Sentry.captureException(error, {
      extra: {
        appointment_id: appointment.id,
        professional_id: actor.id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "appointment_cancel",
      entityType: "citas",
      entityId: appointment.id,
      result: "error",
      context: "audit_appointment_cancel_error"
    });

    return { message: "No fue posible cancelar la cita.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "appointment_cancel",
    entityType: "citas",
    entityId: appointment.id,
    result: "success",
    context: "audit_appointment_cancel_success"
  });

  revalidatePath("/professional/agenda");

  return { message: "Cita cancelada.", ok: true };
}
