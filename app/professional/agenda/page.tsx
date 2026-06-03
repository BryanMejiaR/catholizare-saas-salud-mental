import Link from "next/link";

import { CreateAppointmentForm } from "@/components/agenda/create-appointment-form";
import { AppointmentsTable } from "@/components/agenda/appointments-table";
import { requireRole } from "@/lib/auth/profile";
import {
  getAgendaPatientOptions,
  getAppointmentsForProfessional
} from "@/lib/agenda/queries";

export default async function ProfessionalAgendaPage() {
  const profile = await requireRole(["profesional"]);
  const [appointments, patients] = await Promise.all([
    getAppointmentsForProfessional(profile),
    getAgendaPatientOptions(profile)
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

        <CreateAppointmentForm patients={patients} />
        <AppointmentsTable appointments={appointments} />
      </div>
    </main>
  );
}
