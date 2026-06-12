import Link from "next/link";

import { AdminHelpContent } from "@/components/help/admin-help-content";
import {
  AdminHelpArticles,
  AdminSupportTickets,
  CreateHelpArticleForm
} from "@/components/help/admin-help-forms";
import { requireRole } from "@/lib/auth/profile";
import { getAdminHelpDashboard } from "@/lib/help/queries";

export default async function SuperAdminHelpPage() {
  const profile = await requireRole(["super_administrador"]);
  const help = await getAdminHelpDashboard(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Catholizare
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Centro de ayuda</h1>
            <p className="mt-2 text-sm text-ink/65">
              Supervision global de articulos y tickets de soporte operativo.
            </p>
          </div>
          <Link href="/super-admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <CreateHelpArticleForm />
        <AdminHelpContent articles={help.articles} tickets={help.tickets} />
        <AdminHelpArticles articles={help.articles} />
        <AdminSupportTickets tickets={help.tickets} />
      </div>
    </main>
  );
}
