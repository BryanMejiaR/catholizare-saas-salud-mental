"use client";

import { useActionState } from "react";

import { startGeneralProcessAction } from "@/app/procesos/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";

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
        <h2 className="text-lg font-semibold text-ink">Proceso terapeutico general</h2>
        <p className="mt-1 text-sm text-ink/65">
          Inicia un proceso con la version vigente de tu plantilla General.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />
      <SubmitButton disabled={disabled}>Iniciar proceso general</SubmitButton>
    </form>
  );
}
