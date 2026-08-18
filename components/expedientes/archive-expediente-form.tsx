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
    <form action={formAction} className="rounded-lg border border-rojoRompe/30 bg-white p-5">
      <input type="hidden" name="expedienteId" value={expedienteId} />
      <h2 className="text-lg font-semibold text-ink">Archivar expediente</h2>
      <p className="mt-1 text-sm text-ink/65">
        El archivado es logico. El expediente se conserva por trazabilidad y retencion normativa.
      </p>
      <p className="mt-3 rounded-md border border-rojoRompe/30 bg-rojoRompe/10 px-3 py-2 text-sm font-semibold text-rojoRompe">
        Si archivas este expediente no podras volverlo a modificar.
      </p>
      <div className="mt-4">
        <ActionMessage message={state.message} ok={state.ok} />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-rojoRompe px-4 text-sm font-semibold text-rojoRompe transition hover:bg-rojoRompe hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        Archivar
      </button>
    </form>
  );
}
