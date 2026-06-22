"use client";

import { useActionState } from "react";

import { requestPatientAssessmentUploadAction } from "@/app/evaluaciones/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import {
  PATIENT_ASSESSMENT_UPLOAD_LABEL,
  PATIENT_ASSESSMENT_UPLOAD_TYPES
} from "@/lib/evaluaciones/types";

type AssessmentRequestFormProps = {
  expedienteId: string;
  disabled?: boolean;
};

export function AssessmentRequestForm({
  expedienteId,
  disabled = false
}: AssessmentRequestFormProps) {
  const [state, formAction] = useActionState(requestPatientAssessmentUploadAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-ink/10 p-4">
      <input type="hidden" name="expedienteId" value={expedienteId} />
      <ActionMessage message={state.message} ok={state.ok} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Prueba a solicitar
          <select
            name="assessmentCode"
            disabled={disabled}
            className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
            required
          >
            {PATIENT_ASSESSMENT_UPLOAD_TYPES.map((type) => (
              <option key={type} value={type}>
                {PATIENT_ASSESSMENT_UPLOAD_LABEL[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-ink">
          Nombre si elegiste otra
          <input
            name="otherAssessmentLabel"
            maxLength={120}
            disabled={disabled}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <SubmitButton disabled={disabled}>Activar para paciente</SubmitButton>
    </form>
  );
}
