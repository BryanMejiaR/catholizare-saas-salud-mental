import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getLatestNotaTemplate, getNotaTemplateVersions } from "@/lib/notas/queries";
import {
  DEFAULT_NOTA_TEMPLATE_SECTIONS,
  NOTA_TEMPLATE_MODEL_LABEL,
  NOTA_TEMPLATE_MODEL_TYPES,
  type NotaTemplate,
  type NotaTemplateModelType
} from "@/lib/notas/types";
import { NotaTemplateForm } from "@/components/notas/nota-template-form";

type ProfessionalNotaTemplatePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseModelType(value: string | string[] | undefined): NotaTemplateModelType {
  const candidate = firstParam(value);
  return NOTA_TEMPLATE_MODEL_TYPES.find((type) => type === candidate) ?? "general";
}

function templateName(template: NotaTemplate | null, modelType: NotaTemplateModelType) {
  return template?.name ?? `Nota clinica ${NOTA_TEMPLATE_MODEL_LABEL[modelType]}`;
}

function versionHref(modelType: NotaTemplateModelType, version: number, mode: "view" | "edit") {
  return `/professional/notas/template?modelType=${modelType}&version=${version}&mode=${mode}`;
}

function TemplatePreview({ template }: { template: NotaTemplate }) {
  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">{template.name}</h2>
        <p className="mt-1 text-sm text-ink/60">
          Version {template.version} - {NOTA_TEMPLATE_MODEL_LABEL[template.model_type]}
        </p>
      </div>

      {template.sections.map((section) => (
        <div key={section.id} className="rounded-md border border-ink/10 bg-linen p-4">
          <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
          {section.description ? (
            <p className="mt-1 text-xs text-ink/60">{section.description}</p>
          ) : null}
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            {section.fields.map((field) => (
              <li key={field.id}>
                {field.label} <span className="text-xs text-ink/45">({field.type})</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default async function ProfessionalNotaTemplatePage({
  searchParams
}: ProfessionalNotaTemplatePageProps) {
  const [profile, params] = await Promise.all([requireRole(["profesional"]), searchParams]);
  const modelType = parseModelType(params.modelType);
  const mode = firstParam(params.mode);
  const source = firstParam(params.source);
  const versionParam = Number(firstParam(params.version));
  const [latestGeneral, latestTcc, versions] = await Promise.all([
    getLatestNotaTemplate(profile, "general"),
    getLatestNotaTemplate(profile, "tcc"),
    getNotaTemplateVersions(profile, modelType)
  ]);
  const selectedTemplate =
    versions.find((template) => template.version === versionParam) ?? versions[0] ?? null;
  const editSections =
    source === "empty"
      ? [
          {
            id: "seccion_inicial",
            title: "Nueva seccion",
            fields: [{ id: "campo_inicial", label: "Nuevo campo", type: "textarea" as const }]
          }
        ]
      : selectedTemplate?.sections ?? DEFAULT_NOTA_TEMPLATE_SECTIONS;
  const editName =
    source === "empty" ? "Nueva plantilla vacia" : templateName(selectedTemplate, modelType);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Notas clinicas
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Notas clinicas</h1>
            <p className="mt-2 text-sm text-ink/65">
              Visualiza plantillas, consulta versiones y crea nuevas versiones sin modificar las
              anteriores.
            </p>
          </div>
          <Link href="/professional/notas" className="text-sm font-medium text-moss">
            Volver a notas
          </Link>
        </div>

        {mode ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {versions.map((template) => (
                <Link
                  key={template.id}
                  href={versionHref(modelType, template.version, "view")}
                  className={`rounded-md border px-3 py-2 text-sm font-medium ${
                    selectedTemplate?.version === template.version
                      ? "border-moss bg-moss/10 text-ink"
                      : "border-ink/10 bg-white text-ink/70"
                  }`}
                >
                  Version {template.version}
                </Link>
              ))}
              {versions.length === 0 ? (
                <span className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink/60">
                  Sin versiones guardadas
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/professional/notas/template?modelType=${modelType}`}
                className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
              >
                Volver al listado
              </Link>
              {selectedTemplate ? (
                <Link
                  href={versionHref(modelType, selectedTemplate.version, "edit")}
                  className="rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white"
                >
                  Crear nueva nota clinica a partir de esta plantilla
                </Link>
              ) : null}
            </div>

            {mode === "edit" ? (
              <NotaTemplateForm
                key={`${modelType}-${source ?? selectedTemplate?.id ?? "base"}-${selectedTemplate?.version ?? 0}`}
                modelType={modelType}
                name={editName}
                sections={editSections}
                version={selectedTemplate?.version}
              />
            ) : selectedTemplate ? (
              <TemplatePreview template={selectedTemplate} />
            ) : (
              <NotaTemplateForm
                key={`${modelType}-base`}
                modelType={modelType}
                name={editName}
                sections={DEFAULT_NOTA_TEMPLATE_SECTIONS}
              />
            )}
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {NOTA_TEMPLATE_MODEL_TYPES.map((type) => {
              const latest = type === "general" ? latestGeneral : latestTcc;

              return (
                <article key={type} className="rounded-lg border border-ink/10 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                    {NOTA_TEMPLATE_MODEL_LABEL[type]}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-ink">
                    {templateName(latest, type)}
                  </h2>
                  <p className="mt-1 text-sm text-ink/60">
                    Version vigente: {latest?.version ?? "base Catholizare"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/professional/notas/template?modelType=${type}&mode=view`}
                      className="rounded-md border border-moss/30 px-3 py-2 text-sm font-medium text-moss"
                    >
                      Visualizar plantilla
                    </Link>
                    <Link
                      href={`/professional/notas/template?modelType=${type}&mode=edit`}
                      className="rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white"
                    >
                      Editar plantilla
                    </Link>
                  </div>
                </article>
              );
            })}

            <article className="rounded-lg border border-dashed border-moss/40 bg-white p-5">
              <h2 className="text-lg font-semibold text-ink">Nueva nota clinica</h2>
              <p className="mt-1 text-sm text-ink/60">
                Crea una plantilla vacia y guarda una nueva version para usarla en notas futuras.
              </p>
              <Link
                href="/professional/notas/template?modelType=general&mode=edit&source=empty"
                className="mt-4 inline-flex rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white"
              >
                Crear nueva nota con plantilla vacia
              </Link>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
