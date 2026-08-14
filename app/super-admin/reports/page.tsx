import { OperationalReport } from "@/components/admin/operational-report";
import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { requireRole } from "@/lib/auth/profile";
import { getAdminOperationalReport } from "@/lib/admin/queries";

export default async function SuperAdminReportsPage() {
  const profile = await requireRole(["super_administrador"]);
  const report = await getAdminOperationalReport(profile);

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="03"
          title="Estadisticas globales"
          description="Vision agregada de la plataforma sin exponer contenido clinico individual."
        />
        <OperationalReport report={report} showAdvancedMetadata />
      </div>
    </main>
  );
}
