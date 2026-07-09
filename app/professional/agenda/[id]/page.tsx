import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getAppointmentDetail } from "@/lib/agenda/queries";

type AppointmentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default async function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const [{ id }, profile] = await Promise.all([params, requireRole(["profesional"])]);
  const detail = await getAppointmentDetail(profile, id);

  if (!detail) {
    return (
      <main className="min-h-screen bg-linen px-6 py-8">
        <div className="mx-auto max-w-4xl rounded-lg border border-ink/10 bg-white p-5">
          <h1 className="text-xl font-semibold text-ink">Cita no disponible</h1>
          <Link href="/professional/agenda" className="mt-4 inline-flex text-sm font-medium text-moss">
            Volver a agenda
          </Link>
        </div>
      </main>
    );
  }

  const { appointment, notes } = detail;

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Agenda
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Detalle de cita</h1>
            <p className="mt-2 text-sm text-ink/65">
              {appointment.patient.full_name} - {formatDate(appointment.scheduled_at)}
            </p>
          </div>
          <Link href="/professional/agenda" className="text-sm font-medium text-moss">
            Volver a agenda
          </Link>
        </div>

        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Informacion de la cita</h2>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-ink/55">Estado</dt>
              <dd className="font-medium text-ink">{appointment.status}</dd>
            </div>
            <div>
              <dt className="text-ink/55">Tipo</dt>
              <dd className="font-medium text-ink">{appointment.type}</dd>
            </div>
            <div>
              <dt className="text-ink/55">Duracion</dt>
              <dd className="font-medium text-ink">{appointment.duration_minutes} min</dd>
            </div>
            <div>
              <dt className="text-ink/55">Notas relacionadas</dt>
              <dd className="font-medium text-ink">{notes.length}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Notas clinicas del dia</h2>
          <div className="mt-4 divide-y divide-ink/10">
            {notes.map((note) => (
              <article key={note.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{note.note_type}</h3>
                    <p className="mt-1 text-sm text-ink/60">
                      {note.status} - {new Date(note.session_date).toLocaleDateString("es-MX")}
                    </p>
                    <p className="mt-2 text-sm text-ink/70">
                      {note.clinical_summary ?? "Sin resumen clinico."}
                    </p>
                  </div>
                  <Link href={`/professional/notas/${note.id}`} className="text-sm font-medium text-moss">
                    Abrir nota
                  </Link>
                </div>
              </article>
            ))}

            {notes.length === 0 ? (
              <p className="text-sm text-ink/65">
                No hay notas clinicas asociadas a esta cita o a este dia.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
