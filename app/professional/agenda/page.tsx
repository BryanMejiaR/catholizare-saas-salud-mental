import Link from "next/link";

import { CreateAppointmentForm } from "@/components/agenda/create-appointment-form";
import { AppointmentsTable } from "@/components/agenda/appointments-table";
import { AppointmentStatsPanel } from "@/components/agenda/appointment-stats";
import { GoogleCalendarPanel } from "@/components/agenda/google-calendar-panel";
import { PatientAppointmentFilter } from "@/components/agenda/patient-appointment-filter";
import { WeeklyAgenda } from "@/components/agenda/weekly-agenda";
import { requireRole } from "@/lib/auth/profile";
import {
  getAgendaPatientOptions,
  getAppointmentStatsForProfessional,
  getAppointmentsForProfessional
} from "@/lib/agenda/queries";
import { getGoogleCalendarConnection } from "@/lib/google-calendar/connections";

type ProfessionalAgendaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProfessionalAgendaPage({ searchParams }: ProfessionalAgendaPageProps) {
  const profile = await requireRole(["profesional"]);
  const params = await searchParams;
  const selectedPatientId = firstParam(params.patientId);
  const view = firstParam(params.view) === "create" ? "create" : "calendar";
  const [appointments, patients, stats, googleConnection] = await Promise.all([
    getAppointmentsForProfessional(profile, selectedPatientId),
    getAgendaPatientOptions(profile),
    getAppointmentStatsForProfessional(profile, selectedPatientId),
    getGoogleCalendarConnection(profile.id)
  ]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Panel del profesional
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Agenda de citas</h1>
            <p className="mt-2 text-sm text-ink/65">
              Gestiona citas programadas, presenciales o por videollamada, para pacientes con
              expediente activo.
            </p>
          </div>
          <Link href="/professional" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/professional/agenda?view=calendar"
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              view === "calendar" ? "bg-moss text-white" : "border border-moss text-moss"
            }`}
          >
            Agenda
          </Link>
          <Link
            href="/professional/agenda?view=create#agregar-cita"
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              view === "create" ? "bg-moss text-white" : "border border-moss text-moss"
            }`}
          >
            Agregar citas
          </Link>
        </div>

        {view === "create" ? (
          <div id="agregar-cita">
            <CreateAppointmentForm patients={patients} />
          </div>
        ) : (
          <WeeklyAgenda appointments={appointments} />
        )}
        <GoogleCalendarPanel connection={googleConnection} />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <PatientAppointmentFilter
              patients={patients}
              selectedPatientId={selectedPatientId}
            />
            <AppointmentsTable appointments={appointments} />
          </div>
          <AppointmentStatsPanel stats={stats} />
        </section>
      </div>
    </main>
  );
}
