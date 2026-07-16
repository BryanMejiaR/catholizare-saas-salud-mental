"use client";

import { useActionState } from "react";
import { useState } from "react";

import { createAppointmentRequestAction } from "@/app/portal/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";

type AppointmentRequestFormProps = {
  appointmentId: string;
};

export function AppointmentRequestForm({ appointmentId }: AppointmentRequestFormProps) {
  const [state, formAction] = useActionState(createAppointmentRequestAction, {});
  const [showRequestFields, setShowRequestFields] = useState(false);

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <label className="flex items-center gap-2 text-xs font-medium text-ink">
        <input
          type="checkbox"
          checked={showRequestFields}
          onChange={(event) => setShowRequestFields(event.target.checked)}
        />
        Necesito solicitar reprogramacion o cancelacion
      </label>

      {showRequestFields ? (
        <>
          <select
            name="requestType"
            required
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            <option value="reprogramacion">Solicitar reprogramacion</option>
            <option value="cancelacion">Solicitar cancelacion</option>
          </select>
          <textarea
            name="message"
            required
            minLength={5}
            maxLength={1200}
            placeholder="Mensaje breve, sin incluir informacion clinica sensible."
            className="min-h-20 w-full rounded-md border border-ink/15 px-3 py-2 text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
          <SubmitButton>Enviar solicitud</SubmitButton>
          <ActionMessage message={state.message} ok={state.ok} />
        </>
      ) : null}
    </form>
  );
}
