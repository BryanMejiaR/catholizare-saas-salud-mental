"use client";

import { useActionState } from "react";

import { createAssessmentAction } from "@/app/evaluaciones/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import {
  ASSESSMENT_INPUT_METHODS,
  PSYCHOLOGICAL_ASSESSMENT_TYPES
} from "@/lib/evaluaciones/types";

type CreateAssessmentFormProps = {
  expedienteId: string;
  disabled?: boolean;
};

const assessmentTypeLabels: Record<(typeof PSYCHOLOGICAL_ASSESSMENT_TYPES)[number], string> = {
  inventario: "Inventario",
  cuestionario: "Cuestionario",
  escala_clinica: "Escala clinica",
  personalidad: "Personalidad",
  proyectiva: "Proyectiva",
  entrevista_estructurada: "Entrevista estructurada",
  psicometrica_externa: "Psicometrica externa",
  clinica_no_estandarizada: "Clinica no estandarizada",
  otra: "Otra"
};

const inputMethodLabels: Record<(typeof ASSESSMENT_INPUT_METHODS)[number], string> = {
  manual: "Manual",
  imagen: "Imagen revisada externamente",
  archivo: "Archivo autorizado",
  resultado_externo: "Resultado externo"
};

export function CreateAssessmentForm({ expedienteId, disabled = false }: CreateAssessmentFormProps) {
  const [state, formAction] = useActionState(createAssessmentAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="expedienteId" value={expedienteId} />

      <div>
        <h3 className="text-base font-semibold text-ink">Registrar evaluacion</h3>
        <p className="mt-1 text-sm text-ink/65">
          No captures reactivos, manuales ni claves protegidas. Registra solo resultados y contexto
          clinico necesario.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Nombre de la prueba o inventario</span>
          <input
            name="assessmentName"
            disabled={disabled}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Fecha de aplicacion</span>
          <input
            name="appliedAt"
            type="date"
            disabled={disabled}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Tipo</span>
          <select
            name="assessmentType"
            disabled={disabled}
            defaultValue="inventario"
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            {PSYCHOLOGICAL_ASSESSMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {assessmentTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Metodo de captura</span>
          <select
            name="inputMethod"
            disabled={disabled}
            defaultValue="manual"
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            {ASSESSMENT_INPUT_METHODS.map((method) => (
              <option key={method} value={method}>
                {inputMethodLabels[method]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Finalidad clinica</span>
        <textarea
          name="assessmentPurpose"
          rows={3}
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Observaciones generales</span>
        <textarea
          name="observations"
          rows={3}
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <SubmitButton disabled={disabled}>Registrar evaluacion</SubmitButton>
    </form>
  );
}
