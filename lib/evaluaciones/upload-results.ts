import type { PatientAssessmentUploadType } from "@/lib/evaluaciones/types";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function pickRecord(source: JsonRecord, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, source[key] ?? ""]));
}

function sanitizeRows(value: unknown, keys: string[]) {
  return asArray(value)
    .filter(isRecord)
    .map((row) => pickRecord(row, keys));
}

export const PATIENT_ASSESSMENT_RESULT_TEMPLATES: Record<PatientAssessmentUploadType, JsonRecord> = {
  etra: {
    datos_generales: {
      vives_con: "",
      edad: "",
      sexo: "",
      fecha: ""
    },
    subescalas: [
      { sub_escala: "AG", puntuacion: 0, corte: 17, r: "" },
      { sub_escala: "AS", puntuacion: 0, corte: 17, r: "" },
      { sub_escala: "SF", puntuacion: 0, corte: 14, r: "" }
    ],
    puntaje_final: 0
  },
  bdi: {
    escalas: [{ escala: "", p: 0, significativos: "" }],
    cortes: [{ corte: "", significativos: "" }],
    total: 0
  },
  ysq: {
    esquemas: [{ esq: "", pt: 0, respuestas_5_6: 0, interpretacion: "" }],
    grafica: [{ etiqueta: "", valor: 0 }]
  },
  pbq_s: {
    resumen: [
      {
        preg: "",
        trastorno: "",
        puntuacion: 0,
        respuestas_3_4: 0,
        clasificacion: ""
      }
    ],
    hombres: [{ trastorno: "", bajo: "", normal: "", alt: "" }],
    mujeres: [{ trastorno: "", bajo: "", normal: "", alt: "" }]
  },
  otra: {}
};

export function getAssessmentResultTemplate(assessmentCode: string) {
  return PATIENT_ASSESSMENT_RESULT_TEMPLATES[
    assessmentCode as PatientAssessmentUploadType
  ] ?? {};
}

export function sanitizeAssessmentUploadResults(assessmentCode: string, results: JsonRecord) {
  if (assessmentCode === "etra") {
    const datosGenerales = isRecord(results.datos_generales) ? results.datos_generales : {};

    return {
      datos_generales: pickRecord(datosGenerales, ["vives_con", "edad", "sexo", "fecha"]),
      subescalas: sanitizeRows(results.subescalas, ["sub_escala", "puntuacion", "corte", "r"]),
      puntaje_final: results.puntaje_final ?? ""
    };
  }

  if (assessmentCode === "bdi") {
    return {
      escalas: sanitizeRows(results.escalas, ["escala", "p", "significativos"]),
      cortes: sanitizeRows(results.cortes, ["corte", "significativos"]),
      total: results.total ?? ""
    };
  }

  if (assessmentCode === "ysq") {
    return {
      esquemas: sanitizeRows(results.esquemas, ["esq", "pt", "respuestas_5_6", "interpretacion"]),
      grafica: sanitizeRows(results.grafica, ["etiqueta", "valor"])
    };
  }

  if (assessmentCode === "pbq_s") {
    return {
      resumen: sanitizeRows(results.resumen, [
        "preg",
        "trastorno",
        "puntuacion",
        "respuestas_3_4",
        "clasificacion"
      ]),
      hombres: sanitizeRows(results.hombres, ["trastorno", "bajo", "normal", "alt"]),
      mujeres: sanitizeRows(results.mujeres, ["trastorno", "bajo", "normal", "alt"])
    };
  }

  return results;
}
