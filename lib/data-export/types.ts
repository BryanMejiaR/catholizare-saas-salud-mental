export type ProfessionalExportRequestStatus =
  | "solicitada"
  | "aprobada"
  | "rechazada"
  | "expirada"
  | "descargada";

export type ProfessionalExportRequest = {
  id: string;
  folio: string;
  professional_id: string;
  status: ProfessionalExportRequestStatus;
  reason: string;
  requested_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  token_expires_at: string | null;
  acceptance_folio: string | null;
  accepted_at: string | null;
  downloaded_at: string | null;
  created_at: string;
};

export type SuperAdminExportRequest = ProfessionalExportRequest & {
  professional: {
    full_name: string;
    email: string;
  };
};
