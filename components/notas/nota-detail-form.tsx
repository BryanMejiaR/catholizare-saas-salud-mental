"use client";

import { useActionState } from "react";

import {
  confirmNotaClinicaAction,
  updateDraftNotaClinicaAction
} from "@/app/notas/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import { NotaFields } from "@/components/notas/nota-fields";
import type { NotaClinica } from "@/lib/notas/types";

type NotaDetailFormProps = {
  note: NotaClinica;
};

export function NotaDetailForm({ note }: NotaDetailFormProps) {
  const [draftState, draftAction] = useActionState(updateDraftNotaClinicaAction, {});
  const [confirmState, confirmAction] = useActionState(confirmNotaClinicaAction, {});
  const isDraft = note.status === "borrador";

  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Contenido de la nota</h2>
        <p className="mt-1 text-sm text-ink/65">
          Estado: {note.status}. Las notas confirmadas quedan inmutables y solo permiten anulacion
          logica.
        </p>
      </div>
      <p className="rounded-md border border-clay/30 bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">
        Al guardar y confirmar la nota clinica ya no se podra modificar y en caso de requerirlo se
        debera anular y crear una nueva.
      </p>

      <form action={draftAction} className="space-y-4">
        <input type="hidden" name="noteId" value={note.id} />
        <ActionMessage message={draftState.message} ok={draftState.ok} />
        <NotaFields note={note} disabled={!isDraft} />
        <div className="grid gap-3 md:grid-cols-2">
          <SubmitButton disabled={!isDraft}>Guardar borrador</SubmitButton>
          <button
            type="submit"
            name="intent"
            value="confirm"
            disabled={!isDraft}
            className="inline-flex h-11 items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            Guardar y confirmar nota clinica
          </button>
        </div>
      </form>

      {isDraft ? (
        <form action={confirmAction} className="border-t border-ink/10 pt-4">
          <input type="hidden" name="noteId" value={note.id} />
          <ActionMessage message={confirmState.message} ok={confirmState.ok} />
          <SubmitButton>Confirmar nota clinica</SubmitButton>
        </form>
      ) : null}
    </section>
  );
}
