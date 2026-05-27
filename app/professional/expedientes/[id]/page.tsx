import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getExpedienteDetail } from "@/lib/expedientes/queries";
import { ArchiveExpedienteForm } from "@/components/expedientes/archive-expediente-form";
import { ConsentimientoForm } from "@/components/expedientes/consentimiento-form";
import { HistoriaClinicaForm } from "@/components/expedientes/historia-clinica-form";
import { IdentificationForm } from "@/components/expedientes/identification-form";

type ExpedienteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpedienteDetailPage({ params }: ExpedienteDetailPageProps) {
  const [{ id }, profile] = await Promise.all([params, requireRole(["profesional"])]);
  const expediente = await getExpedienteDetail(profile, id);
  const isArchived = expediente.status === "archivado";
  const isActive = expediente.status === "activo";

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
        <HistoriaClinicaForm expediente={expediente} disabled={!isActive} />
        <ArchiveExpedienteForm expedienteId={expediente.id} disabled={isArchived} />
      </div>
    </main>
  );
}
