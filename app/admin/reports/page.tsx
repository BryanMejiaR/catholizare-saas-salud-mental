import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OperationalReport } from "@/components/admin/operational-report";
import { requireRole } from "@/lib/auth/profile";
import { getAdminOperationalReport } from "@/lib/admin/queries";

export default async function AdminReportsPage() {
  const profile = await requireRole(["administrador"]);
  const report = await getAdminOperationalReport(profile);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          eyebrow="Analisis operativo"
          title="Reportes"
          description="Consulta indicadores agregados de operacion sin exponer contenido clinico individual."
        />
        <OperationalReport report={report} />
      </div>
    </main>
  );
}
