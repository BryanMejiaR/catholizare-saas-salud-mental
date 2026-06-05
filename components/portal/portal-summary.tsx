import type { PatientPortalSummary } from "@/lib/portal/types";

type PortalSummaryProps = {
  summary: PatientPortalSummary | null;
};

export function PortalSummary({ summary }: PortalSummaryProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Resumen terapeutico compartido</h2>
      {summary ? (
        <div className="mt-4 space-y-3">
          <p className="whitespace-pre-wrap text-sm leading-6 text-ink/75">{summary.content}</p>
          <p className="text-xs text-ink/55">
            Publicado por {summary.professional.full_name}
            {summary.published_at
              ? ` el ${new Date(summary.published_at).toLocaleDateString("es-MX")}`
              : ""}
            .
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink/65">
          Aun no hay un resumen terapeutico publicado para tu portal.
        </p>
      )}
    </section>
  );
}
