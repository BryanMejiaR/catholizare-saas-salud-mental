import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getNotasForProfessional } from "@/lib/notas/queries";
import {
  NOTA_CLINICA_STATUSES,
  NOTA_CLINICA_TYPES,
  type NotaClinicaFilters
} from "@/lib/notas/types";
import { getPatientsForProfessional } from "@/lib/users/queries";
import { NotasFilterForm } from "@/components/notas/notas-filter-form";
import { NotasTable } from "@/components/notas/notas-table";

type ProfessionalNotasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(searchParams: Record<string, string | string[] | undefined>) {
  const patientId = firstParam(searchParams.patientId)?.trim();
  const noteType = firstParam(searchParams.noteType)?.trim();
  const status = firstParam(searchParams.status)?.trim();
  const query = firstParam(searchParams.query)?.trim();
  const dateFrom = firstParam(searchParams.dateFrom)?.trim();
  const dateTo = firstParam(searchParams.dateTo)?.trim();
  const parsedNoteType = NOTA_CLINICA_TYPES.find((type) => type === noteType);
  const parsedStatus = NOTA_CLINICA_STATUSES.find((value) => value === status);

  return {
    patientId: patientId || undefined,
    noteType: parsedNoteType,
    status: parsedStatus,
    query: query || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  } satisfies NotaClinicaFilters;
}

export default async function ProfessionalNotasPage({
  searchParams
}: ProfessionalNotasPageProps) {
  const [profile, params] = await Promise.all([requireRole(["profesional"]), searchParams]);
  const filters = parseFilters(params);
  const [notas, pendingDrafts, patients] = await Promise.all([
    getNotasForProfessional(profile, filters),
    getNotasForProfessional(profile, { status: "borrador" }),
    getPatientsForProfessional(profile.id)
  ]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Panel del profesional
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Notas clinicas</h1>
            <p className="mt-2 text-sm text-ink/65">
              Consulta de notas propias por Paciente, tipo, estado, fecha y texto clinico.
            </p>
          </div>
          <Link href="/professional" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
          <Link href="/professional/notas/template" className="text-sm font-medium text-moss">
            Editar plantillas
          </Link>
        </div>

        <NotasFilterForm filters={filters} patients={patients} />
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Borradores pendientes</h2>
            <p className="mt-1 text-sm text-ink/65">
              Notas iniciadas que aun no forman parte formal del expediente clinico.
            </p>
          </div>
          <NotasTable
            notas={pendingDrafts}
            showPatient
            emptyMessage="No hay borradores pendientes."
          />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Resultados</h2>
          </div>
        <NotasTable
          notas={notas}
          showPatient
          emptyMessage="No hay notas clinicas con estos filtros."
        />
        </section>
      </div>
    </main>
  );
}
