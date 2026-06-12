import {
  NOTA_CLINICA_STATUSES,
  NOTA_CLINICA_TYPES,
  type NotaClinicaFilters
} from "@/lib/notas/types";
import type { UserManagementProfile } from "@/lib/users/types";

type NotasFilterFormProps = {
  filters: NotaClinicaFilters;
  patients: UserManagementProfile[];
};

const noteTypeLabels: Record<(typeof NOTA_CLINICA_TYPES)[number], string> = {
  sesion: "Sesión",
  interconsulta: "Interconsulta",
  referencia_traslado: "Referencia o traslado",
  egreso: "Egreso"
};

export function NotasFilterForm({ filters, patients }: NotasFilterFormProps) {
  return (
    <form className="grid gap-4 rounded-lg border border-ink/10 bg-white p-5 md:grid-cols-3">
      <label className="block">
        <span className="text-sm font-medium text-ink">Paciente</span>
        <select
          name="patientId"
          defaultValue={filters.patientId ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          <option value="">Todos</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.full_name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Tipo</span>
        <select
          name="noteType"
          defaultValue={filters.noteType ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          <option value="">Todos</option>
          {NOTA_CLINICA_TYPES.map((type) => (
            <option key={type} value={type}>
              {noteTypeLabels[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Estado</span>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          <option value="">Todos</option>
          {NOTA_CLINICA_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Desde</span>
        <input
          type="date"
          name="dateFrom"
          defaultValue={filters.dateFrom ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Hasta</span>
        <input
          type="date"
          name="dateTo"
          defaultValue={filters.dateTo ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Texto</span>
        <input
          name="query"
          defaultValue={filters.query ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <div className="md:col-span-3">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-moss px-5 text-sm font-semibold text-white transition hover:bg-ink"
        >
          Filtrar notas
        </button>
      </div>
    </form>
  );
}
