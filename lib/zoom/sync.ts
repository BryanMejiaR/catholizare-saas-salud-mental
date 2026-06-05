import "server-only";

import * as Sentry from "@sentry/nextjs";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import type { AuthProfile } from "@/lib/auth/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createZoomMeeting, deleteZoomMeeting } from "@/lib/zoom/client";
import {
  getValidZoomAccessToken,
  getZoomConnection,
  isZoomConfigured,
  markZoomConnectionError
} from "@/lib/zoom/connections";

type ZoomAppointmentInput = {
  appointmentId: string;
  professional: AuthProfile;
  patientName: string;
  scheduledAt: string;
  durationMinutes: number;
};

const DEFAULT_TIME_ZONE = "America/Mexico_City";

export async function syncAppointmentCreatedToZoom(input: ZoomAppointmentInput) {
  if (!isZoomConfigured()) {
    return null;
  }

  const connection = await getZoomConnection(input.professional.id);

  if (!connection || connection.connection_status !== "conectado") {
    return null;
  }

  try {
    const accessToken = await getValidZoomAccessToken(connection);
    const meeting = await createZoomMeeting({
      accessToken,
      apiBaseUrl: connection.api_base_url,
      topic: `Cita Catholizare`,
      startTime: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      timezone: DEFAULT_TIME_ZONE
    });
    const supabaseAdmin = createSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from("citas")
      .update({
        zoom_meeting_id: String(meeting.id),
        zoom_join_url: meeting.join_url,
        zoom_start_url: meeting.start_url
      })
      .eq("id", input.appointmentId)
      .eq("professional_id", input.professional.id);

    if (error) {
      throw new Error(`Unable to store Zoom meeting links: ${error.message}`);
    }

    await safeWriteAuditLog({
      userId: input.professional.id,
      role: input.professional.role,
      action: "zoom_meeting_sync",
      entityType: "citas",
      entityId: input.appointmentId,
      result: "success",
      metadata: {
        direction: "catholizare_to_zoom",
        zoom_meeting_id: String(meeting.id)
      },
      context: "audit_zoom_meeting_create_success"
    });

    return {
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url
    };
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "zoom_meeting_create",
        appointment_id: input.appointmentId,
        professional_id: input.professional.id
      }
    });

    await markZoomConnectionError(
      input.professional.id,
      error instanceof Error ? error.message : "Unknown Zoom sync error"
    );

    await safeWriteAuditLog({
      userId: input.professional.id,
      role: input.professional.role,
      action: "zoom_meeting_sync",
      entityType: "citas",
      entityId: input.appointmentId,
      result: "error",
      metadata: {
        direction: "catholizare_to_zoom"
      },
      context: "audit_zoom_meeting_create_error"
    });

    return null;
  }
}

export async function syncAppointmentCancelledToZoom(
  professional: AuthProfile,
  appointmentId: string,
  zoomMeetingId: string | null
) {
  if (!zoomMeetingId || !isZoomConfigured()) {
    return;
  }

  const connection = await getZoomConnection(professional.id);

  if (!connection || connection.connection_status !== "conectado") {
    return;
  }

  try {
    const accessToken = await getValidZoomAccessToken(connection);
    await deleteZoomMeeting(accessToken, connection.api_base_url, zoomMeetingId);

    await safeWriteAuditLog({
      userId: professional.id,
      role: professional.role,
      action: "zoom_meeting_cancel",
      entityType: "citas",
      entityId: appointmentId,
      result: "success",
      metadata: {
        direction: "catholizare_to_zoom",
        zoom_meeting_id: zoomMeetingId
      },
      context: "audit_zoom_meeting_cancel_success"
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "zoom_meeting_cancel",
        appointment_id: appointmentId,
        professional_id: professional.id
      }
    });

    await markZoomConnectionError(
      professional.id,
      error instanceof Error ? error.message : "Unknown Zoom cancellation error"
    );

    await safeWriteAuditLog({
      userId: professional.id,
      role: professional.role,
      action: "zoom_meeting_cancel",
      entityType: "citas",
      entityId: appointmentId,
      result: "error",
      metadata: {
        direction: "catholizare_to_zoom",
        zoom_meeting_id: zoomMeetingId
      },
      context: "audit_zoom_meeting_cancel_error"
    });
  }
}
