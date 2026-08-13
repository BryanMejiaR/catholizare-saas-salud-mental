import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProContent } from "@/components/pro/admin-pro-content";
import {
  CreateProBannerForm,
  CreateProEventForm,
  CreateProResourceForm
} from "@/components/pro/admin-pro-forms";
import { requireRole } from "@/lib/auth/profile";
import { getAdminPatientAnnouncementsContent } from "@/lib/pro/queries";

export default async function AdminPatientAnnouncementsPage() {
  const profile = await requireRole(["administrador"]);
  const content = await getAdminPatientAnnouncementsContent(profile);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          eyebrow="Comunicacion con pacientes"
          title="Anuncios para pacientes"
          description="Gestiona el contenido visible en el portal del paciente, separado de la comunicacion para profesionales."
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
