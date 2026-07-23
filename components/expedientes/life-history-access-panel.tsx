"use client";

import { useActionState } from "react";

import { updateLifeHistoryAccessAction } from "@/app/expedientes/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import { LIFE_HISTORY_SECTIONS } from "@/lib/life-history/schema";
import type { PatientLifeHistory } from "@/lib/expedientes/types";

type LifeHistoryAccessPanelProps = {
  expedienteId: string;
  lifeHistory: PatientLifeHistory | null;
  disabled?: boolean;
};

function valueAsText(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value ?? "";
}

export function LifeHistoryAccessPanel({
  expedienteId,
  lifeHistory,
  disabled = false
}: LifeHistoryAccessPanelProps) {
  const [state, formAction] = useActionState(updateLifeHistoryAccessAction, {});
  const canActivate = !lifeHistory || lifeHistory.status === "inactiva";
  const canReopen = lifeHistory?.status === "enviada";

  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Historia de vida del paciente</h2>
        <p className="mt-1 text-sm text-ink/65">
          Activa el cuestionario para que el paciente lo complete desde su portal. Las reaperturas
          quedan auditadas.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <div className="rounded-md border border-ink/10 bg-ink/[0.02] p-3 text-sm text-ink/70">
        Estado: <span className="font-semibold text-ink">{lifeHistory?.status ?? "inactiva"}</span>
        {lifeHistory?.submitted_at ? (
          <span> | Enviada: {new Date(lifeHistory.submitted_at).toLocaleString("es-MX")}</span>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <form action={formAction}>
          <input type="hidden" name="expedienteId" value={expedienteId} />
          <input type="hidden" name="mode" value="activate" />
          <SubmitButton disabled={disabled || !canActivate}>
            Abrir historia de vida para paciente por primera vez
          </SubmitButton>
        </form>

        <form action={formAction}>
          <input type="hidden" name="expedienteId" value={expedienteId} />
          <input type="hidden" name="mode" value="reopen" />
          <SubmitButton disabled={disabled || !canReopen}>
            Reabrir edicion para que el paciente pueda editarla
          </SubmitButton>
        </form>
      </div>

      {lifeHistory && Object.keys(lifeHistory.answers).length > 0 ? (
        <div className="space-y-5">
          {LIFE_HISTORY_SECTIONS.map((section) => (
            <section key={section.id} className="rounded-md border border-ink/10 p-4">
              <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
              <div className="mt-3 space-y-3">
                {section.fields.map((field) => {
                  const answer = valueAsText(lifeHistory.answers[field.id]);

                  if (!answer && field.type !== "checkbox_group") {
                    return null;
                  }

                  return (
                    <div key={field.id}>
                      <p className="text-xs font-semibold text-ink/55">{field.label}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                        {answer || "Sin respuesta"}
                      </p>
                      {field.type === "checkbox_group" && field.otherFieldId ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-ink/70">
                          {valueAsText(lifeHistory.answers[field.otherFieldId])}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </section>
  );
}
