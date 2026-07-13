import type { PortalRecommendation } from "@/lib/portal/types";

type PortalRecommendationsPanelProps = {
  recommendations: PortalRecommendation[];
};

export function PortalRecommendationsPanel({ recommendations }: PortalRecommendationsPanelProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Recomendaciones de tu profesional</h2>
      <div className="mt-4 space-y-4">
        {recommendations.map((recommendation) => (
          <article key={recommendation.id} className="rounded-md border border-ink/10 p-4">
            <p className="text-xs text-ink/55">
              {recommendation.session_date
                ? new Date(recommendation.session_date).toLocaleDateString("es-MX")
                : "Sesion reciente"}{" "}
              - {recommendation.professional.full_name}
            </p>
            {recommendation.topic ? (
              <p className="mt-2 text-sm text-ink">
                <span className="font-semibold">Tema:</span> {recommendation.topic}
              </p>
            ) : null}
            {recommendation.techniques ? (
              <p className="mt-2 text-sm text-ink">
                <span className="font-semibold">Tecnicas:</span> {recommendation.techniques}
              </p>
            ) : null}
            {recommendation.homework ? (
              <p className="mt-2 text-sm text-ink">
                <span className="font-semibold">Tarea:</span> {recommendation.homework}
              </p>
            ) : null}
          </article>
        ))}

        {recommendations.length === 0 ? (
          <p className="text-sm text-ink/65">
            Aun no hay recomendaciones compartidas desde tus notas de sesion.
          </p>
        ) : null}
      </div>
    </section>
  );
}
