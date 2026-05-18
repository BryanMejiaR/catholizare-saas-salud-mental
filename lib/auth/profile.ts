import "server-only";

import { redirect } from "next/navigation";

import { ROLE_HOME_PATH, type AuthProfile, type UserRole } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, account_status, full_name, email, last_login_at, failed_attempts, locked_until"
    )
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AuthProfile;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.account_status !== "activo") {
    redirect("/auth/inactive");
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect(ROLE_HOME_PATH[profile.role]);
  }

  return profile;
}
