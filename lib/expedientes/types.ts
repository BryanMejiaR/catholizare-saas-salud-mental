export const EXPEDIENTE_STATUSES = ["activo", "archivado", "bloqueado"] as const;
export type ExpedienteStatus = (typeof EXPEDIENTE_STATUSES)[number];

export const CONSENTIMIENTO_STATUSES = [
  "pendiente",
  "firmado_fisico",
  "firmado_digital",
  "excepcion_justificada"
] as const;
export type ConsentimientoStatus = (typeof CONSENTIMIENTO_STATUSES)[number];

export const CONSENTIMIENTO_MODALITIES = ["pendiente", "fisico", "digital"] as const;
export type ConsentimientoModality = (typeof CONSENTIMIENTO_MODALITIES)[number];

export type ExpedienteIdentificationData = {
  birthDate?: string;
  age?: number;
  sex?: string;
  phone?: string;
  residence?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  legalGuardianName?: string;
  legalGuardianPhone?: string;
};

export type ExpedienteSummary = {
  id: string;
  patient_id: string;
  professional_id: string;
  initial_consultation_reason: string | null;
  consent_status: ConsentimientoStatus;
  status: ExpedienteStatus;
  last_clinical_activity_at: string;
  created_at: string;
  updated_at: string;
  patient: {
    full_name: string;
    email: string;
    account_status: string;
  };
};

export type HistoriaClinica = {
  id: string;
  expediente_id: string;
  created_by: string | null;
  motivo_consulta: string | null;
  historia_problema_actual: string | null;
  antecedentes_psicologicos: string | null;
  antecedentes_psiquiatricos: string | null;
  antecedentes_medicos: string | null;
  antecedentes_familiares: string | null;
  antecedentes_tratamiento: string | null;
  antecedentes_medicacion: string | null;
  contexto_familiar: string | null;
  contexto_relacional: string | null;
  contexto_laboral_academico: string | null;
  contexto_espiritual_religioso: string | null;
  factores_riesgo: string | null;
  factores_protectores: string | null;
  recursos_personales: string | null;
  observaciones_clinicas_iniciales: string | null;
};

export type Consentimiento = {
  id: string;
  expediente_id: string;
  status: ConsentimientoStatus;
  signed_at: string | null;
  modality: ConsentimientoModality;
  document_reference: string | null;
};

export type ExpedienteDetail = ExpedienteSummary & {
  identification_data: ExpedienteIdentificationData;
  clinical_status: string | null;
  session_notes_count: number;
  assessments_count: number;
  documents_count: number;
  historia_clinica: HistoriaClinica | null;
  consentimiento: Consentimiento | null;
};
