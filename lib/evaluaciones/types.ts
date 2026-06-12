export const PSYCHOLOGICAL_ASSESSMENT_TYPES = [
  "inventario",
  "cuestionario",
  "escala_clinica",
  "personalidad",
  "proyectiva",
  "entrevista_estructurada",
  "psicometrica_externa",
  "clinica_no_estandarizada",
  "otra"
] as const;

export type PsychologicalAssessmentType = (typeof PSYCHOLOGICAL_ASSESSMENT_TYPES)[number];

export const ASSESSMENT_INPUT_METHODS = ["manual", "imagen", "archivo", "resultado_externo"] as const;
export type AssessmentInputMethod = (typeof ASSESSMENT_INPUT_METHODS)[number];

export type PsychologicalAssessmentStatus =
  | "borrador"
  | "analizada"
  | "validada"
  | "archivada"
  | "anulada_logicamente";

export type PsychologicalValidationStatus = "pendiente" | "validado" | "rechazado" | "corregido";

export type PsychologicalAssessment = {
  id: string;
  expediente_id: string;
  patient_id: string;
  professional_id: string;
  linked_tcc_process_id: string | null;
  linked_reevaluation_cut_id: string | null;
  assessment_name: string;
  assessment_type: PsychologicalAssessmentType;
  assessment_purpose: string;
  applied_at: string;
  input_method: AssessmentInputMethod;
  raw_scores: Record<string, unknown>;
  scaled_scores: Record<string, unknown>;
  percentiles: Record<string, unknown>;
  cutoff_points: Record<string, unknown>;
  interpretation: string | null;
  limitations: string | null;
  implications: string | null;
  ai_draft_interpretation: string | null;
  comparison_notes: string | null;
  professional_validation_status: PsychologicalValidationStatus;
  validated_by_user_id: string | null;
  validated_at: string | null;
  status: PsychologicalAssessmentStatus;
  ai_session_id: string | null;
  annulment_reason: string | null;
  annulled_at: string | null;
  annulled_by_user_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
