import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";

export default async function AdminPage() {
  const profile = await requireRole(["administrador"]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">Panel de administración</h1>
      <p className="mt-3 text-ink/70">Sesión activa para {profile.full_name}.</p>
      <Link className="mt-6 inline-flex font-medium text-moss" href="/admin/users">
        Gestionar usuarios
      </Link>
    </main>
  );
}
