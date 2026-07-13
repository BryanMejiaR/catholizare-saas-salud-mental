import Link from "next/link";

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
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Catholizare
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Perfil profesional</h1>
          </div>
          <Link href="/super-admin/users" className="text-sm font-medium text-moss">
            Volver a usuarios
          </Link>
        </div>

        {summary ? (
          <ProfessionalProfileSummaryCard summary={summary} />
        ) : (
          <section className="rounded-lg border border-ink/10 bg-white p-5">
            <p className="text-sm text-ink/65">No fue posible cargar este perfil profesional.</p>
          </section>
        )}
      </div>
    </main>
  );
}
