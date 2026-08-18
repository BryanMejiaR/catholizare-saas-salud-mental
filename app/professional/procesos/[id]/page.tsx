import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getNotasForExpediente } from "@/lib/notas/queries";
import { getProcesoDetail } from "@/lib/procesos/queries";
import { PROCESS_MODEL_LABEL } from "@/lib/procesos/types";
import { LinkNoteForm } from "@/components/procesos/link-note-form";
import { ProcessStepForm } from "@/components/procesos/process-step-form";

type ProcesoDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProcesoDetailPage({ params }: ProcesoDetailPageProps) {
  const [{ id }, profile] = await Promise.all([params, requireRole(["profesional"])]);
  const process = await getProcesoDetail(profile, id);
  const notes = await getNotasForExpediente(profile, process.expediente_id);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-azulMedio">
              Proceso terapeutico {PROCESS_MODEL_LABEL[process.model_type]}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-principal sm:text-3xl">{process.patient.full_name}</h1>
            <p className="mt-2 text-sm text-ink/65">
              Estado: {process.status} | Plantilla version {process.template_version}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/professional/expedientes/${process.expediente_id}`}
              className="text-sm font-medium text-azulMedio"
            >
              Abrir expediente
            </Link>
            <Link href="/professional/procesos" className="text-sm font-medium text-azulMedio">
              Volver a procesos
            </Link>
          </div>
        </div>

        {process.status === "cerrado" ? (
          <p className="rounded-md border border-rojoRompe/30 bg-rojoRompe/10 px-4 py-3 text-sm text-ink">
            Este proceso esta cerrado y se conserva como solo lectura.
          </p>
        ) : null}

        {process.template_snapshot.steps.map((step) => (
          <ProcessStepForm key={step.id} process={process} step={step} />
        ))}

        <LinkNoteForm process={process} notes={notes} />
      </div>
    </main>
  );
}
