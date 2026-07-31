import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";

export default async function AdminPage() {
  const profile = await requireRole(["administrador"]);
  const quickLinks = [
    {
      href: "/admin/users",
      title: "Gestionar usuarios",
      description: "Crear usuarios, reenviar invitaciones y revisar perfiles profesionales."
    },
    {
      href: "/admin/reports",
      title: "Reportes operativos",
      description: "Ver actividad agregada de profesionales, expedientes y agenda."
    },
    {
      href: "/admin/pro",
      title: "Anuncios a profesionales",
      description: "Publicar recursos, banners y eventos para profesionales."
    },
    {
      href: "/admin/patient-announcements",
      title: "Anuncios a pacientes",
      description: "Publicar recursos, banners y eventos para pacientes."
    },
    {
      href: "/admin/help",
      title: "Centro de ayuda",
      description: "Gestionar articulos y solicitudes de soporte operativo."
    }
  ];

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Panel de administracion</h1>
          <p className="mt-3 text-ink/70">Sesion activa para {profile.full_name}.</p>
        </div>

        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Dashboard administrativo</h2>
          <p className="mt-2 text-sm text-ink/65">
            Accesos rapidos para las tareas operativas principales.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md border border-ink/10 p-4 transition hover:border-moss"
              >
                <span className="text-sm font-semibold text-ink">{link.title}</span>
                <span className="mt-1 block text-xs leading-5 text-ink/60">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
