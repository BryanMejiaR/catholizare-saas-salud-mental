import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getAssessmentsForExpediente } from "@/lib/evaluaciones/queries";
import { getExpedienteDetail } from "@/lib/expedientes/queries";
import { getLatestNotaTemplate, getNotasForExpediente } from "@/lib/notas/queries";
import { getProcesoForExpediente } from "@/lib/procesos/queries";
import { AssessmentsSection } from "@/components/evaluaciones/assessments-section";
import { ArchiveExpedienteForm } from "@/components/expedientes/archive-expediente-form";
import { ConsentimientoForm } from "@/components/expedientes/consentimiento-form";
import { IdentificationForm } from "@/components/expedientes/identification-form";
import { LifeHistoryAccessPanel } from "@/components/expedientes/life-history-access-panel";
import { CreateNotaForm } from "@/components/notas/create-nota-form";
import { NotasTable } from "@/components/notas/notas-table";
import { StartProcessForm } from "@/components/procesos/start-process-form";

type ExpedienteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpedienteDetailPage({ params }: ExpedienteDetailPageProps) {
  const [{ id }, profile] = await Promise.all([params, requireRole(["profesional"])]);
  const [expediente, notas, proceso, assessments, generalNoteTemplate, tccNoteTemplate] = await Promise.all([
    getExpedienteDetail(profile, id),
    getNotasForExpediente(profile, id),
    getProcesoForExpediente(profile, id),
    getAssessmentsForExpediente(profile, id),
    getLatestNotaTemplate(profile, "general"),
    getLatestNotaTemplate(profile, "tcc")
  ]);
  const isArchived = expediente.status === "archivado";
  const isActive = expediente.status === "activo";
  const canCreateNotes =
    isActive &&
    ["firmado_fisico", "firmado_digital", "excepcion_justificada"].includes(
      expediente.consent_status
    );

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Expediente clinico
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              {expediente.patient.full_name}
            </h1>
            <p className="mt-2 text-sm text-ink/65">
              Estado: {expediente.status} | Consentimiento: {expediente.consent_status}
            </p>
          </div>
          <Link href="/professional/expedientes" className="text-sm font-medium text-moss">
            Volver a expedientes
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-ink/10 bg-white p-4">
            <p className="text-sm text-ink/60">Notas clinicas</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{expediente.session_notes_count}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white p-4">
            <p className="text-sm text-ink/60">Evaluaciones</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{expediente.assessments_count}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white p-4">
            <p className="text-sm text-ink/60">Documentos</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{expediente.documents_count}</p>
          </div>
        </section>

        {!isActive ? (
          <p className="rounded-md border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-ink">
            Este expediente no esta activo. La edicion clinica esta bloqueada para preservar la
            integridad del registro.
          </p>
        ) : null}

        <IdentificationForm expediente={expediente} disabled={!isActive} />
        <ConsentimientoForm expediente={expediente} disabled={!isActive} />
        <LifeHistoryAccessPanel
          expedienteId={expediente.id}
          lifeHistory={expediente.life_history}
          disabled={!isActive}
        />
        <AssessmentsSection
          expedienteId={expediente.id}
          assessments={assessments}
          disabled={!isActive}
        />
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Proceso terapeutico</h2>
            <p className="mt-1 text-sm text-ink/65">
              Modelo General configurable por el Profesional.
            </p>
          </div>
          {proceso ? (
            <div className="rounded-lg border border-ink/10 bg-white p-5">
              <p className="text-sm text-ink/65">Estado: {proceso.status}</p>
              <Link
                href={`/professional/procesos/${proceso.id}`}
                className="mt-3 inline-flex text-sm font-medium text-moss"
              >
                Abrir proceso
              </Link>
            </div>
          ) : (
            <StartProcessForm expedienteId={expediente.id} disabled={!isActive} />
          )}
        </section>
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Notas clinicas</h2>
            <p className="mt-1 text-sm text-ink/65">
              Las notas de sesion se guardan como borrador y pueden editarse antes de confirmarse.
            </p>
          </div>
          {!canCreateNotes && isActive ? (
            <p className="rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink">
              Para crear notas clinicas se requiere consentimiento informado firmado o excepcion
              justificada.
            </p>
          ) : null}
          <CreateNotaForm
            expedienteId={expediente.id}
            templates={{
              general: generalNoteTemplate,
              tcc: tccNoteTemplate
            }}
            disabled={!canCreateNotes}
          />
          <NotasTable notas={notas} />
        </section>
        <ArchiveExpedienteForm expedienteId={expediente.id} disabled={isArchived} />
      </div>
    </main>
  );
}
