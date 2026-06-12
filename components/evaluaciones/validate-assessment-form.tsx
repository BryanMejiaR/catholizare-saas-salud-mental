"use client";

import { useActionState } from "react";

import { validateAssessmentAction } from "@/app/evaluaciones/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import type { PsychologicalAssessment } from "@/lib/evaluaciones/types";

type ValidateAssessmentFormProps = {
  assessment: PsychologicalAssessment;
  disabled?: boolean;
};

function formatJson(value: Record<string, unknown>) {
  return Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : "";
}

export function ValidateAssessmentForm({
  assessment,
  disabled = false
}: ValidateAssessmentFormProps) {
  const [state, formAction] = useActionState(validateAssessmentAction, {});
  const isFinal = ["validada", "archivada", "anulada_logicamente"].includes(assessment.status);
  const formDisabled = disabled || isFinal;

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-ink/10 bg-ink/[0.02] p-4">
      <input type="hidden" name="assessmentId" value={assessment.id} />

      <div>
        <h4 className="text-sm font-semibold text-ink">Resultados validados</h4>
        <p className="mt-1 text-xs text-ink/60">
          Al validar, la evaluacion queda incorporada al expediente y ya no puede editarse.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Puntajes directos JSON</span>
          <textarea
            name="rawScores"
            rows={4}
            disabled={formDisabled}
            defaultValue={formatJson(assessment.raw_scores)}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Puntajes transformados JSON</span>
          <textarea
            name="scaledScores"
            rows={4}
            disabled={formDisabled}
            defaultValue={formatJson(assessment.scaled_scores)}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Percentiles JSON</span>
          <textarea
            name="percentiles"
            rows={4}
            disabled={formDisabled}
            defaultValue={formatJson(assessment.percentiles)}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Puntos de corte JSON</span>
          <textarea
            name="cutoffPoints"
            rows={4}
            disabled={formDisabled}
            defaultValue={formatJson(assessment.cutoff_points)}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Interpretacion clinica</span>
        <textarea
          name="interpretation"
          rows={5}
          disabled={formDisabled}
          defaultValue={assessment.interpretation ?? assessment.ai_draft_interpretation ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Limitaciones</span>
          <textarea
            name="limitations"
            rows={4}
            disabled={formDisabled}
            defaultValue={assessment.limitations ?? ""}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Implicaciones terapeuticas</span>
          <textarea
            name="implications"
            rows={4}
            disabled={formDisabled}
            defaultValue={assessment.implications ?? ""}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Notas comparativas</span>
        <textarea
          name="comparisonNotes"
          rows={3}
          disabled={formDisabled}
          defaultValue={assessment.comparison_notes ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <SubmitButton disabled={formDisabled}>Validar evaluacion</SubmitButton>
    </form>
  );
}
