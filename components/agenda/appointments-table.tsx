"use client";

import { useActionState } from "react";

import { cancelAppointmentAction } from "@/app/agenda/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import type { AppointmentListItem } from "@/lib/agenda/types";

type AppointmentsTableProps = {
  appointments: AppointmentListItem[];
};

function formatAppointmentDate(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function CancelAppointmentForm({ appointment }: { appointment: AppointmentListItem }) {
  const [state, formAction] = useActionState(cancelAppointmentAction, {});
  const isFuture = new Date(appointment.scheduled_at).getTime() > Date.now();
  const canCancel = appointment.status === "programada" && isFuture;

  if (!canCancel) {
    return <span className="text-xs text-ink/55">Solo lectura</span>;
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="appointmentId" value={appointment.id} />
      <textarea
        name="cancellationReason"
        required
        minLength={5}
        maxLength={1000}
        placeholder="Motivo de cancelacion"
        className="min-h-20 w-full rounded-md border border-ink/15 px-3 py-2 text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
      />
      <SubmitButton>Cancelar</SubmitButton>
      <ActionMessage message={state.message} ok={state.ok} />
    </form>
  );
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Paciente</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Duracion</th>
            <th className="px-4 py-3 font-semibold">Tipo</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Videollamada</th>
            <th className="px-4 py-3 font-semibold">Accion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{appointment.patient.full_name}</p>
                <p className="mt-1 text-xs text-ink/60">{appointment.patient.email}</p>
              </td>
              <td className="px-4 py-3 text-ink/70">
                {formatAppointmentDate(appointment.scheduled_at)}
              </td>
              <td className="px-4 py-3 text-ink/70">{appointment.duration_minutes} min</td>
              <td className="px-4 py-3 text-ink/70">{appointment.type}</td>
              <td className="px-4 py-3 text-ink/70">
                <span className="rounded-full bg-ink/5 px-2 py-1 text-xs font-medium">
                  {appointment.status}
                </span>
                {appointment.cancellation_reason ? (
                  <p className="mt-2 max-w-56 text-xs text-ink/55">
                    {appointment.cancellation_reason}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-ink/70">
                {appointment.zoom_join_url ? (
                  <a
                    href={appointment.zoom_join_url}
                    className="font-medium text-moss"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir enlace
                  </a>
                ) : (
                  <span className="text-xs text-ink/55">Pendiente</span>
                )}
              </td>
              <td className="w-72 px-4 py-3">
                <CancelAppointmentForm appointment={appointment} />
              </td>
            </tr>
          ))}

          {appointments.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-ink/60" colSpan={7}>
                No hay citas para mostrar.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
