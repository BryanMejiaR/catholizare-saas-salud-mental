"use client";

import { useActionState } from "react";

import { createExpedienteAction } from "@/app/expedientes/actions";
import { SearchablePersonSelect } from "@/components/forms/searchable-person-select";
import { ActionMessage } from "@/components/users/action-message";
import { SubmitButton } from "@/components/auth/submit-button";
import type { UserManagementProfile } from "@/lib/users/types";

type CreateExpedienteFormProps = {
  patients: UserManagementProfile[];
};

export function CreateExpedienteForm({ patients }: CreateExpedienteFormProps) {
  const [state, formAction] = useActionState(createExpedienteAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Crear expediente clinico</h2>
        <p className="mt-1 text-sm text-ink/65">
          Solo aparecen Pacientes asignados a tu cuenta profesional.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <SearchablePersonSelect
        name="patientId"
        label="Paciente"
        options={patients.map((patient) => ({
          id: patient.id,
          label: patient.full_name,
          detail: patient.email
        }))}
        placeholder="Buscar paciente por nombre..."
        emptyHint="Selecciona un paciente de la lista."
        required
      />

      <label className="block">
        <span className="text-sm font-medium text-ink">Motivo de consulta inicial</span>
        <textarea
          name="initialConsultationReason"
          required
          rows={4}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <SubmitButton>Crear expediente</SubmitButton>
    </form>
  );
}
