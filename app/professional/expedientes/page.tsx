import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getExpedientesForProfessional } from "@/lib/expedientes/queries";
import { getPatientsForProfessional } from "@/lib/users/queries";
import { CreateExpedienteForm } from "@/components/expedientes/create-expediente-form";
import { ExpedientesTable } from "@/components/expedientes/expedientes-table";

export default async function ProfessionalExpedientesPage() {
  const profile = await requireRole(["profesional"]);
  const [expedientes, patients] = await Promise.all([
    getExpedientesForProfessional(profile),
    getPatientsForProfessional(profile.id)
  ]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Panel del profesional
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Expedientes clinicos</h1>
          </div>
          <Link href="/professional" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <CreateExpedienteForm patients={patients} />
        <ExpedientesTable expedientes={expedientes} />
      </div>
    </main>
  );
}
