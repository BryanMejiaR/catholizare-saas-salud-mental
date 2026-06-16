"use client";

import { useActionState } from "react";

import { startGeneralProcessAction } from "@/app/procesos/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import { PROCESS_MODEL_LABEL, PROCESS_MODEL_TYPES } from "@/lib/procesos/types";

type StartProcessFormProps = {
  expedienteId: string;
  disabled?: boolean;
};

export function StartProcessForm({ expedienteId, disabled = false }: StartProcessFormProps) {
  const [state, formAction] = useActionState(startGeneralProcessAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="expedienteId" value={expedienteId} />
      <div>
        <h2 className="text-lg font-semibold text-ink">Proceso terapeutico</h2>
        <p className="mt-1 text-sm text-ink/65">
          Selecciona el enfoque terapeutico inicial. La plantilla se guarda como snapshot editable
          solo en procesos activos.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Enfoque terapeutico</span>
        <select
          name="modelType"
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          {PROCESS_MODEL_TYPES.map((modelType) => (
            <option key={modelType} value={modelType}>
              {PROCESS_MODEL_LABEL[modelType]}
            </option>
          ))}
        </select>
      </label>

      <ActionMessage message={state.message} ok={state.ok} />
      <SubmitButton disabled={disabled}>Iniciar proceso</SubmitButton>
    </form>
  );
}
