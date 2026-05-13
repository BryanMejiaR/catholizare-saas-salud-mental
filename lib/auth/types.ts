export const USER_ROLES = [
  "paciente",
  "profesional",
  "administrador",
  "super_administrador"
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ACCOUNT_STATUSES = [
  "activo",
  "inactivo",
  "bloqueado",
  "pendiente_activacion"
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export type AuthProfile = {
  id: string;
  organization_id: string | null;
  role: UserRole;
  account_status: AccountStatus;
  full_name: string;
  email: string;
  last_login_at: string | null;
  failed_attempts: number;
  locked_until: string | null;
};

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  paciente: "/portal",
  profesional: "/professional",
  administrador: "/admin",
  super_administrador: "/super-admin"
};
