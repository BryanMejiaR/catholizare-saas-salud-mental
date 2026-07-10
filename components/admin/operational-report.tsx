import type { AdminOperationalReport } from "@/lib/admin/types";

type OperationalReportProps = {
  report: AdminOperationalReport;
};

function MetricsSection({ title, metrics }: { title: string; metrics: AdminOperationalReport["users"] }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-ink/10 p-4">
            <p className="text-sm text-ink/60">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TextMetricsSection({
  title,
  metrics
}: {
  title: string;
  metrics: AdminOperationalReport["metadataHighlights"];
}) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {metrics.map((metric, index) => (
          <div key={`${metric.label}-${index}`} className="rounded-md border border-ink/10 p-4">
            <p className="text-sm text-ink/60">{metric.label}</p>
            <p className="mt-2 text-sm font-semibold text-ink">{metric.value}</p>
          </div>
        ))}
        {metrics.length === 0 ? (
          <p className="text-sm text-ink/65">Sin datos suficientes para mostrar.</p>
        ) : null}
      </div>
    </section>
  );
}

export function OperationalReport({ report }: OperationalReportProps) {
  return (
    <div className="space-y-6">
      <MetricsSection title="Usuarios" metrics={report.users} />
      <MetricsSection title="Expedientes clínicos" metrics={report.expedientes} />
      <MetricsSection title="Agenda" metrics={report.appointments} />
      <MetricsSection title="Dashboard de agenda" metrics={report.appointmentPeriods} />
      <MetricsSection title="Metadata de pacientes" metrics={report.patientMetadata} />
      <MetricsSection title="Metadata de profesionales" metrics={report.professionalMetadata} />
      <MetricsSection title="Metadata operativa de plataforma" metrics={report.platformMetadata} />
      <TextMetricsSection title="Motivos de consulta frecuentes" metrics={report.metadataHighlights} />

      <section className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-ink">Actividad por profesional</h2>
        </div>
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-ink/5 text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Profesional</th>
              <th className="px-4 py-3 font-semibold">Pacientes asignados</th>
              <th className="px-4 py-3 font-semibold">Citas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {report.professionals.map((professional) => (
              <tr key={professional.professional_id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{professional.full_name}</p>
                  <p className="mt-1 text-xs text-ink/55">{professional.email}</p>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {professional.assigned_patients_count}
                </td>
                <td className="px-4 py-3 text-ink/70">{professional.appointments_count}</td>
              </tr>
            ))}
            {report.professionals.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-ink/60" colSpan={3}>
                  No hay profesionales activos para mostrar.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
