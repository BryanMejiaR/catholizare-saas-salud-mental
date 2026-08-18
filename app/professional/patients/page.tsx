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
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-azulMedio">
              Panel del profesional
            </p>
            <h1 className="mt-1 text-2xl font-bold text-principal sm:text-3xl">Pacientes</h1>
          </div>
          <Link href="/professional" className="text-sm font-medium text-azulMedio">
            Volver al panel
          </Link>
        </div>

        <Link
          href="/professional/expedientes"
          className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-azulMedio px-4 text-sm font-semibold text-white transition hover:bg-ink"
        >
          Abrir expedientes clinicos
        </Link>

        <CreateUserForm allowedRoles={["paciente"]} fixedRole="paciente" />
        <UsersTable users={patients} expedienteLinksByUserId={expedienteLinksByUserId} />
      </div>
    </main>
  );
}
