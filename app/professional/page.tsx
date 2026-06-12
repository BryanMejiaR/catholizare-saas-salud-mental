import Link from "next/link";

import { ProBannerList } from "@/components/pro/pro-banner-list";
import { ProEventsList } from "@/components/pro/pro-events-list";
import { requireRole } from "@/lib/auth/profile";
import { getProfessionalProDashboard } from "@/lib/pro/queries";

export default async function ProfessionalPage() {
  const profile = await requireRole(["profesional"]);
  const pro = await getProfessionalProDashboard(profile, "dashboard");

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Panel del profesional</h1>
          <p className="mt-3 text-ink/70">Sesion activa para {profile.full_name}.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link className="inline-flex font-medium text-moss" href="/professional/patients">
              Gestionar pacientes
            </Link>
            <Link className="inline-flex font-medium text-moss" href="/professional/expedientes">
              Gestionar expedientes
            </Link>
            <Link className="inline-flex font-medium text-moss" href="/professional/notas">
              Consultar notas clinicas
            </Link>
            <Link className="inline-flex font-medium text-moss" href="/professional/notas/template">
              Editar plantillas de notas
            </Link>
            <Link className="inline-flex font-medium text-moss" href="/professional/procesos">
              Gestionar procesos
            </Link>
            <Link className="inline-flex font-medium text-moss" href="/professional/agenda">
              Gestionar agenda
            </Link>
            <Link className="inline-flex font-medium text-moss" href="/professional/integrations">
              Gestionar integraciones
            </Link>
            <Link className="inline-flex font-medium text-moss" href="/professional/resources">
              Ver recursos
            </Link>
            <Link className="inline-flex font-medium text-moss" href="/professional/help">
              Centro de ayuda
            </Link>
          </div>
        </div>

        <ProBannerList banners={pro.banners} />
        <ProEventsList events={pro.events} />
      </div>
    </main>
  );
}
