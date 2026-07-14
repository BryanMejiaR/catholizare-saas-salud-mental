import Link from "next/link";

import { SystemHealthPanel } from "@/components/admin/system-health-panel";
import { requireRole } from "@/lib/auth/profile";
import { getSystemHealthChecks } from "@/lib/admin/system-health";

export default async function SuperAdminSystemHealthPage() {
  await requireRole(["super_administrador"]);
  const healthChecks = await getSystemHealthChecks();

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Super admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">System Health</h1>
            <p className="mt-2 text-sm text-ink/65">
              Pruebas automaticas para verificar configuracion, integraciones y tablas base.
            </p>
          </div>
          <Link href="/super-admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <SystemHealthPanel checks={healthChecks} />
      </div>
    </main>
  );
}
