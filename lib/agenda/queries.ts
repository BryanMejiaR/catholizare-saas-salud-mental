import "server-only";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AgendaPatientOption, AppointmentListItem } from "@/lib/agenda/types";

const APPOINTMENT_SELECT =
  "id, professional_id, patient_id, process_id, tcc_process_id, tcc_session_plan_item_id, scheduled_at, duration_minutes, type, status, zoom_meeting_id, zoom_join_url, zoom_start_url, google_calendar_event_id, cancellation_reason, created_by_user_id, created_at, updated_at, cancelled_at, cancelled_by_user_id";

async function getPatientsById(patientIds: string[]) {
  if (patientIds.length === 0) {
    return new Map<string, AppointmentListItem["patient"]>();
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", patientIds);

  if (error) {
    throw new Error(`Unable to load appointment patients: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((patient) => [
      patient.id,
      {
        full_name: patient.full_name,
        email: patient.email
      }
    ])
  );
}

export async function getAppointmentsForProfessional(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("citas")
    .select(APPOINTMENT_SELECT)
    .eq("professional_id", profile.id)
    .order("scheduled_at", { ascending: true });

  if (error) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "appointment_read",
      entityType: "citas",
      result: "error",
      metadata: {
        scope: "professional_list"
      },
      context: "audit_appointment_list_error"
    });

    throw new Error(`Unable to load appointments: ${error.message}`);
  }

  const rows = (data ?? []) as Array<Omit<AppointmentListItem, "patient">>;
  const patients = await getPatientsById([...new Set(rows.map((row) => row.patient_id))]);

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "appointment_read",
    entityType: "citas",
    result: "success",
    metadata: {
      scope: "professional_list",
      count: rows.length
    },
    context: "audit_appointment_list_success"
  });

  return rows.map((row) => ({
    ...row,
    patient: patients.get(row.patient_id) ?? {
      full_name: "Paciente no disponible",
      email: ""
    }
  })) satisfies AppointmentListItem[];
}

export async function getAgendaPatientOptions(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("expedientes")
    .select("patient_id")
    .eq("professional_id", profile.id)
    .eq("status", "activo");

  if (error) {
    throw new Error(`Unable to load agenda patients: ${error.message}`);
  }

  const patientIds = [...new Set((data ?? []).map((row) => row.patient_id as string))];

  if (patientIds.length === 0) {
    return [] satisfies AgendaPatientOption[];
  }

  const { data: patients, error: patientsError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", patientIds)
    .eq("account_status", "activo")
    .order("full_name", { ascending: true });

  if (patientsError) {
    throw new Error(`Unable to load agenda patient profiles: ${patientsError.message}`);
  }

  return (patients ?? []).map((patient) => ({
    id: patient.id,
    full_name: patient.full_name,
    email: patient.email
  })) satisfies AgendaPatientOption[];
}
