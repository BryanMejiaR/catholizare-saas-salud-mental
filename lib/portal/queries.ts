import "server-only";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  PatientPortalSummary,
  PortalAppointment,
  PortalAppointmentRequest
} from "@/lib/portal/types";

type AppointmentRow = {
  id: string;
  professional_id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: "presencial" | "videollamada";
  status: "programada" | "completada" | "cancelada";
  cancellation_reason: string | null;
  zoom_join_url: string | null;
};

const ZOOM_JOIN_WINDOW_MS = 24 * 60 * 60 * 1000;

async function getProfilesById(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, PortalAppointment["professional"]>();
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", ids);

  if (error) {
    throw new Error(`Unable to load portal profile data: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      {
        full_name: profile.full_name,
        email: profile.email
      }
    ])
  );
}

async function getReviewedAppointmentIds(patientId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("patient_experience_reviews")
    .select("appointment_id")
    .eq("patient_id", patientId);

  if (error) {
    throw new Error(`Unable to load patient reviews: ${error.message}`);
  }

  return new Set((data ?? []).map((row) => row.appointment_id as string));
}

function mapPortalAppointment(
  row: AppointmentRow,
  professionals: Map<string, PortalAppointment["professional"]>,
  reviewedAppointmentIds: Set<string>
) {
  const now = Date.now();
  const startsAt = new Date(row.scheduled_at).getTime();
  const endsAt = startsAt + row.duration_minutes * 60 * 1000;
  const isFuture = startsAt > now;
  const isPast = endsAt < now;
  const canJoinZoom =
    row.status === "programada" &&
    row.type === "videollamada" &&
    Boolean(row.zoom_join_url) &&
    startsAt - now <= ZOOM_JOIN_WINDOW_MS &&
    endsAt > now;
  const hasReview = reviewedAppointmentIds.has(row.id);

  return {
    id: row.id,
    professional_id: row.professional_id,
    scheduled_at: row.scheduled_at,
    duration_minutes: row.duration_minutes,
    type: row.type,
    status: row.status,
    cancellation_reason: row.cancellation_reason,
    can_join_zoom: canJoinZoom,
    can_request_change: row.status === "programada" && isFuture,
    can_review: isPast && !hasReview,
    has_review: hasReview,
    professional: professionals.get(row.professional_id) ?? {
      full_name: "Profesional no disponible",
      email: ""
    }
  } satisfies PortalAppointment;
}

export async function getPortalDashboard(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const { data: expedientes, error: expedientesError } = await supabaseAdmin
    .from("expedientes")
    .select("id")
    .eq("patient_id", profile.id)
    .eq("status", "activo");

  if (expedientesError) {
    throw new Error(`Unable to load patient portal expedientes: ${expedientesError.message}`);
  }

  const expedienteIds = (expedientes ?? []).map((row) => row.id as string);
  const summaryQuery =
    expedienteIds.length > 0
      ? supabaseAdmin
          .from("resumenes_terapeuticos")
          .select("expediente_id, content, source, published_at")
          .eq("status", "publicado")
          .in("expediente_id", expedienteIds)
          .order("published_at", { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [], error: null });
  const [{ data: summaryRows, error: summaryError }, { data: appointments, error: appointmentsError }] =
    await Promise.all([
      summaryQuery,
      supabaseAdmin
        .from("citas")
        .select(
          "id, professional_id, scheduled_at, duration_minutes, type, status, cancellation_reason, zoom_join_url"
        )
        .eq("patient_id", profile.id)
        .order("scheduled_at", { ascending: true })
    ]);

  if (summaryError) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "portal_summary_read",
      entityType: "resumenes_terapeuticos",
      result: "error",
      context: "audit_portal_summary_read_error"
    });
    throw new Error(`Unable to load patient portal summary: ${summaryError.message}`);
  }

  if (appointmentsError) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "portal_appointments_read",
      entityType: "citas",
      result: "error",
      context: "audit_portal_appointments_read_error"
    });
    throw new Error(`Unable to load patient portal appointments: ${appointmentsError.message}`);
  }

  const appointmentRows = (appointments ?? []) as AppointmentRow[];
  const [professionals, reviewedAppointmentIds] = await Promise.all([
    getProfilesById([...new Set(appointmentRows.map((row) => row.professional_id))]),
    getReviewedAppointmentIds(profile.id)
  ]);
  const portalAppointments = appointmentRows.map((row) =>
    mapPortalAppointment(row, professionals, reviewedAppointmentIds)
  );
  const upcomingAppointments = portalAppointments.filter(
    (appointment) =>
      appointment.status === "programada" && new Date(appointment.scheduled_at).toISOString() >= nowIso
  );
  const pastAppointments = portalAppointments
    .filter((appointment) => new Date(appointment.scheduled_at).toISOString() < nowIso)
    .sort(
      (left, right) =>
        new Date(right.scheduled_at).getTime() - new Date(left.scheduled_at).getTime()
    )
    .slice(0, 10);
  const summary = await enrichSummary(
    summaryRows?.[0] as Omit<PatientPortalSummary, "professional"> | undefined
  );
  const requests = await getPortalAppointmentRequests(profile.id);

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "portal_dashboard_read",
    entityType: "portal",
    result: "success",
    metadata: {
      upcoming_count: upcomingAppointments.length,
      past_count: pastAppointments.length,
      has_summary: Boolean(summary)
    },
    context: "audit_portal_dashboard_read_success"
  });

  return {
    summary,
    upcomingAppointments,
    pastAppointments,
    requests
  };
}

async function enrichSummary(
  summary: Omit<PatientPortalSummary, "professional"> | undefined
): Promise<PatientPortalSummary | null> {
  if (!summary) {
    return null;
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: expediente, error } = await supabaseAdmin
    .from("expedientes")
    .select("professional_id")
    .eq("id", summary.expediente_id)
    .single();

  if (error || !expediente) {
    return null;
  }

  const professionals = await getProfilesById([expediente.professional_id]);

  return {
    ...summary,
    professional: professionals.get(expediente.professional_id) ?? {
      full_name: "Profesional no disponible",
      email: ""
    }
  };
}

async function getPortalAppointmentRequests(patientId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("patient_appointment_requests")
    .select("id, appointment_id, request_type, status, created_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Unable to load appointment requests: ${error.message}`);
  }

  return (data ?? []) satisfies PortalAppointmentRequest[];
}
