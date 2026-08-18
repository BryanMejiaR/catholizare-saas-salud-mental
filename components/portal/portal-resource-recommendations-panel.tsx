"use client";

import { useActionState } from "react";

import { savePatientResourcePreferencesAction } from "@/app/portal/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import {
  PORTAL_RESOURCE_TOPIC_LABELS,
  PORTAL_RESOURCE_TOPICS,
  type PortalBlogRecommendation,
  type PortalResourceTopic
} from "@/lib/portal/resource-recommendations";

type PortalResourceRecommendationsPanelProps = {
  selectedTopics: PortalResourceTopic[];
  recommendations: PortalBlogRecommendation[];
};

export function PortalResourceRecommendationsPanel({
  selectedTopics,
  recommendations
}: PortalResourceRecommendationsPanelProps) {
  const [state, formAction] = useActionState(savePatientResourcePreferencesAction, {});
  const selected = new Set(selectedTopics);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">Recursos y recomendaciones</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Elige los temas sobre los que quieres recibir lecturas de los blogs de Catholizare.
            Puedes modificar esta seleccion cuando quieras.
          </p>
        </div>

        <ActionMessage message={state.message} ok={state.ok} />

        <div className="grid gap-3 md:grid-cols-2">
          {PORTAL_RESOURCE_TOPICS.map((topic) => (
            <label
              key={topic}
              className="flex items-start gap-3 rounded-md border border-ink/10 bg-grisMuyClaro p-3 text-sm text-ink"
            >
              <input
                name="topics"
                type="checkbox"
                value={topic}
                defaultChecked={selected.has(topic)}
                className="mt-1"
              />
              <span>{PORTAL_RESOURCE_TOPIC_LABELS[topic]}</span>
            </label>
          ))}
        </div>

        <SubmitButton>Guardar temas de interes</SubmitButton>
      </form>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h3 className="text-lg font-semibold text-ink">Lecturas recomendadas</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recommendations.map((recommendation) => (
            <a
              key={recommendation.id}
              href={recommendation.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-ink/10 p-4 transition hover:border-azulMedio"
            >
              <p className="text-sm font-semibold text-ink">{recommendation.title}</p>
              <p className="mt-1 text-xs text-ink/60">{recommendation.description}</p>
              <p className="mt-3 text-xs font-semibold text-azulMedio">
                {PORTAL_RESOURCE_TOPIC_LABELS[recommendation.topic]}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
