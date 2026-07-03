import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getExpedientesForProfessional } from "@/lib/expedientes/queries";
import { getPatientsForProfessional } from "@/lib/users/queries";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UsersTable } from "@/components/users/users-table";

export default async function ProfessionalPatientsPage() {
  const profile = await requireRole(["profesional"]);
  const [patients, expedientes] = await Promise.all([
    getPatientsForProfessional(profile.id),
    getExpedientesForProfessional(profile)
  ]);
  const expedienteLinksByUserId = Object.fromEntries(
    expedientes
      .filter((expediente) => expediente.status === "activo")
      .map((expediente) => [
        expediente.patient_id,
        `/professional/expedientes/${expediente.id}`
      ])
  );

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Panel del profesional
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Pacientes</h1>
          </div>
          <Link href="/professional" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <Link
          href="/professional/expedientes"
          className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink"
        >
          Abrir expedientes clinicos
        </Link>

        <CreateUserForm allowedRoles={["paciente"]} fixedRole="paciente" />
        <UsersTable users={patients} expedienteLinksByUserId={expedienteLinksByUserId} />
      </div>
    </main>
  );
}
