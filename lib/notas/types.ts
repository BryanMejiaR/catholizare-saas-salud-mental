export const NOTA_CLINICA_TYPES = [
  "admision",
  "evolucion",
  "interconsulta",
  "referencia_traslado",
  "egreso",
  "addendum"
] as const;
export type NotaClinicaType = (typeof NOTA_CLINICA_TYPES)[number];

export const NOTA_CLINICA_STATUSES = [
  "borrador",
  "confirmada",
  "con_addendum",
  "anulada_logicamente",
  "exportada"
] as const;
export type NotaClinicaStatus = (typeof NOTA_CLINICA_STATUSES)[number];

export type NotaClinica = {
  id: string;
  expediente_id: string;
  patient_id: string;
  professional_id: string;
  appointment_id: string | null;
  process_id: string | null;
  tcc_process_id: string | null;
  tcc_session_plan_item_id: string | null;
  tcc_session_number: number | null;
  tcc_phase: string | null;
  note_type: NotaClinicaType;
  status: NotaClinicaStatus;
  session_date: string;
  content: string;
  clinical_summary: string | null;
  interventions: string | null;
  patient_response: string | null;
  plan_next_session: string | null;
  risk_flags: string | null;
  homework_or_tasks: string | null;
  mood_score: number | null;
  anxiety_score: number | null;
  hope_score: number | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  confirmed_by_user_id: string | null;
  confirmed_at: string | null;
  addendum_to_note_id: string | null;
  correction_reason: string | null;
  annulment_reason: string | null;
  annulled_at: string | null;
  annulled_by_user_id: string | null;
  pdf_file_id: string | null;
  exported_at: string | null;
  ai_used: boolean;
  ai_session_id: string | null;
};

export type NotaClinicaSummary = Pick<
  NotaClinica,
  | "id"
  | "expediente_id"
  | "note_type"
  | "status"
  | "session_date"
  | "clinical_summary"
  | "created_at"
  | "confirmed_at"
  | "addendum_to_note_id"
>;

export type NotaClinicaListItem = NotaClinicaSummary & {
  patient: {
    full_name: string;
    email: string;
  };
};

export type NotaClinicaExportData = {
  note: NotaClinica;
  patient: {
    full_name: string;
    email: string;
  };
  professional: {
    full_name: string;
    email: string;
  };
};

export type NotaClinicaFilters = {
  patientId?: string;
  noteType?: NotaClinicaType;
  status?: NotaClinicaStatus;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
};
