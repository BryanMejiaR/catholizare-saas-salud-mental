"use client";

import { useActionState } from "react";

import { requestProfessionalExportAction } from "@/app/data-export/actions";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState = {
  message: "",
  ok: false
};

export function ProfessionalExportRequestForm() {
  const [state, formAction] = useActionState(requestProfessionalExportAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Solicitar descarga total</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Esta solicitud sera revisada por Super Admin. La descarga requiere aceptacion legal
        posterior y queda auditada.
      </p>

      <label className="mt-4 block text-sm font-medium text-ink">
        Motivo de la solicitud
        <textarea
          name="reason"
          rows={5}
          minLength={10}
          maxLength={2000}
          required
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
        />
      </label>

      <div className="mt-4">
        <SubmitButton>Enviar solicitud</SubmitButton>
      </div>
      {state.message ? (
        <p className={`mt-3 text-sm ${state.ok ? "text-moss" : "text-clay"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
