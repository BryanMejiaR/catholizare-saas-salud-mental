import "server-only";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canManageProfile } from "@/lib/users/types";

export type ProfessionalProfileSummary = {
  id: string;
  full_name: string;
  email: string;
  account_status: string;
  age: string;
  professional_license: string;
  assigned_patients_count: number;
  draft_notes_count: number;
  confirmed_notes_count: number;
  completed_sessions_count: number;
  patient_statuses: Array<{ label: string; value: number }>;
};

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

export async function getProfessionalProfileSummary(
  actor: AuthProfile,
  professionalId: string
): Promise<ProfessionalProfileSummary | null> {
  if (!canManageProfile(actor.role, "profesional")) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "professional_profile_read",
      entityType: "profiles",
      entityId: professionalId,
      result: "denied",
      context: "audit_professional_profile_read_denied"
    });
    return null;
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: professional, error: professionalError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, full_name, email, account_status")
    .eq("id", professionalId)
    .eq("role", "profesional")
    .maybeSingle();

  if (professionalError || !professional) {
    return null;
  }

  const [{ data: patients }, { data: notes }, { data: appointments }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, account_status")
      .eq("role", "paciente")
      .contains("assigned_professional_ids", [professionalId]),
    supabaseAdmin
      .from("notas_clinicas")
      .select("id, status")
      .eq("professional_id", professionalId),
    supabaseAdmin
      .from("citas")
      .select("id, status")
      .eq("professional_id", professionalId)
  ]);
  const patientRows = (patients ?? []) as Array<{ account_status: string }>;
  const noteRows = (notes ?? []) as Array<{ status: string }>;
  const appointmentRows = (appointments ?? []) as Array<{ status: string }>;
  const patientStatusCounts = countBy(patientRows.map((patient) => patient.account_status));

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "professional_profile_read",
    entityType: "profiles",
    entityId: professionalId,
    result: "success",
    context: "audit_professional_profile_read_success"
  });

  return {
    id: professional.id as string,
    full_name: professional.full_name as string,
    email: professional.email as string,
    account_status: professional.account_status as string,
    age: "No registrada",
    professional_license: "No registrada",
    assigned_patients_count: patientRows.length,
    draft_notes_count: noteRows.filter((note) => note.status === "borrador").length,
    confirmed_notes_count: noteRows.filter((note) =>
      ["confirmada", "con_addendum", "exportada"].includes(note.status)
    ).length,
    completed_sessions_count: appointmentRows.filter((appointment) => appointment.status === "completada")
      .length,
    patient_statuses: Object.entries(patientStatusCounts).map(([label, value]) => ({ label, value }))
  };
}
