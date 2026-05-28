"use client";

import { useActionState } from "react";

import { createNotaAddendumAction } from "@/app/notas/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import type { NotaClinica } from "@/lib/notas/types";

type AddendumFormProps = {
  note: NotaClinica;
};

export function AddendumForm({ note }: AddendumFormProps) {
  const [state, formAction] = useActionState(createNotaAddendumAction, {});
  const disabled = !["confirmada", "con_addendum", "exportada"].includes(note.status);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="noteId" value={note.id} />
      <div>
        <h2 className="text-lg font-semibold text-ink">Addendum</h2>
        <p className="mt-1 text-sm text-ink/65">
          Crea una correccion vinculada sin sobrescribir la nota original.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Motivo de correccion</span>
        <input
          name="correctionReason"
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Contenido del addendum</span>
        <textarea
          name="content"
          rows={5}
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <SubmitButton disabled={disabled}>Registrar addendum</SubmitButton>
    </form>
  );
}
