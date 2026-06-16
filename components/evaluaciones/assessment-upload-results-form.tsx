"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { updateAssessmentUploadResultsAction } from "@/app/evaluaciones/actions";
import type { PatientAssessmentUpload } from "@/lib/evaluaciones/types";
import { getAssessmentResultTemplate } from "@/lib/evaluaciones/upload-results";

type AssessmentUploadResultsFormProps = {
  upload: PatientAssessmentUpload;
  disabled?: boolean;
};

const initialState = {
  message: "",
  ok: false
};

export function AssessmentUploadResultsForm({
  upload,
  disabled = false
}: AssessmentUploadResultsFormProps) {
  const [state, formAction] = useActionState(updateAssessmentUploadResultsAction, initialState);
  const defaultResults =
    Object.keys(upload.extracted_results ?? {}).length > 0
      ? upload.extracted_results
      : getAssessmentResultTemplate(upload.assessment_code);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="uploadId" value={upload.id} />
      <label className="block text-xs font-semibold uppercase text-ink/50">
        Resultados estructurados
        <textarea
          name="extractedResults"
          defaultValue={JSON.stringify(defaultResults, null, 2)}
          rows={5}
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-xs text-ink"
          placeholder='{"puntaje_total": 0, "rango": "sin capturar"}'
          required
        />
      </label>

      <label className="block text-xs font-semibold uppercase text-ink/50">
        Notas del profesional
        <textarea
          name="professionalNotes"
          defaultValue={upload.professional_notes ?? ""}
          rows={3}
          disabled={disabled}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-ink"
        />
      </label>

      <SubmitButton disabled={disabled}>Guardar resultados</SubmitButton>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-moss" : "text-clay"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
