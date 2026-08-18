import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProfessionalProfileSummaryCard } from "@/components/users/professional-profile-summary";
import { requireRole } from "@/lib/auth/profile";
import { getProfessionalProfileSummary } from "@/lib/users/professional-profile";

type AdminProfessionalProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProfessionalProfilePage({
  params
}: AdminProfessionalProfilePageProps) {
  const [{ id }, profile] = await Promise.all([params, requireRole(["administrador"])]);
  const summary = await getProfessionalProfileSummary(profile, id);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          eyebrow="Usuarios / Profesional"
          title="Perfil profesional"
          description="Resumen operativo del profesional y su actividad dentro de la plataforma."
          action={
            <Link
              href="/admin/users"
              className="inline-flex min-h-10 items-center border border-principal/20 bg-white px-4 text-sm font-bold text-principal transition hover:border-azulMedio hover:text-azulMedio"
            >
              Volver a usuarios
            </Link>
          }
        />

        {summary ? (
          <ProfessionalProfileSummaryCard summary={summary} />
        ) : (
          <section className="border border-principal/10 bg-white p-5">
            <p className="text-sm text-principal/65">No fue posible cargar este perfil profesional.</p>
          </section>
        )}
      </div>
    </main>
  );
}
