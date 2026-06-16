import Link from "next/link";

import { PROCESS_MODEL_LABEL, type ProcesoListItem } from "@/lib/procesos/types";

type ProcessesTableProps = {
  procesos: ProcesoListItem[];
};

export function ProcessesTable({ procesos }: ProcessesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Paciente</th>
            <th className="px-4 py-3 font-semibold">Enfoque</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Inicio</th>
            <th className="px-4 py-3 font-semibold">Ultima actividad</th>
            <th className="px-4 py-3 font-semibold">Accion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {procesos.map((proceso) => (
            <tr key={proceso.id}>
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{proceso.patient.full_name}</p>
                <p className="mt-1 text-xs text-ink/60">{proceso.patient.email}</p>
              </td>
              <td className="px-4 py-3 text-ink/70">{PROCESS_MODEL_LABEL[proceso.model_type]}</td>
              <td className="px-4 py-3 text-ink/70">{proceso.status}</td>
              <td className="px-4 py-3 text-ink/70">
                {new Date(proceso.started_at).toLocaleDateString("es-MX")}
              </td>
              <td className="px-4 py-3 text-ink/70">
                {new Date(proceso.updated_at).toLocaleDateString("es-MX")}
              </td>
              <td className="px-4 py-3">
                <Link href={`/professional/procesos/${proceso.id}`} className="font-medium text-moss">
                  Abrir
                </Link>
              </td>
            </tr>
          ))}

          {procesos.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-ink/60" colSpan={6}>
                No hay procesos terapeuticos para mostrar.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
