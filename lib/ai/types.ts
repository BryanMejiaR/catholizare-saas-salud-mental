export const AI_FUNCTION_TYPES = [
  "prellenado_paso",
  "conceptualizacion_caso",
  "plan_tratamiento",
  "planeacion_sesion",
  "sugerencia_intervencion",
  "resumen_terapeutico_paciente",
  "analisis_evaluacion_imagen",
  "actualizacion_conceptualizacion_tcc"
] as const;

export type AiFunctionType = (typeof AI_FUNCTION_TYPES)[number];

export type ClinicalContextPackage = {
  task: AiFunctionType;
  assessment?: {
    id: string;
    name: string;
    type: string;
    purpose: string;
    applied_at: string;
    input_method: string;
    raw_scores?: Record<string, unknown>;
    scaled_scores?: Record<string, unknown>;
    percentiles?: Record<string, unknown>;
    cutoff_points?: Record<string, unknown>;
  };
  life_history?: {
    status: string;
    submitted_at: string | null;
    answers: Record<string, string | string[]>;
  };
  assessment_summary?: Array<{
    id: string;
    type: string;
    status: string;
    applied_at?: string | null;
    scores?: Record<string, unknown> | null;
    interpretation_available?: boolean;
  }>;
  process?: {
    id: string;
    model_type: string;
    status: string;
  };
  step?: {
    id: string;
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      label: string;
      current_value: string | number | boolean | null;
    }>;
    completed: boolean;
  };
  previous_steps?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
};

export type AiDraftResult = {
  model: string;
  content: string;
};
