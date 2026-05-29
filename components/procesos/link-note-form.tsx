"use client";

import { useActionState } from "react";

import { closeGeneralProcessAction, linkNoteToProcessAction } from "@/app/procesos/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import type { NotaClinicaSummary } from "@/lib/notas/types";
import type { ProcesoDetail } from "@/lib/procesos/types";

type LinkNoteFormProps = {
  process: ProcesoDetail;
  notes: NotaClinicaSummary[];
};

export function LinkNoteForm({ process, notes }: LinkNoteFormProps) {
  const [linkState, linkAction] = useActionState(linkNoteToProcessAction, {});
  const [closeState, closeAction] = useActionState(closeGeneralProcessAction, {});
  const disabled = process.status !== "activo";
  const confirmedNotes = notes.filter((note) =>
    ["confirmada", "con_addendum", "exportada"].includes(note.status)
  );
  const egresoNotes = confirmedNotes.filter((note) => note.note_type === "egreso");

  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Notas vinculadas</h2>
        <p className="mt-1 text-sm text-ink/65">
          Las notas confirmadas pueden vincularse al proceso. El cierre requiere nota de egreso.
        </p>
      </div>

      <form action={linkAction} className="space-y-3">
        <input type="hidden" name="processId" value={process.id} />
        <ActionMessage message={linkState.message} ok={linkState.ok} />
        <select
          name="noteId"
          disabled={disabled}
          className="w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          <option value="">Seleccionar nota confirmada</option>
          {confirmedNotes.map((note) => (
            <option key={note.id} value={note.id}>
              {note.note_type} - {new Date(note.session_date).toLocaleDateString("es-MX")}
            </option>
          ))}
        </select>
        <SubmitButton disabled={disabled}>Vincular nota</SubmitButton>
      </form>

      <form action={closeAction} className="space-y-3 border-t border-ink/10 pt-4">
        <input type="hidden" name="processId" value={process.id} />
        <ActionMessage message={closeState.message} ok={closeState.ok} />
        <select
          name="closureNoteId"
          disabled={disabled}
          className="w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          <option value="">Seleccionar nota de egreso confirmada</option>
          {egresoNotes.map((note) => (
            <option key={note.id} value={note.id}>
              Egreso - {new Date(note.session_date).toLocaleDateString("es-MX")}
            </option>
          ))}
        </select>
        <SubmitButton disabled={disabled || egresoNotes.length === 0}>Cerrar proceso</SubmitButton>
      </form>
    </section>
  );
}
