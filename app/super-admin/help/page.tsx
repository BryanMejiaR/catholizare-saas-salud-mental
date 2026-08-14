import { AdminHelpContent } from "@/components/help/admin-help-content";
import {
  AdminHelpArticles,
  AdminSupportTickets,
  CreateHelpArticleForm
} from "@/components/help/admin-help-forms";
import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { requireRole } from "@/lib/auth/profile";
import { getAdminHelpDashboard } from "@/lib/help/queries";

export default async function SuperAdminHelpPage() {
  const profile = await requireRole(["super_administrador"]);
  const help = await getAdminHelpDashboard(profile);

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="09"
          title="Centro de ayuda"
          description="Supervision global de articulos y solicitudes de soporte operativo."
        />
        <CreateHelpArticleForm />
        <AdminHelpContent articles={help.articles} tickets={help.tickets} />
        <AdminHelpArticles articles={help.articles} />
        <AdminSupportTickets tickets={help.tickets} />
      </div>
    </main>
  );
}
