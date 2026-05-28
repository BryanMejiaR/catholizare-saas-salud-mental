"use client";

import { useActionState } from "react";

import { createNotaClinicaAction } from "@/app/notas/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import { NOTA_CLINICA_TYPES } from "@/lib/notas/types";
import { NotaFields } from "@/components/notas/nota-fields";

type CreateNotaFormProps = {
  expedienteId: string;
  disabled?: boolean;
};

const noteTypeLabels: Record<(typeof NOTA_CLINICA_TYPES)[number], string> = {
  admision: "Admision",
  evolucion: "Evolucion",
  interconsulta: "Interconsulta",
  referencia_traslado: "Referencia o traslado",
  egreso: "Egreso",
  addendum: "Addendum"
};

export function CreateNotaForm({ expedienteId, disabled = false }: CreateNotaFormProps) {
  const [state, formAction] = useActionState(createNotaClinicaAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="expedienteId" value={expedienteId} />
      <div>
        <h2 className="text-lg font-semibold text-ink">Nueva nota clinica</h2>
        <p className="mt-1 text-sm text-ink/65">
          Se guarda como borrador. Al confirmar, el contenido queda inmutable.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Tipo de nota</span>
        <select
          name="noteType"
          disabled={disabled}
          defaultValue="evolucion"
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          {NOTA_CLINICA_TYPES.filter((type) => type !== "addendum").map((type) => (
            <option key={type} value={type}>
              {noteTypeLabels[type]}
            </option>
          ))}
        </select>
      </label>

      <NotaFields disabled={disabled} />

      <SubmitButton disabled={disabled}>Crear borrador</SubmitButton>
    </form>
  );
}
