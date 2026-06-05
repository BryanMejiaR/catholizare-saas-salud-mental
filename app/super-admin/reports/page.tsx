import Link from "next/link";

import { OperationalReport } from "@/components/admin/operational-report";
import { requireRole } from "@/lib/auth/profile";
import { getAdminOperationalReport } from "@/lib/admin/queries";

export default async function SuperAdminReportsPage() {
  const profile = await requireRole(["super_administrador"]);
  const report = await getAdminOperationalReport(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Catholizare
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Estadisticas globales</h1>
            <p className="mt-2 text-sm text-ink/65">
              Vision agregada de plataforma sin contenido clinico individual.
            </p>
          </div>
          <Link href="/super-admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <OperationalReport report={report} />
      </div>
    </main>
  );
}
