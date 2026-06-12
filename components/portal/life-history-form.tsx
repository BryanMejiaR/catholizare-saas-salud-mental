"use client";

import { useActionState } from "react";

import { saveLifeHistoryAction } from "@/app/portal/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import { LIFE_HISTORY_SECTIONS, type LifeHistoryField } from "@/lib/life-history/schema";
import type { PortalLifeHistory } from "@/lib/portal/types";

type LifeHistoryFormProps = {
  lifeHistory: PortalLifeHistory | null;
};

function getTextAnswer(answers: PortalLifeHistory["answers"], id: string) {
  const value = answers[id];
  return typeof value === "string" ? value : "";
}

function getArrayAnswer(answers: PortalLifeHistory["answers"], id: string) {
  const value = answers[id];
  return Array.isArray(value) ? value : [];
}

function FieldControl({
  field,
  answers,
  disabled
}: {
  field: LifeHistoryField;
  answers: PortalLifeHistory["answers"];
  disabled: boolean;
}) {
  if (field.type === "checkbox_group") {
    const selected = new Set(getArrayAnswer(answers, field.id));

    return (
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-ink">{field.label}</legend>
        <div className="grid gap-2 md:grid-cols-2">
          {field.options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-ink/75">
              <input
                name={field.id}
                type="checkbox"
                value={option}
                defaultChecked={selected.has(option)}
                disabled={disabled}
              />
              {option}
            </label>
          ))}
        </div>
        {field.otherFieldId ? (
          <label className="block">
            <span className="text-sm font-medium text-ink">{field.otherLabel}</span>
            <input
              name={field.otherFieldId}
              disabled={disabled}
              defaultValue={getTextAnswer(answers, field.otherFieldId)}
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
            />
          </label>
        ) : null}
      </fieldset>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="text-sm font-medium text-ink">{field.label}</span>
        <textarea
          name={field.id}
          rows={4}
          disabled={disabled}
          defaultValue={getTextAnswer(answers, field.id)}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>
    );
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{field.label}</span>
      <input
        name={field.id}
        type={field.type}
        disabled={disabled}
        defaultValue={getTextAnswer(answers, field.id)}
        className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
      />
    </label>
  );
}

export function LifeHistoryForm({ lifeHistory }: LifeHistoryFormProps) {
  const [state, formAction] = useActionState(saveLifeHistoryAction, {});

  if (!lifeHistory) {
    return null;
  }

  const disabled = lifeHistory.status === "enviada";

  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Historia de vida</h2>
        <p className="mt-1 text-sm text-ink/65">
          Completa este cuestionario para tu profesional. Puedes guardar borrador antes de enviarlo.
        </p>
      </div>

      {disabled ? (
        <p className="rounded-md border border-moss/20 bg-moss/10 px-3 py-2 text-sm text-ink">
          Tu historia de vida ya fue enviada. Si necesitas corregirla, solicita a tu profesional que
          reactive la edicion.
        </p>
      ) : null}

      <ActionMessage message={state.message} ok={state.ok} />

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="lifeHistoryId" value={lifeHistory.id} />

        {LIFE_HISTORY_SECTIONS.map((section) => (
          <section key={section.id} className="space-y-4 rounded-md border border-ink/10 p-4">
            <h3 className="text-base font-semibold text-ink">{section.title}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  className={field.type === "textarea" || field.type === "checkbox_group" ? "md:col-span-2" : ""}
                >
                  <FieldControl field={field} answers={lifeHistory.answers} disabled={disabled} />
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="grid gap-3 md:grid-cols-2">
          <button
            name="intent"
            value="draft"
            type="submit"
            disabled={disabled}
            className="inline-flex h-11 items-center justify-center rounded-md border border-moss px-4 text-sm font-semibold text-moss disabled:cursor-not-allowed disabled:opacity-60"
          >
            Guardar borrador
          </button>
          <SubmitButton disabled={disabled}>Enviar historia de vida</SubmitButton>
          <input type="hidden" name="intent" value="submit" />
        </div>
      </form>
    </section>
  );
}
