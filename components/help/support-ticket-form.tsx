"use client";

import { useActionState } from "react";

import { createSupportTicketAction } from "@/app/help/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import { SUPPORT_TICKET_PRIORITIES } from "@/lib/help/types";

export function SupportTicketForm() {
  const [state, formAction] = useActionState(createSupportTicketAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Contactar soporte</h2>
        <p className="mt-1 text-sm text-ink/65">
          Describe problemas de uso de plataforma. No incluyas datos clinicos, nombres de pacientes,
          notas, expedientes ni pruebas psicologicas.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Categoria</span>
          <select
            name="category"
            defaultValue="soporte_tecnico"
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            <option value="acceso">Acceso y contrasena</option>
            <option value="pacientes">Pacientes</option>
            <option value="expediente">Expediente</option>
            <option value="notas">Notas clinicas</option>
            <option value="agenda">Agenda</option>
            <option value="integraciones">Integraciones</option>
            <option value="evaluaciones">Evaluaciones psicologicas</option>
            <option value="soporte_tecnico">Soporte tecnico</option>
            <option value="seguridad">Privacidad y seguridad</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Prioridad</span>
          <select
            name="priority"
            defaultValue="media"
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            {SUPPORT_TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Asunto</span>
        <input
          name="subject"
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Descripcion</span>
        <textarea
          name="description"
          rows={5}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="flex items-start gap-3 rounded-md border border-clay/30 bg-clay/10 p-3 text-sm text-ink">
        <input name="privacyConfirmation" type="checkbox" className="mt-1" />
        Confirmo que esta solicitud no contiene datos clinicos sensibles, nombres de pacientes,
        imagenes de pruebas, notas clinicas ni expedientes completos.
      </label>

      <SubmitButton>Enviar solicitud</SubmitButton>
    </form>
  );
}
