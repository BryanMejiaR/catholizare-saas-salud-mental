"use client";

import { useActionState } from "react";

import { annulNotaClinicaAction } from "@/app/notas/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import type { NotaClinica } from "@/lib/notas/types";

type AnnulNotaFormProps = {
  note: NotaClinica;
};

export function AnnulNotaForm({ note }: AnnulNotaFormProps) {
  const [state, formAction] = useActionState(annulNotaClinicaAction, {});
  const disabled = !["confirmada", "con_addendum", "exportada"].includes(note.status);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-clay/20 bg-white p-5">
      <input type="hidden" name="noteId" value={note.id} />
      <div>
        <h2 className="text-lg font-semibold text-ink">Anulacion logica</h2>
        <p className="mt-1 text-sm text-ink/65">
          La nota permanece en el historial y se marca como anulada.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Motivo de anulacion</span>
        <textarea
          name="annulmentReason"
          rows={4}
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <SubmitButton disabled={disabled}>Anular logicamente</SubmitButton>
    </form>
  );
}
