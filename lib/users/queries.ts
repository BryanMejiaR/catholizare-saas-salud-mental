import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { UserManagementProfile } from "@/lib/users/types";

const PROFILE_SELECT =
  "id, role, account_status, full_name, email, primary_professional_id, assigned_professional_ids, created_by, created_at, updated_at";

export async function getAllUserProfiles() {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load user profiles: ${error.message}`);
  }

  return (data ?? []) as UserManagementProfile[];
}

export async function getProfessionalProfiles() {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("role", "profesional")
    .eq("account_status", "activo")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load professionals: ${error.message}`);
  }

  return (data ?? []) as UserManagementProfile[];
}

export async function getPatientsForProfessional(professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("role", "paciente")
    .contains("assigned_professional_ids", [professionalId])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load patients: ${error.message}`);
  }

  return (data ?? []) as UserManagementProfile[];
}
