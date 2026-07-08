"use client";

import { useActionState, useMemo, useState } from "react";

import { saveNotaTemplateAction } from "@/app/notas/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import {
  NOTA_TEMPLATE_FIELD_TYPES,
  NOTA_TEMPLATE_MODEL_LABEL,
  type NotaTemplateField,
  type NotaTemplateFieldType,
  type NotaTemplateModelType,
  type NotaTemplateSection
} from "@/lib/notas/types";

type NotaTemplateFormProps = {
  modelType: NotaTemplateModelType;
  name: string;
  sections: NotaTemplateSection[];
  version?: number;
};

const fieldTypeLabels: Record<NotaTemplateFieldType, string> = {
  text: "Texto corto",
  textarea: "Texto largo",
  select: "Seleccion",
  date: "Fecha",
  time: "Hora",
  number: "Numero",
  checkbox: "Casilla Check"
};

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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

export function NotaTemplateForm({ modelType, name, sections, version }: NotaTemplateFormProps) {
  const [state, formAction] = useActionState(saveNotaTemplateAction, {});
  const [templateName, setTemplateName] = useState(name);
  const [templateSections, setTemplateSections] = useState<NotaTemplateSection[]>(sections);
  const sectionsJson = useMemo(() => JSON.stringify(templateSections), [templateSections]);

  function updateSection(sectionIndex: number, changes: Partial<NotaTemplateSection>) {
    setTemplateSections((current) =>
      current.map((section, index) => (index === sectionIndex ? { ...section, ...changes } : section))
    );
  }

  function updateField(
    sectionIndex: number,
    fieldIndex: number,
    changes: Partial<NotaTemplateField>
  ) {
    setTemplateSections((current) =>
      current.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          fields: section.fields.map((field, currentFieldIndex) =>
            currentFieldIndex === fieldIndex ? { ...field, ...changes } : field
          )
        };
      })
    );
  }

  function addSection() {
    const id = newId("seccion");
    setTemplateSections((current) => [
      ...current,
      {
        id,
        title: "Nueva seccion",
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

  function addField(sectionIndex: number) {
    setTemplateSections((current) =>
      current.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          fields: [
            ...section.fields,
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

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="modelType" value={modelType} />
      <input type="hidden" name="name" value={templateName} />
      <input type="hidden" name="sectionsJson" value={sectionsJson} />

      <div>
        <h2 className="text-lg font-semibold text-ink">
          {templateName}
        </h2>
        <p className="mt-1 text-sm text-ink/65">
          Version vigente: {version ?? "base Catholizare"}. Guardar crea una nueva version para
          notas futuras.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Nombre de la plantilla</span>
        <input
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <div className="space-y-4">
        {templateSections.map((section, sectionIndex) => (
          <section key={section.id} className="space-y-4 rounded-lg border border-ink/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">Seccion {sectionIndex + 1}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateSections((current) => moveItem(current, sectionIndex, -1))}
                  className="rounded-md border border-ink/15 px-3 py-1 text-xs font-medium text-ink"
                >
                  Subir
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateSections((current) => moveItem(current, sectionIndex, 1))}
                  className="rounded-md border border-ink/15 px-3 py-1 text-xs font-medium text-ink"
                >
                  Bajar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTemplateSections((current) =>
                      current.filter((_, index) => index !== sectionIndex)
                    )
                  }
                  disabled={templateSections.length === 1}
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
                  value={section.title}
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      title: event.target.value
                    })
                  }
                  className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Descripcion</span>
                <input
                  value={section.description ?? ""}
                  onChange={(event) => updateSection(sectionIndex, { description: event.target.value })}
                  className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                />
              </label>
            </div>

            <div className="space-y-3">
              {section.fields.map((field, fieldIndex) => (
                <div key={field.id} className="grid gap-3 rounded-md bg-ink/5 p-3 md:grid-cols-5">
                  <label className="block md:col-span-2">
                    <span className="text-xs font-medium text-ink/70">Campo</span>
                    <input
                      value={field.label}
                      onChange={(event) =>
                        updateField(sectionIndex, fieldIndex, {
                          label: event.target.value
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
                        updateField(sectionIndex, fieldIndex, {
                          type: event.target.value as NotaTemplateFieldType
                        })
                      }
                      className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                    >
                      {NOTA_TEMPLATE_FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {fieldTypeLabels[type]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-end gap-2 text-xs font-medium text-ink/70">
                    <input
                      type="checkbox"
                      checked={field.required === true}
                      onChange={(event) =>
                        updateField(sectionIndex, fieldIndex, { required: event.target.checked })
                      }
                    />
                    Obligatorio
                  </label>

                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(sectionIndex, {
                          fields: moveItem(section.fields, fieldIndex, -1)
                        })
                      }
                      className="rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink"
                    >
                      Subir
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(sectionIndex, {
                          fields: moveItem(section.fields, fieldIndex, 1)
                        })
                      }
                      className="rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink"
                    >
                      Bajar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(sectionIndex, {
                          fields: section.fields.filter((_, index) => index !== fieldIndex)
                        })
                      }
                      disabled={section.fields.length === 1}
                      className="rounded-md border border-clay/30 px-3 py-2 text-xs font-medium text-clay disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>

                  {field.type === "select" ? (
                    <label className="block md:col-span-5">
                      <span className="text-xs font-medium text-ink/70">
                        Opciones separadas por coma
                      </span>
                      <input
                        value={(field.options ?? []).join(", ")}
                        onChange={(event) =>
                          updateField(sectionIndex, fieldIndex, {
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
              onClick={() => addField(sectionIndex)}
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
          onClick={addSection}
          className="inline-flex h-11 items-center justify-center rounded-md border border-moss/30 px-4 text-sm font-semibold text-moss"
        >
          Agregar seccion
        </button>
        <div className="min-w-56 flex-1">
          <SubmitButton>Guardar nueva version</SubmitButton>
        </div>
      </div>
    </form>
  );
}
