import "server-only";

import { LIFE_HISTORY_SECTIONS, type LifeHistoryAnswers } from "@/lib/life-history/schema";

const IDENTIFIER_PATTERNS = [
  "nombre",
  "correo",
  "email",
  "domicilio",
  "direccion",
  "celular",
  "telefono",
  "contacto",
  "emergencia",
  "escuela",
  "trabajo",
  "empresa",
  "matricula",
  "curp",
  "rfc"
];

const fieldLabels = new Map(
  LIFE_HISTORY_SECTIONS.flatMap((section) =>
    section.fields.map((field) => [field.id, field.label.toLowerCase()] as const)
  )
);

function isIdentifierField(fieldId: string) {
  const key = fieldId.toLowerCase();
  const label = fieldLabels.get(fieldId) ?? "";

  return IDENTIFIER_PATTERNS.some((pattern) => key.includes(pattern) || label.includes(pattern));
}

export function anonymizeLifeHistoryAnswers(answers: LifeHistoryAnswers) {
  return Object.fromEntries(
    Object.entries(answers)
      .filter(([fieldId]) => !isIdentifierField(fieldId))
      .map(([fieldId, value]) => [fieldId, Array.isArray(value) ? value.slice(0, 30) : value])
  );
}
