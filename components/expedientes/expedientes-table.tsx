import Link from "next/link";

import type { ExpedienteSummary } from "@/lib/expedientes/types";

type ExpedientesTableProps = {
  expedientes: ExpedienteSummary[];
};

export function ExpedientesTable({ expedientes }: ExpedientesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Paciente</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Consentimiento</th>
            <th className="px-4 py-3 font-semibold">Ultima actividad</th>
            <th className="px-4 py-3 font-semibold">Accion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {expedientes.map((expediente) => (
            <tr key={expediente.id}>
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{expediente.patient.full_name}</p>
                <p className="mt-1 text-xs text-ink/60">{expediente.patient.email}</p>
              </td>
              <td className="px-4 py-3 text-ink/70">{expediente.status}</td>
              <td className="px-4 py-3 text-ink/70">{expediente.consent_status}</td>
              <td className="px-4 py-3 text-ink/70">
                {new Date(expediente.last_clinical_activity_at).toLocaleDateString("es-MX")}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/professional/expedientes/${expediente.id}`}
                  className="font-medium text-moss"
                >
                  Abrir
                </Link>
              </td>
            </tr>
          ))}

          {expedientes.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-ink/60" colSpan={5}>
                No hay expedientes para mostrar.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
