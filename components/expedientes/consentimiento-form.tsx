"use client";

import { useActionState } from "react";

import { updateConsentimientoAction } from "@/app/expedientes/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import type { ExpedienteDetail } from "@/lib/expedientes/types";

type ConsentimientoFormProps = {
  expediente: ExpedienteDetail;
};

export function ConsentimientoForm({ expediente }: ConsentimientoFormProps) {
  const [state, formAction] = useActionState(updateConsentimientoAction, {});
  const consentimiento = expediente.consentimiento;

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="expedienteId" value={expediente.id} />
      <div>
        <h2 className="text-lg font-semibold text-ink">Consentimiento informado</h2>
        <p className="mt-1 text-sm text-ink/65">
          Registra estado y referencia del consentimiento antes de iniciar atencion ordinaria.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Estado</span>
          <select
            name="status"
            defaultValue={consentimiento?.status ?? expediente.consent_status}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            <option value="pendiente">pendiente</option>
            <option value="firmado_fisico">firmado_fisico</option>
            <option value="firmado_digital">firmado_digital</option>
            <option value="excepcion_justificada">excepcion_justificada</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Modalidad</span>
          <select
            name="modality"
            defaultValue={consentimiento?.modality ?? "pendiente"}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            <option value="pendiente">pendiente</option>
            <option value="fisico">fisico</option>
            <option value="digital">digital</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Fecha de firma</span>
          <input
            name="signedAt"
            type="date"
            defaultValue={consentimiento?.signed_at ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Referencia de documento</span>
          <input
            name="documentReference"
            defaultValue={consentimiento?.document_reference ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>
      </div>

      <SubmitButton>Registrar consentimiento</SubmitButton>
    </form>
  );
}
