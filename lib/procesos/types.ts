export const PROCESO_GENERAL_STATUSES = ["activo", "cerrado"] as const;
export type ProcesoGeneralStatus = (typeof PROCESO_GENERAL_STATUSES)[number];

export const PROCESS_MODEL_TYPES = ["general", "tcc"] as const;
export type ProcessModelType = (typeof PROCESS_MODEL_TYPES)[number];

export const PROCESS_MODEL_LABEL: Record<ProcessModelType, string> = {
  general: "General",
  tcc: "TCC"
};

export const PROCESS_FIELD_TYPES = ["text", "textarea", "select", "date", "number"] as const;
export type ProcessFieldType = (typeof PROCESS_FIELD_TYPES)[number];

export type ProcessTemplateField = {
  id: string;
  label: string;
  type: ProcessFieldType;
  options?: string[];
};

export type ProcessTemplateStep = {
  id: string;
  title: string;
  description?: string;
  fields: ProcessTemplateField[];
};

export type ProcessTemplate = {
  id: string;
  professional_id: string;
  model_type: "general";
  version: number;
  steps: ProcessTemplateStep[];
  created_by_user_id: string | null;
  created_at: string;
};

export type ProcesoTerapeutico = {
  id: string;
  expediente_id: string;
  patient_id: string;
  professional_id: string;
  model_type: ProcessModelType;
  template_id: string | null;
  template_version: number;
  template_snapshot: {
    steps: ProcessTemplateStep[];
  };
  status: ProcesoGeneralStatus;
  started_at: string;
  closed_at: string | null;
  closed_by_note_id: string | null;
  step_data: Record<string, Record<string, string | number | boolean | null>>;
  gpt_instructions: Record<string, string>;
  linked_note_ids: string[];
  linked_assessment_ids: string[];
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProcesoListItem = Pick<
  ProcesoTerapeutico,
  | "id"
  | "expediente_id"
  | "patient_id"
  | "model_type"
  | "status"
  | "started_at"
  | "closed_at"
  | "updated_at"
> & {
  patient: {
    full_name: string;
    email: string;
  };
};

export type ProcesoDetail = ProcesoTerapeutico & {
  patient: {
    full_name: string;
    email: string;
  };
};

export const DEFAULT_GENERAL_TEMPLATE_STEPS: ProcessTemplateStep[] = [
  {
    id: "evaluacion_inicial",
    title: "Evaluacion inicial",
    description: "Exploracion inicial del caso y necesidades principales.",
    fields: [
      { id: "motivo", label: "Motivo terapeutico", type: "textarea" },
      { id: "hipotesis_inicial", label: "Hipotesis inicial", type: "textarea" }
    ]
  },
  {
    id: "objetivos",
    title: "Objetivos terapeuticos",
    fields: [
      { id: "objetivos", label: "Objetivos acordados", type: "textarea" },
      { id: "indicadores", label: "Indicadores de avance", type: "textarea" }
    ]
  },
  {
    id: "intervencion",
    title: "Intervencion y seguimiento",
    fields: [
      { id: "linea_trabajo", label: "Linea de trabajo", type: "textarea" },
      { id: "ajustes", label: "Ajustes clinicos", type: "textarea" }
    ]
  },
  {
    id: "cierre",
    title: "Cierre",
    fields: [
      { id: "criterios_cierre", label: "Criterios de cierre", type: "textarea" },
      { id: "recomendaciones", label: "Recomendaciones", type: "textarea" }
    ]
  }
];

export const DEFAULT_TCC_TEMPLATE_VERSION = 1;

export const DEFAULT_TCC_TEMPLATE_STEPS: ProcessTemplateStep[] = [
  {
    id: "preparacion",
    title: "Preparacion del proceso TCC",
    description: "Verificacion clinica minima antes de iniciar el trabajo estructurado.",
    fields: [
      { id: "consentimiento", label: "Estado del consentimiento", type: "text" },
      { id: "informacion_pendiente", label: "Informacion pendiente", type: "textarea" },
      { id: "condiciones_inicio", label: "Condiciones minimas para primera sesion", type: "textarea" }
    ]
  },
  {
    id: "entrevista_inicial",
    title: "Primera sesion / entrevista inicial",
    description: "Recopilacion inicial del caso y observaciones clinicas.",
    fields: [
      { id: "motivo_consulta", label: "Motivo de consulta", type: "textarea" },
      { id: "historia_problema", label: "Historia del problema actual", type: "textarea" },
      { id: "sintomas", label: "Sintomas emocionales, cognitivos, conductuales y fisiologicos", type: "textarea" },
      { id: "factores_riesgo", label: "Factores de riesgo", type: "textarea" },
      { id: "factores_protectores", label: "Factores protectores", type: "textarea" },
      { id: "observaciones", label: "Observaciones clinicas", type: "textarea" }
    ]
  },
  {
    id: "conceptualizacion",
    title: "Conceptualizacion TCC inicial",
    description: "Formulacion cognitivo-conductual del caso.",
    fields: [
      { id: "precipitantes", label: "Factores precipitantes", type: "textarea" },
      { id: "originadores", label: "Mecanismos originadores", type: "textarea" },
      { id: "mantenedores", label: "Mecanismos mantenedores", type: "textarea" },
      { id: "cambio", label: "Mecanismos de cambio esperados", type: "textarea" },
      { id: "hipotesis", label: "Hipotesis de trabajo", type: "textarea" }
    ]
  },
  {
    id: "plan_tratamiento",
    title: "Plan de tratamiento TCC",
    description: "Objetivos, intervenciones y criterios de avance derivados de la conceptualizacion.",
    fields: [
      { id: "objetivo_general", label: "Objetivo general", type: "textarea" },
      { id: "objetivos_especificos", label: "Objetivos especificos", type: "textarea" },
      { id: "intervenciones", label: "Intervenciones sugeridas", type: "textarea" },
      { id: "tareas", label: "Tareas terapeuticas", type: "textarea" },
      { id: "criterios_avance", label: "Criterios de avance", type: "textarea" }
    ]
  },
  {
    id: "ruta_sesiones",
    title: "Ruta terapeutica editable por sesiones",
    description: "Planeacion preliminar y ajustable de sesiones.",
    fields: [
      { id: "sesiones_planeadas", label: "Sesiones planeadas", type: "textarea" },
      { id: "intervenciones_prioritarias", label: "Intervenciones prioritarias", type: "textarea" },
      { id: "evaluaciones_revisar", label: "Evaluaciones o escalas a revisar", type: "textarea" },
      { id: "ajustes_ruta", label: "Ajustes de ruta", type: "textarea" }
    ]
  },
  {
    id: "seguimiento",
    title: "Sesiones TCC, monitoreo y reevaluacion",
    description: "Seguimiento de notas, estado de animo, tareas y cortes clinicos.",
    fields: [
      { id: "notas_clave", label: "Notas clinicas clave vinculadas", type: "textarea" },
      { id: "estado_animo", label: "Registro de estado de animo observado/reportado", type: "textarea" },
      { id: "cortes_reevaluacion", label: "Cortes de reevaluacion", type: "textarea" },
      { id: "actualizacion_conceptualizacion", label: "Actualizacion de conceptualizacion", type: "textarea" }
    ]
  },
  {
    id: "prevencion_recaidas",
    title: "Prevencion de recaidas",
    description: "Senales, estrategias y recursos de mantenimiento.",
    fields: [
      { id: "senales_alerta", label: "Senales tempranas de recaida", type: "textarea" },
      { id: "estrategias", label: "Estrategias de afrontamiento", type: "textarea" },
      { id: "red_apoyo", label: "Red de apoyo y recursos", type: "textarea" },
      { id: "plan_accion", label: "Plan de accion", type: "textarea" }
    ]
  },
  {
    id: "egreso",
    title: "Alta / egreso",
    description: "Cierre clinico vinculado a una nota de egreso confirmada.",
    fields: [
      { id: "motivo_egreso", label: "Motivo de egreso", type: "textarea" },
      { id: "objetivos_logrados", label: "Objetivos logrados", type: "textarea" },
      { id: "pendientes", label: "Objetivos o cuidados pendientes", type: "textarea" },
      { id: "recomendaciones", label: "Recomendaciones", type: "textarea" }
    ]
  }
];
