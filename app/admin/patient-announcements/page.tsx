import Link from "next/link";

import {
  CreateProBannerForm,
  CreateProEventForm,
  CreateProResourceForm
} from "@/components/pro/admin-pro-forms";
import { AdminProContent } from "@/components/pro/admin-pro-content";
import { requireRole } from "@/lib/auth/profile";
import { getAdminPatientAnnouncementsContent } from "@/lib/pro/queries";

export default async function AdminPatientAnnouncementsPage() {
  const profile = await requireRole(["administrador"]);
  const content = await getAdminPatientAnnouncementsContent(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Administracion
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              Centro de anuncios a pacientes
            </h1>
            <p className="mt-2 text-sm text-ink/65">
              Contenido visible en el portal del paciente, separado del centro de profesionales.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <CreateProResourceForm patient />
          <CreateProBannerForm patient />
          <CreateProEventForm patient />
        </div>

        <AdminProContent
          resources={content.resources}
          banners={content.banners}
          events={content.events}
          audience="patient"
        />
      </div>
    </main>
  );
}
