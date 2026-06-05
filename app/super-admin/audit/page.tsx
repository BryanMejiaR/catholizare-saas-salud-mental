import Link from "next/link";

import { AuditLogsTable } from "@/components/admin/audit-logs-table";
import { requireRole } from "@/lib/auth/profile";
import { getRecentAuditLogs } from "@/lib/admin/queries";

export default async function SuperAdminAuditPage() {
  const profile = await requireRole(["super_administrador"]);
  const logs = await getRecentAuditLogs(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Catholizare
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Auditoria</h1>
            <p className="mt-2 text-sm text-ink/65">
              Ultimos 100 eventos de auditoria. Los logs son de solo lectura.
            </p>
          </div>
          <Link href="/super-admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <AuditLogsTable logs={logs} />
      </div>
    </main>
  );
}
