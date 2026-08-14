import { AdminProContent } from "@/components/pro/admin-pro-content";
import {
  CreateProBannerForm,
  CreateProEventForm,
  CreateProResourceForm
} from "@/components/pro/admin-pro-forms";
import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { requireRole } from "@/lib/auth/profile";
import { getAdminProContent } from "@/lib/pro/queries";

export default async function SuperAdminProPage() {
  const profile = await requireRole(["super_administrador"]);
  const content = await getAdminProContent(profile);

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="07"
          title="Anuncios a profesionales"
          description="Crea y administra recursos, banners y eventos para profesionales."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <CreateProResourceForm />
          <CreateProBannerForm />
          <CreateProEventForm />
        </div>
        <AdminProContent
          resources={content.resources}
          banners={content.banners}
          events={content.events}
        />
      </div>
    </main>
  );
}
