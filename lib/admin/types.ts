export type AdminMetric = {
  label: string;
  value: number;
};

export type AdminTextMetric = {
  label: string;
  value: string;
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
  appointmentPeriods: AdminMetric[];
  patientMetadata: AdminMetric[];
  professionalMetadata: AdminMetric[];
  platformMetadata: AdminMetric[];
  metadataHighlights: AdminTextMetric[];
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
