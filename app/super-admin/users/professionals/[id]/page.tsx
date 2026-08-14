import Link from "next/link";

import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { ProfessionalProfileSummaryCard } from "@/components/users/professional-profile-summary";
import { requireRole } from "@/lib/auth/profile";
import { getProfessionalProfileSummary } from "@/lib/users/professional-profile";

type SuperAdminProfessionalProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SuperAdminProfessionalProfilePage({
  params
}: SuperAdminProfessionalProfilePageProps) {
  const [{ id }, profile] = await Promise.all([params, requireRole(["super_administrador"])]);
  const summary = await getProfessionalProfileSummary(profile, id);

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="02.1"
          title="Perfil profesional"
          description="Resumen operativo del profesional y de su actividad dentro de la plataforma."
          action={
            <Link
              href="/super-admin/users"
              className="inline-flex min-h-10 items-center border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-cyan-600 hover:text-cyan-700"
            >
              Volver a usuarios
            </Link>
          }
        />
        {summary ? (
          <ProfessionalProfileSummaryCard summary={summary} />
        ) : (
          <section className="border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">No fue posible cargar este perfil profesional.</p>
          </section>
        )}
      </div>
    </main>
  );
}
