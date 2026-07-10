import Link from "next/link";

import { AdminProContent } from "@/components/pro/admin-pro-content";
import {
  CreateProBannerForm,
  CreateProEventForm,
  CreateProResourceForm
} from "@/components/pro/admin-pro-forms";
import { requireRole } from "@/lib/auth/profile";
import { getAdminProContent } from "@/lib/pro/queries";

export default async function SuperAdminProPage() {
  const profile = await requireRole(["super_administrador"]);
  const content = await getAdminProContent(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Catholizare
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              Centro de anuncios a profesionales
            </h1>
          </div>
          <Link href="/super-admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

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
