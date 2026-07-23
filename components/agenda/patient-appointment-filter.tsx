import type { AgendaPatientOption } from "@/lib/agenda/types";
import { SearchablePersonSelect } from "@/components/forms/searchable-person-select";

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
      <SearchablePersonSelect
        name="patientId"
        label="Consultar citas por paciente"
        options={patients.map((patient) => ({
          id: patient.id,
          label: patient.full_name,
          detail: patient.email
        }))}
        defaultValue={selectedPatientId ?? ""}
        placeholder="Buscar paciente por nombre..."
        emptyHint="Deja el campo vacio para ver todos los pacientes."
      />
      <button
        type="submit"
        className="mt-4 inline-flex h-10 items-center rounded-md bg-moss px-4 text-sm font-semibold text-white"
      >
        Filtrar
      </button>
    </form>
  );
}
