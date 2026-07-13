import type { AccountStatus, UserRole } from "@/lib/auth/types";

export type UserManagementProfile = {
  id: string;
  role: UserRole;
  account_status: AccountStatus;
  full_name: string;
  email: string;
  primary_professional_id: string | null;
  assigned_professional_ids: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const MANAGEABLE_ACCOUNT_STATUSES = ["activo", "inactivo", "bloqueado"] as const;

export type ManageableAccountStatus = (typeof MANAGEABLE_ACCOUNT_STATUSES)[number];

export function canCreateRole(actorRole: UserRole, targetRole: UserRole) {
  if (actorRole === "administrador") {
    return targetRole === "profesional" || targetRole === "paciente";
  }

  if (actorRole === "profesional") {
    return targetRole === "paciente";
  }

  if (actorRole === "super_administrador") {
    return true;
  }

  return false;
}

export function canManageProfile(actorRole: UserRole, targetRole: UserRole) {
  if (actorRole === "administrador") {
    return targetRole === "profesional" || targetRole === "paciente";
  }

  if (actorRole === "super_administrador") {
    return targetRole === "administrador" || targetRole === "super_administrador";
  }

  return false;
}
