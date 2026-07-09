import type { AgendaPatientOption } from "@/lib/agenda/types";

type PatientAppointmentFilterProps = {
  patients: AgendaPatientOption[];
  selectedPatientId?: string;
};

export function PatientAppointmentFilter({
  patients,
  selectedPatientId
}: PatientAppointmentFilterProps) {
  return (
    <form className="rounded-lg border border-ink/10 bg-white p-5">
      <label className="block">
        <span className="text-sm font-medium text-ink">Consultar citas por paciente</span>
        <select
          name="patientId"
          defaultValue={selectedPatientId ?? ""}
          className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          <option value="">Todos los pacientes</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.full_name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="mt-4 inline-flex h-10 items-center rounded-md bg-moss px-4 text-sm font-semibold text-white"
      >
        Filtrar
      </button>
    </form>
  );
}
