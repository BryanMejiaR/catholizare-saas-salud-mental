import Link from "next/link";

import { ProfessionalMembershipPanel } from "@/components/professional/professional-membership-panel";
import { ProBannerList } from "@/components/pro/pro-banner-list";
import { ProEventsList } from "@/components/pro/pro-events-list";
import { requireRole } from "@/lib/auth/profile";
import { getProfessionalProDashboard } from "@/lib/pro/queries";

export default async function ProfessionalPage() {
  const profile = await requireRole(["profesional"]);
  const pro = await getProfessionalProDashboard(profile, "dashboard");
  const menuLinks = [
    { label: "Pacientes", href: "/professional/patients" },
    { label: "Expedientes", href: "/professional/expedientes" },
    { label: "Notas clinicas", href: "/professional/notas" },
    { label: "Plantilla de notas clinicas", href: "/professional/notas/template" },
    { label: "Procesos terapeuticos", href: "/professional/procesos" },
    { label: "Mi Agenda", href: "/professional/agenda" },
    { label: "Integraciones", href: "/professional/integrations" },
    { label: "Recursos", href: "/professional/resources" },
    { label: "Centro de ayuda", href: "/professional/help" },
    { label: "Solicitar exportacion", href: "/professional/export" }
  ];

  return (
    <main className="min-h-[calc(100vh-60px)] bg-blanco px-3 pb-12 pt-8 sm:px-6 md:pt-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="rounded-none bg-grisMuyClaro px-4 py-5 sm:px-6">
          <h1 className="text-[22px] font-bold leading-tight text-texto sm:text-[26px]">
            Panel del profesional
          </h1>
          <p className="mt-3 text-xs font-medium text-grisTextos">
            Sesion activa para {profile.full_name}.
          </p>

          <nav className="mt-6 grid grid-cols-2 justify-items-center gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
            {menuLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-[54px] w-full max-w-[218px] items-center justify-center rounded-full bg-enfasis px-5 py-2 text-center text-[15px] font-medium leading-tight tracking-[0.32em] text-texto transition hover:bg-azulMedio hover:text-blanco sm:text-[18px] lg:text-[22px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <ProBannerList banners={pro.banners} />
        <ProEventsList events={pro.events} />
        <ProfessionalMembershipPanel />
      </div>
    </main>
  );
}
