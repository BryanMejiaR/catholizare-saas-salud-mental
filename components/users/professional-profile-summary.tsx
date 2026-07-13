import type { ProfessionalProfileSummary } from "@/lib/users/professional-profile";

export function ProfessionalProfileSummaryCard({
  summary
}: {
  summary: ProfessionalProfileSummary;
}) {
  const metrics = [
    ["Edad", summary.age],
    ["Pacientes asignados", summary.assigned_patients_count],
    ["Borradores activos", summary.draft_notes_count],
    ["Notas clinicas confirmadas", summary.confirmed_notes_count],
    ["Sesiones completadas", summary.completed_sessions_count],
    ["Cedula profesional", summary.professional_license]
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-xl font-semibold text-ink">{summary.full_name}</h2>
        <p className="mt-1 text-sm text-ink/60">{summary.email}</p>
        <p className="mt-2 text-sm font-medium text-moss">Estado: {summary.account_status}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-ink/10 bg-white p-5">
            <p className="text-sm text-ink/60">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h3 className="text-lg font-semibold text-ink">Estatus de pacientes</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {summary.patient_statuses.map((status) => (
            <div key={status.label} className="rounded-md border border-ink/10 p-4">
              <p className="text-sm text-ink/60">{status.label}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{status.value}</p>
            </div>
          ))}
          {summary.patient_statuses.length === 0 ? (
            <p className="text-sm text-ink/65">No hay pacientes asignados.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
