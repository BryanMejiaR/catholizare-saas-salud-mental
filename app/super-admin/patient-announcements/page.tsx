import { AdminProContent } from "@/components/pro/admin-pro-content";
import {
  CreateProBannerForm,
  CreateProEventForm,
  CreateProResourceForm
} from "@/components/pro/admin-pro-forms";
import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { requireRole } from "@/lib/auth/profile";
import { getAdminPatientAnnouncementsContent } from "@/lib/pro/queries";

export default async function SuperAdminPatientAnnouncementsPage() {
  const profile = await requireRole(["super_administrador"]);
  const content = await getAdminPatientAnnouncementsContent(profile);

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="08"
          title="Anuncios a pacientes"
          description="Gestiona el contenido del portal del paciente de forma independiente."
        />
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
