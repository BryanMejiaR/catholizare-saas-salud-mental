import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getPatientsForProfessional } from "@/lib/users/queries";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UsersTable } from "@/components/users/users-table";

export default async function ProfessionalPatientsPage() {
  const profile = await requireRole(["profesional"]);
  const patients = await getPatientsForProfessional(profile.id);

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

        <CreateUserForm allowedRoles={["paciente"]} fixedRole="paciente" />
        <UsersTable users={patients} />
      </div>
    </main>
  );
}
