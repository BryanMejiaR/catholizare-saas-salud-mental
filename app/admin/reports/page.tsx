import Link from "next/link";

import { OperationalReport } from "@/components/admin/operational-report";
import { requireRole } from "@/lib/auth/profile";
import { getAdminOperationalReport } from "@/lib/admin/queries";

export default async function AdminReportsPage() {
  const profile = await requireRole(["administrador"]);
  const report = await getAdminOperationalReport(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Administracion
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Reportes operativos</h1>
            <p className="mt-2 text-sm text-ink/65">
              Conteos administrativos agregados sin contenido clinico individual.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <OperationalReport report={report} />
      </div>
    </main>
  );
}
