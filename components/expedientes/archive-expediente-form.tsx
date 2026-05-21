"use client";

import { useActionState } from "react";

import { archiveExpedienteAction } from "@/app/expedientes/actions";
import { ActionMessage } from "@/components/users/action-message";

type ArchiveExpedienteFormProps = {
  expedienteId: string;
  disabled?: boolean;
};

export function ArchiveExpedienteForm({ expedienteId, disabled }: ArchiveExpedienteFormProps) {
  const [state, formAction] = useActionState(archiveExpedienteAction, {});

  return (
    <form action={formAction} className="rounded-lg border border-clay/30 bg-white p-5">
      <input type="hidden" name="expedienteId" value={expedienteId} />
      <h2 className="text-lg font-semibold text-ink">Archivar expediente</h2>
      <p className="mt-1 text-sm text-ink/65">
        El archivado es logico. El expediente se conserva por trazabilidad y retencion normativa.
      </p>
      <div className="mt-4">
        <ActionMessage message={state.message} ok={state.ok} />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-clay px-4 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        Archivar
      </button>
    </form>
  );
}
