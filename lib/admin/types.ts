export type AdminMetric = {
  label: string;
  value: number;
};

export type ProfessionalOperationalMetric = {
  professional_id: string;
  full_name: string;
  email: string;
  assigned_patients_count: number;
  appointments_count: number;
};

export type AdminOperationalReport = {
  users: AdminMetric[];
  expedientes: AdminMetric[];
  appointments: AdminMetric[];
  professionals: ProfessionalOperationalMetric[];
};

export type AdminAuditLog = {
  id: string;
  user_id: string | null;
  role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  result: "success" | "denied" | "error";
  created_at: string;
};
