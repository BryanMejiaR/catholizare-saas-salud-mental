import Link from "next/link";

import type { NotaClinicaListItem, NotaClinicaSummary } from "@/lib/notas/types";

type NotasTableProps = {
  notas: Array<NotaClinicaSummary | NotaClinicaListItem>;
  emptyMessage?: string;
  showPatient?: boolean;
};

const noteTypeLabels: Record<NotaClinicaSummary["note_type"], string> = {
  admision: "Admision",
  evolucion: "Evolucion",
  sesion: "Sesión",
  interconsulta: "Interconsulta",
  referencia_traslado: "Referencia o traslado",
  egreso: "Egreso",
  addendum: "Correccion historica"
};

const statusLabels: Record<NotaClinicaSummary["status"], string> = {
  borrador: "Borrador editable",
  confirmada: "Confirmada no editable",
  con_addendum: "Con correccion historica",
  anulada_logicamente: "Anulada logicamente",
  exportada: "Exportada no editable"
};

function hasPatient(nota: NotaClinicaSummary | NotaClinicaListItem): nota is NotaClinicaListItem {
  return "patient" in nota;
}

export function NotasTable({
  notas,
  emptyMessage = "No hay notas clinicas para este expediente.",
  showPatient = false
}: NotasTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            {showPatient ? <th className="px-4 py-3 font-semibold">Paciente</th> : null}
            <th className="px-4 py-3 font-semibold">Tipo</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Resumen</th>
            <th className="px-4 py-3 font-semibold">Accion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {notas.map((nota) => (
            <tr key={nota.id}>
              {showPatient ? (
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">
                    {hasPatient(nota) ? nota.patient.full_name : "Paciente"}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">
                    {hasPatient(nota) ? nota.patient.email : ""}
                  </p>
                </td>
              ) : null}
              <td className="px-4 py-3 text-ink">{noteTypeLabels[nota.note_type]}</td>
              <td className="px-4 py-3 text-ink/70">{statusLabels[nota.status]}</td>
              <td className="px-4 py-3 text-ink/70">
                {new Date(nota.session_date).toLocaleDateString("es-MX")}
              </td>
              <td className="max-w-md px-4 py-3 text-ink/70">
                <span className="line-clamp-2">{nota.clinical_summary ?? "Sin resumen"}</span>
              </td>
              <td className="px-4 py-3">
                <Link href={`/professional/notas/${nota.id}`} className="font-medium text-moss">
                  Abrir
                </Link>
              </td>
            </tr>
          ))}

          {notas.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-ink/60" colSpan={showPatient ? 6 : 5}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
