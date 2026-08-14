import { SystemHealthPanel } from "@/components/admin/system-health-panel";
import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { requireRole } from "@/lib/auth/profile";
import { getSystemHealthChecks } from "@/lib/admin/system-health";

export default async function SuperAdminSystemHealthPage() {
  await requireRole(["super_administrador"]);
  const healthChecks = await getSystemHealthChecks();

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="06"
          title="System Health"
          description="Pruebas automaticas de configuracion, integraciones y tablas esenciales."
        />
        <SystemHealthPanel checks={healthChecks} />
      </div>
    </main>
  );
}
