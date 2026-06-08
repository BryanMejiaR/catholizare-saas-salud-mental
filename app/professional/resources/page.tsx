import Link from "next/link";

import { ProBannerList } from "@/components/pro/pro-banner-list";
import { ProEventsList } from "@/components/pro/pro-events-list";
import { ProResourcesList } from "@/components/pro/pro-resources-list";
import { requireRole } from "@/lib/auth/profile";
import { getProfessionalProDashboard } from "@/lib/pro/queries";

export default async function ProfessionalResourcesPage() {
  const profile = await requireRole(["profesional"]);
  const pro = await getProfessionalProDashboard(profile, "resources");

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Catholizare Pro
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Recursos</h1>
            <p className="mt-2 text-sm text-ink/65">
              Materiales, formacion y actividades para acompanar tu practica profesional.
            </p>
          </div>
          <Link href="/professional" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <ProBannerList banners={pro.banners} />
        <ProEventsList events={pro.events} />
        <ProResourcesList resources={pro.resources} />
      </div>
    </main>
  );
}
