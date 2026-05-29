export const PROCESO_GENERAL_STATUSES = ["activo", "cerrado"] as const;
export type ProcesoGeneralStatus = (typeof PROCESO_GENERAL_STATUSES)[number];

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
  "id" | "expediente_id" | "patient_id" | "status" | "started_at" | "closed_at" | "updated_at"
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
