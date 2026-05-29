import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getLatestGeneralTemplate } from "@/lib/procesos/queries";
import { DEFAULT_GENERAL_TEMPLATE_STEPS } from "@/lib/procesos/types";
import { TemplateForm } from "@/components/procesos/template-form";

export default async function ProfessionalProcesoTemplatePage() {
  const profile = await requireRole(["profesional"]);
  const template = await getLatestGeneralTemplate(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Modelo General
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Plantilla de proceso</h1>
            <p className="mt-2 text-sm text-ink/65">
              Los cambios aplican solo a procesos nuevos.
            </p>
          </div>
          <Link href="/professional/procesos" className="text-sm font-medium text-moss">
            Volver a procesos
          </Link>
        </div>

        <TemplateForm
          steps={template?.steps ?? DEFAULT_GENERAL_TEMPLATE_STEPS}
          version={template?.version}
        />
      </div>
    </main>
  );
}
