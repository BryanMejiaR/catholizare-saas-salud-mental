"use client";

import { useActionState } from "react";

import { submitExperienceReviewAction } from "@/app/portal/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";

type ExperienceReviewFormProps = {
  appointmentId: string;
};

export function ExperienceReviewForm({ appointmentId }: ExperienceReviewFormProps) {
  const [state, formAction] = useActionState(submitExperienceReviewAction, {});

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <select
        name="score"
        required
        className="w-full rounded-md border border-ink/15 px-3 py-2 text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
      >
        <option value="">Evaluar experiencia</option>
        <option value="5">5 - Muy buena</option>
        <option value="4">4 - Buena</option>
        <option value="3">3 - Regular</option>
        <option value="2">2 - Mala</option>
        <option value="1">1 - Muy mala</option>
      </select>
      <textarea
        name="comment"
        maxLength={1200}
        placeholder="Comentario opcional. Evita incluir informacion clinica sensible."
        className="min-h-20 w-full rounded-md border border-ink/15 px-3 py-2 text-xs outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
      />
      <SubmitButton>Enviar evaluacion</SubmitButton>
      <ActionMessage message={state.message} ok={state.ok} />
    </form>
  );
}
