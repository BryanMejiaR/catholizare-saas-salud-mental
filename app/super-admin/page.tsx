import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";

export default async function SuperAdminPage() {
  const profile = await requireRole(["super_administrador"]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">Panel Catholizare</h1>
      <p className="mt-3 text-ink/70">Sesion activa para {profile.full_name}.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link className="inline-flex font-medium text-moss" href="/super-admin/users">
          Gestionar administradores
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/super-admin/reports">
          Ver estadisticas globales
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/super-admin/audit">
          Consultar auditoria
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/super-admin/pro">
          Gestionar Catholizare Pro
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/super-admin/help">
          Gestionar ayuda
        </Link>
      </div>
    </main>
  );
}
