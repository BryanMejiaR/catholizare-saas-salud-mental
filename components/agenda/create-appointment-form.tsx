"use client";

import { useActionState } from "react";

import { createAppointmentAction } from "@/app/agenda/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import { APPOINTMENT_TYPES, type AgendaPatientOption } from "@/lib/agenda/types";

type CreateAppointmentFormProps = {
  patients: AgendaPatientOption[];
};

export function CreateAppointmentForm({ patients }: CreateAppointmentFormProps) {
  const [state, formAction] = useActionState(createAppointmentAction, {});
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="timezoneOffsetMinutes" value={timezoneOffsetMinutes} />

      <div>
        <h2 className="text-lg font-semibold text-ink">Programar cita</h2>
        <p className="mt-1 text-sm text-ink/65">
          Selecciona un Paciente con expediente activo. Google Calendar se sincroniza si la cuenta
          esta conectada.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Paciente</span>
        <select
          name="patientId"
          required
          disabled={patients.length === 0}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          <option value="">Seleccionar paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.full_name} - {patient.email}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Fecha</span>
          <input
            name="scheduledDate"
            type="date"
            required
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Hora</span>
          <input
            name="scheduledTime"
            type="time"
            required
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Duracion</span>
          <select
            name="durationMinutes"
            defaultValue="50"
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            <option value="30">30 minutos</option>
            <option value="50">50 minutos</option>
            <option value="60">60 minutos</option>
            <option value="90">90 minutos</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Tipo</span>
          <select
            name="type"
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            {APPOINTMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <SubmitButton disabled={patients.length === 0}>Crear cita</SubmitButton>
    </form>
  );
}
