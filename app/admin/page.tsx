import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";

const secondaryActions = [
  {
    href: "/admin/reports",
    eyebrow: "Analisis",
    title: "Reportes operativos",
    description: "Revisa actividad agregada de profesionales, expedientes y agenda."
  },
  {
    href: "/admin/pro",
    eyebrow: "Profesionales",
    title: "Centro de anuncios",
    description: "Publica recursos, banners y eventos para los profesionales."
  },
  {
    href: "/admin/patient-announcements",
    eyebrow: "Pacientes",
    title: "Comunicacion del portal",
    description: "Administra el contenido informativo visible para pacientes."
  },
  {
    href: "/admin/help",
    eyebrow: "Soporte",
    title: "Centro de ayuda",
    description: "Gestiona articulos operativos y da seguimiento a tickets."
  }
];

export default async function AdminPage() {
  const profile = await requireRole(["administrador"]);
  const firstName = profile.full_name.trim().split(" ")[0] || profile.full_name;

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
      <div className="mx-auto max-w-7xl space-y-9">
        <section className="overflow-hidden rounded-lg bg-principal text-blanco">
          <div className="grid gap-6 px-5 py-6 sm:px-7 md:grid-cols-[minmax(0,1fr)_300px] md:items-center md:py-8">
            <div>
              <p className="text-sm font-semibold text-enfasis">Hola, {firstName}</p>
              <h1 className="mt-2 max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
                Operacion clara, ordenada y respetuosa de la privacidad.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blanco/75">
                Gestiona usuarios, comunicaciones y reportes sin acceder al contenido clinico.
              </p>
            </div>
            <div className="border-l-4 border-enfasis bg-blanco px-4 py-4 text-principal">
              <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Tarea frecuente</p>
              <p className="mt-2 text-base font-bold">Gestionar usuarios</p>
              <Link
                href="/admin/users"
                className="mt-4 inline-flex min-h-10 items-center rounded-md bg-azulMedio px-4 text-sm font-bold text-blanco transition hover:bg-secundario"
              >
                Abrir usuarios
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">
                Accesos frecuentes
              </p>
              <h2 className="mt-1 text-xl font-bold text-principal">Que necesitas gestionar?</h2>
            </div>
            <p className="text-sm text-grisTextos">Selecciona un area para continuar</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {secondaryActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group border border-principal/10 bg-blanco p-5 transition hover:border-azulMedio sm:p-6"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-azulMedio">
                  {action.eyebrow}
                </span>
                <h3 className="mt-2 text-lg font-bold text-principal">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-principal/65">{action.description}</p>
                <span className="mt-5 inline-block text-sm font-bold text-azulMedio group-hover:text-secundario">
                  Abrir seccion
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
