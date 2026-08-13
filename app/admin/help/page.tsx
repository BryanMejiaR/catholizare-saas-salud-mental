import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminHelpContent } from "@/components/help/admin-help-content";
import {
  AdminHelpArticles,
  AdminSupportTickets,
  CreateHelpArticleForm
} from "@/components/help/admin-help-forms";
import { requireRole } from "@/lib/auth/profile";
import { getAdminHelpDashboard } from "@/lib/help/queries";

export default async function AdminHelpPage() {
  const profile = await requireRole(["administrador"]);
  const help = await getAdminHelpDashboard(profile);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          eyebrow="Soporte operativo"
          title="Centro de ayuda"
          description="Administra articulos y solicitudes de soporte sin acceso a contenido clinico."
        />

        <CreateHelpArticleForm />
        <AdminHelpContent articles={help.articles} tickets={help.tickets} />
        <AdminHelpArticles articles={help.articles} />
        <AdminSupportTickets tickets={help.tickets} />
      </div>
    </main>
  );
}
