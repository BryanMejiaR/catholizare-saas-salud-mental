"use client";

import { useActionState } from "react";

import { reviewProfessionalExportRequestAction } from "@/app/data-export/actions";
type ExportRequestReviewFormProps = {
  requestId: string;
  disabled?: boolean;
};

const initialState = {
  message: "",
  ok: false,
  link: ""
};

export function ExportRequestReviewForm({
  requestId,
  disabled = false
}: ExportRequestReviewFormProps) {
  const [state, formAction] = useActionState(reviewProfessionalExportRequestAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="block text-xs font-semibold uppercase text-ink/50">
        Motivo de rechazo
        <textarea
          name="rejectionReason"
          rows={2}
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-ink"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="submit"
          name="decision"
          value="reject"
          disabled={disabled}
          className="h-11 rounded-md border border-clay px-4 text-sm font-semibold text-clay disabled:opacity-60"
        >
          Rechazar
        </button>
        <button
          type="submit"
          name="decision"
          value="approve"
          disabled={disabled}
          className="h-11 rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-60"
        >
          Aprobar
        </button>
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-moss" : "text-clay"}`}>{state.message}</p>
      ) : null}
      {state.link ? (
        <div className="rounded-md border border-gold/30 bg-gold/10 p-3 text-xs text-ink">
          <p className="font-semibold">Link de aceptacion MVP</p>
          <p className="mt-1 break-all">{state.link}</p>
        </div>
      ) : null}
    </form>
  );
}
