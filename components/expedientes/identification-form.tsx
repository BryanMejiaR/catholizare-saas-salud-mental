"use client";

import { useActionState } from "react";

import { updateExpedienteIdentificationAction } from "@/app/expedientes/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import type { ExpedienteDetail } from "@/lib/expedientes/types";

type IdentificationFormProps = {
  expediente: ExpedienteDetail;
};

export function IdentificationForm({ expediente }: IdentificationFormProps) {
  const [state, formAction] = useActionState(updateExpedienteIdentificationAction, {});
  const identification = expediente.identification_data;

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="expedienteId" value={expediente.id} />
      <div>
        <h2 className="text-lg font-semibold text-ink">Identificacion del Paciente</h2>
        <p className="mt-1 text-sm text-ink/65">Datos sensibles, no visibles para Administrador.</p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Motivo de consulta inicial</span>
        <textarea
          name="initialConsultationReason"
          required
          rows={3}
          defaultValue={expediente.initial_consultation_reason ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Fecha de nacimiento</span>
          <input
            name="birthDate"
            type="date"
            defaultValue={identification.birthDate ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Edad</span>
          <input
            name="age"
            type="number"
            min="0"
            max="130"
            defaultValue={identification.age ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Sexo</span>
          <input
            name="sex"
            defaultValue={identification.sex ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Telefono</span>
          <input
            name="phone"
            defaultValue={identification.phone ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Domicilio o residencia</span>
        <input
          name="residence"
          defaultValue={identification.residence ?? ""}
          className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Contacto de emergencia</span>
          <input
            name="emergencyContactName"
            defaultValue={identification.emergencyContactName ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Telefono de emergencia</span>
          <input
            name="emergencyContactPhone"
            defaultValue={identification.emergencyContactPhone ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Responsable legal</span>
          <input
            name="legalGuardianName"
            defaultValue={identification.legalGuardianName ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Telefono responsable legal</span>
          <input
            name="legalGuardianPhone"
            defaultValue={identification.legalGuardianPhone ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>
      </div>

      <SubmitButton>Guardar identificacion</SubmitButton>
    </form>
  );
}
