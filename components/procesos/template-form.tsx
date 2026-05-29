"use client";

import { useActionState, useMemo, useState } from "react";

import { saveGeneralTemplateAction } from "@/app/procesos/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import {
  PROCESS_FIELD_TYPES,
  type ProcessFieldType,
  type ProcessTemplateField,
  type ProcessTemplateStep
} from "@/lib/procesos/types";

type TemplateFormProps = {
  steps: ProcessTemplateStep[];
  version?: number;
};

const fieldTypeLabels: Record<ProcessFieldType, string> = {
  text: "Texto corto",
  textarea: "Texto largo",
  select: "Seleccion",
  date: "Fecha",
  number: "Numero"
};

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeId(value: string, fallback: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export function TemplateForm({ steps, version }: TemplateFormProps) {
  const [state, formAction] = useActionState(saveGeneralTemplateAction, {});
  const [templateSteps, setTemplateSteps] = useState<ProcessTemplateStep[]>(steps);
  const stepsJson = useMemo(() => JSON.stringify(templateSteps), [templateSteps]);

  function updateStep(stepIndex: number, changes: Partial<ProcessTemplateStep>) {
    setTemplateSteps((current) =>
      current.map((step, index) => (index === stepIndex ? { ...step, ...changes } : step))
    );
  }

  function updateField(
    stepIndex: number,
    fieldIndex: number,
    changes: Partial<ProcessTemplateField>
  ) {
    setTemplateSteps((current) =>
      current.map((step, index) => {
        if (index !== stepIndex) {
          return step;
        }

        return {
          ...step,
          fields: step.fields.map((field, currentFieldIndex) =>
            currentFieldIndex === fieldIndex ? { ...field, ...changes } : field
          )
        };
      })
    );
  }

  function addStep() {
    const id = newId("paso");
    setTemplateSteps((current) => [
      ...current,
      {
        id,
        title: "Nuevo paso",
        fields: [
          {
            id: newId("campo"),
            label: "Nuevo campo",
            type: "textarea"
          }
        ]
      }
    ]);
  }

  function addField(stepIndex: number) {
    setTemplateSteps((current) =>
      current.map((step, index) => {
        if (index !== stepIndex) {
          return step;
        }

        return {
          ...step,
          fields: [
            ...step.fields,
            {
              id: newId("campo"),
              label: "Nuevo campo",
              type: "textarea"
            }
          ]
        };
      })
    );
  }

  function removeStep(stepIndex: number) {
    setTemplateSteps((current) => current.filter((_, index) => index !== stepIndex));
  }

  function removeField(stepIndex: number, fieldIndex: number) {
    setTemplateSteps((current) =>
      current.map((step, index) => {
        if (index !== stepIndex || step.fields.length === 1) {
          return step;
        }

        return {
          ...step,
          fields: step.fields.filter((_, currentFieldIndex) => currentFieldIndex !== fieldIndex)
        };
      })
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="stepsJson" value={stepsJson} />
      <div>
        <h2 className="text-lg font-semibold text-ink">Plantilla General</h2>
        <p className="mt-1 text-sm text-ink/65">
          Version vigente: {version ?? "base Catholizare"}. Guardar crea una nueva version para
          procesos futuros.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <div className="space-y-4">
        {templateSteps.map((step, stepIndex) => (
          <section key={step.id} className="space-y-4 rounded-lg border border-ink/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">Paso {stepIndex + 1}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateSteps((current) => moveItem(current, stepIndex, -1))}
                  className="rounded-md border border-ink/15 px-3 py-1 text-xs font-medium text-ink"
                >
                  Subir
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateSteps((current) => moveItem(current, stepIndex, 1))}
                  className="rounded-md border border-ink/15 px-3 py-1 text-xs font-medium text-ink"
                >
                  Bajar
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(stepIndex)}
                  disabled={templateSteps.length === 1}
                  className="rounded-md border border-clay/30 px-3 py-1 text-xs font-medium text-clay disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-ink">Titulo</span>
                <input
                  value={step.title}
                  onChange={(event) =>
                    updateStep(stepIndex, {
                      title: event.target.value,
                      id: normalizeId(event.target.value, step.id)
                    })
                  }
                  className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Descripcion</span>
                <input
                  value={step.description ?? ""}
                  onChange={(event) => updateStep(stepIndex, { description: event.target.value })}
                  className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                />
              </label>
            </div>

            <div className="space-y-3">
              {step.fields.map((field, fieldIndex) => (
                <div key={field.id} className="grid gap-3 rounded-md bg-ink/5 p-3 md:grid-cols-4">
                  <label className="block md:col-span-2">
                    <span className="text-xs font-medium text-ink/70">Campo</span>
                    <input
                      value={field.label}
                      onChange={(event) =>
                        updateField(stepIndex, fieldIndex, {
                          label: event.target.value,
                          id: normalizeId(event.target.value, field.id)
                        })
                      }
                      className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-ink/70">Tipo</span>
                    <select
                      value={field.type}
                      onChange={(event) =>
                        updateField(stepIndex, fieldIndex, {
                          type: event.target.value as ProcessFieldType
                        })
                      }
                      className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                    >
                      {PROCESS_FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {fieldTypeLabels[type]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateStep(stepIndex, {
                          fields: moveItem(step.fields, fieldIndex, -1)
                        })
                      }
                      className="rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink"
                    >
                      Subir
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateStep(stepIndex, {
                          fields: moveItem(step.fields, fieldIndex, 1)
                        })
                      }
                      className="rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink"
                    >
                      Bajar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(stepIndex, fieldIndex)}
                      disabled={step.fields.length === 1}
                      className="rounded-md border border-clay/30 px-3 py-2 text-xs font-medium text-clay disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>

                  {field.type === "select" ? (
                    <label className="block md:col-span-4">
                      <span className="text-xs font-medium text-ink/70">
                        Opciones separadas por coma
                      </span>
                      <input
                        value={(field.options ?? []).join(", ")}
                        onChange={(event) =>
                          updateField(stepIndex, fieldIndex, {
                            options: event.target.value
                              .split(",")
                              .map((option) => option.trim())
                              .filter(Boolean)
                          })
                        }
                        className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                      />
                    </label>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addField(stepIndex)}
              className="rounded-md border border-moss/30 px-3 py-2 text-sm font-medium text-moss"
            >
              Agregar campo
            </button>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addStep}
          className="inline-flex h-11 items-center justify-center rounded-md border border-moss/30 px-4 text-sm font-semibold text-moss"
        >
          Agregar paso
        </button>
        <div className="min-w-56 flex-1">
          <SubmitButton>Guardar nueva version</SubmitButton>
        </div>
      </div>
    </form>
  );
}
