"use client";

import { useActionState } from "react";

import { requestAssessmentAiDraftAction } from "@/app/evaluaciones/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";

type AssessmentAiDraftFormProps = {
  assessmentId: string;
  disabled?: boolean;
};

export function AssessmentAiDraftForm({ assessmentId, disabled = false }: AssessmentAiDraftFormProps) {
  const [state, formAction] = useActionState(requestAssessmentAiDraftAction, {});

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-moss/20 bg-moss/5 p-4">
      <input type="hidden" name="assessmentId" value={assessmentId} />

      <div>
        <h4 className="text-sm font-semibold text-ink">Analisis asistido por IA</h4>
        <p className="mt-1 text-xs text-ink/60">
          La IA genera un borrador tecnico. No inventa baremos ni sustituye el juicio profesional.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Directrices clinicas</span>
        <textarea
          name="directives"
          rows={3}
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <ActionMessage message={state.message} ok={state.ok} />

      {state.draft ? (
        <div className="rounded-md border border-ink/10 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-ink/50">Borrador generado</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{state.draft}</pre>
        </div>
      ) : null}

      <SubmitButton disabled={disabled}>Generar borrador</SubmitButton>
    </form>
  );
}
