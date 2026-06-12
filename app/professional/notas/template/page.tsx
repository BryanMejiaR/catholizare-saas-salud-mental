import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getLatestNotaTemplate } from "@/lib/notas/queries";
import { DEFAULT_NOTA_TEMPLATE_SECTIONS } from "@/lib/notas/types";
import { NotaTemplateForm } from "@/components/notas/nota-template-form";

export default async function ProfessionalNotaTemplatePage() {
  const profile = await requireRole(["profesional"]);
  const [generalTemplate, tccTemplate] = await Promise.all([
    getLatestNotaTemplate(profile, "general"),
    getLatestNotaTemplate(profile, "tcc")
  ]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Notas clinicas
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Plantillas de notas</h1>
            <p className="mt-2 text-sm text-ink/65">
              Los cambios aplican solo a notas nuevas. Las notas existentes conservan su snapshot.
            </p>
          </div>
          <Link href="/professional/notas" className="text-sm font-medium text-moss">
            Volver a notas
          </Link>
        </div>

        <NotaTemplateForm
          modelType="general"
          sections={generalTemplate?.sections ?? DEFAULT_NOTA_TEMPLATE_SECTIONS}
          version={generalTemplate?.version}
        />

        <NotaTemplateForm
          modelType="tcc"
          sections={tccTemplate?.sections ?? DEFAULT_NOTA_TEMPLATE_SECTIONS}
          version={tccTemplate?.version}
        />
      </div>
    </main>
  );
}
