import "server-only";

import * as Sentry from "@sentry/nextjs";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import type { AuthProfile } from "@/lib/auth/types";
import {
  getGoogleCalendarConnection,
  getValidGoogleCalendarAccessToken,
  isGoogleCalendarConfigured,
  markGoogleCalendarConnectionError
} from "@/lib/google-calendar/connections";
import {
  cancelGoogleCalendarEvent,
  createGoogleCalendarEvent
} from "@/lib/google-calendar/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AppointmentSyncInput = {
  appointmentId: string;
  professional: AuthProfile;
  patientName: string;
  patientEmail: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  zoomJoinUrl?: string | null;
};

const DEFAULT_TIME_ZONE = "America/Mexico_City";

export async function syncAppointmentCreatedToGoogleCalendar(input: AppointmentSyncInput) {
  if (!isGoogleCalendarConfigured()) {
    return;
  }

  const connection = await getGoogleCalendarConnection(input.professional.id);

  if (!connection || connection.connection_status !== "conectado") {
    return;
  }

  try {
    const accessToken = await getValidGoogleCalendarAccessToken(connection);
    const start = new Date(input.scheduledAt);
    const end = new Date(start.getTime() + input.durationMinutes * 60 * 1000);
    const event = await createGoogleCalendarEvent({
      accessToken,
      calendarId: connection.calendar_id,
      summary: `Cita con ${input.patientName}`,
      description: `Cita Catholizare (${input.type}) con ${input.patientName}.`,
      start: start.toISOString(),
      end: end.toISOString(),
      timeZone: DEFAULT_TIME_ZONE,
      zoomJoinUrl: input.zoomJoinUrl
    });

    const supabaseAdmin = createSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from("citas")
      .update({
        google_calendar_event_id: event.id
      })
      .eq("id", input.appointmentId)
      .eq("professional_id", input.professional.id);

    if (error) {
      throw new Error(`Unable to store Google Calendar event id: ${error.message}`);
    }

    await safeWriteAuditLog({
      userId: input.professional.id,
      role: input.professional.role,
      action: "gcal_event_sync",
      entityType: "citas",
      entityId: input.appointmentId,
      result: "success",
      metadata: {
        direction: "catholizare_to_google",
        google_event_id: event.id
      },
      context: "audit_gcal_event_create_success"
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "google_calendar_event_create",
        appointment_id: input.appointmentId,
        professional_id: input.professional.id
      }
    });

    await markGoogleCalendarConnectionError(
      input.professional.id,
      error instanceof Error ? error.message : "Unknown Google Calendar sync error"
    );

    await safeWriteAuditLog({
      userId: input.professional.id,
      role: input.professional.role,
      action: "gcal_event_sync",
      entityType: "citas",
      entityId: input.appointmentId,
      result: "error",
      metadata: {
        direction: "catholizare_to_google"
      },
      context: "audit_gcal_event_create_error"
    });
  }
}

export async function syncAppointmentCancelledToGoogleCalendar(
  professional: AuthProfile,
  appointmentId: string,
  googleCalendarEventId: string | null
) {
  if (!googleCalendarEventId || !isGoogleCalendarConfigured()) {
    return;
  }

  const connection = await getGoogleCalendarConnection(professional.id);

  if (!connection || connection.connection_status !== "conectado") {
    return;
  }

  try {
    const accessToken = await getValidGoogleCalendarAccessToken(connection);
    await cancelGoogleCalendarEvent(accessToken, connection.calendar_id, googleCalendarEventId);

    await safeWriteAuditLog({
      userId: professional.id,
      role: professional.role,
      action: "gcal_event_cancel",
      entityType: "citas",
      entityId: appointmentId,
      result: "success",
      metadata: {
        direction: "catholizare_to_google",
        google_event_id: googleCalendarEventId
      },
      context: "audit_gcal_event_cancel_success"
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "google_calendar_event_cancel",
        appointment_id: appointmentId,
        professional_id: professional.id
      }
    });

    await markGoogleCalendarConnectionError(
      professional.id,
      error instanceof Error ? error.message : "Unknown Google Calendar cancellation error"
    );

    await safeWriteAuditLog({
      userId: professional.id,
      role: professional.role,
      action: "gcal_event_cancel",
      entityType: "citas",
      entityId: appointmentId,
      result: "error",
      metadata: {
        direction: "catholizare_to_google",
        google_event_id: googleCalendarEventId
      },
      context: "audit_gcal_event_cancel_error"
    });
  }
}
