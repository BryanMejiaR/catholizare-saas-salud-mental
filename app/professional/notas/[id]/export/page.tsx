import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getNotaClinicaExportData } from "@/lib/notas/queries";
import { PrintButton } from "@/components/notas/print-button";

type NotaClinicaExportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const noteTypeLabels = {
  admision: "Admision",
  evolucion: "Evolucion",
  interconsulta: "Interconsulta",
  referencia_traslado: "Referencia o traslado",
  egreso: "Egreso",
  addendum: "Addendum"
} as const;

function Field({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "") {
    return null;
  }

  return (
    <section className="break-inside-avoid border-t border-ink/15 py-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/60">{label}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{value}</p>
    </section>
  );
}

export default async function NotaClinicaExportPage({ params }: NotaClinicaExportPageProps) {
  const [{ id }, profile] = await Promise.all([params, requireRole(["profesional"])]);
  const { note, patient, professional } = await getNotaClinicaExportData(profile, id);

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-ink print:px-0 print:py-0">
      <div className="mx-auto max-w-4xl space-y-8 print:max-w-none">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href={`/professional/notas/${note.id}`} className="text-sm font-medium text-moss">
            Volver a la nota
          </Link>
          <PrintButton />
        </div>

        <article className="space-y-6 rounded-lg border border-ink/10 bg-white p-8 print:border-0 print:p-0">
          <header className="border-b border-ink/15 pb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Catholizare OS
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Nota clinica</h1>
            <p className="mt-2 text-sm text-ink/65">Folio interno: {note.id}</p>
          </header>

          <section className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="font-semibold text-ink">Paciente</p>
              <p className="mt-1 text-ink/75">{patient.full_name}</p>
              <p className="mt-1 text-ink/60">{patient.email}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Profesional</p>
              <p className="mt-1 text-ink/75">{professional.full_name}</p>
              <p className="mt-1 text-ink/60">{professional.email}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Tipo</p>
              <p className="mt-1 text-ink/75">{noteTypeLabels[note.note_type]}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Estado</p>
              <p className="mt-1 text-ink/75">{note.status}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Fecha de sesion</p>
              <p className="mt-1 text-ink/75">
                {new Date(note.session_date).toLocaleDateString("es-MX")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Fecha de confirmacion</p>
              <p className="mt-1 text-ink/75">
                {note.confirmed_at
                  ? new Date(note.confirmed_at).toLocaleString("es-MX")
                  : "No disponible"}
              </p>
            </div>
          </section>

          <Field label="Contenido clinico" value={note.content} />
          <Field label="Resumen clinico" value={note.clinical_summary} />
          <Field label="Intervenciones" value={note.interventions} />
          <Field label="Respuesta del Paciente" value={note.patient_response} />
          <Field label="Plan siguiente sesion" value={note.plan_next_session} />
          <Field label="Riesgos o alertas" value={note.risk_flags} />
          <Field label="Tareas o acuerdos" value={note.homework_or_tasks} />
          <Field label="Animo" value={note.mood_score} />
          <Field label="Ansiedad" value={note.anxiety_score} />
          <Field label="Esperanza" value={note.hope_score} />

          <footer className="border-t border-ink/15 pt-4 text-xs leading-5 text-ink/60">
            Documento generado desde Catholizare OS. La firma digital avanzada queda fuera del MVP.
            Exportacion registrada en auditoria del sistema.
          </footer>
        </article>
      </div>
    </main>
  );
}
