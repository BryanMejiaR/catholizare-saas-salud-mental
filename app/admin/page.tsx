import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";

export default async function AdminPage() {
  const profile = await requireRole(["administrador"]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">Panel de administracion</h1>
      <p className="mt-3 text-ink/70">Sesion activa para {profile.full_name}.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link className="inline-flex font-medium text-moss" href="/admin/users">
          Gestionar usuarios
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/admin/reports">
          Ver reportes operativos
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/admin/pro">
          Centro de anuncios a profesionales
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/admin/help">
          Gestionar ayuda
        </Link>
      </div>
    </main>
  );
}
