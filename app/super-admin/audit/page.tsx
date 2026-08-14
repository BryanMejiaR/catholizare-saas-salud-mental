import { AuditLogsTable } from "@/components/admin/audit-logs-table";
import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { requireRole } from "@/lib/auth/profile";
import { getRecentAuditLogs } from "@/lib/admin/queries";

export default async function SuperAdminAuditPage() {
  const profile = await requireRole(["super_administrador"]);
  const logs = await getRecentAuditLogs(profile);

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="04"
          title="Auditoria"
          description="Ultimos 100 eventos de auditoria. Los registros son de solo lectura."
        />
        <AuditLogsTable logs={logs} />
      </div>
    </main>
  );
}
