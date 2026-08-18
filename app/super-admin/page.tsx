import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";

const controlAreas = [
  {
    href: "/super-admin/users",
    index: "02",
    title: "Usuarios y accesos",
    description: "Administra cuentas de nivel global y revisa perfiles profesionales.",
    color: "bg-enfasis"
  },
  {
    href: "/super-admin/system-health",
    index: "06",
    title: "Salud del sistema",
    description: "Verifica configuracion, servicios e integraciones esenciales.",
    color: "bg-secundario"
  },
  {
    href: "/super-admin/audit",
    index: "04",
    title: "Auditoria",
    description: "Consulta los eventos recientes de la plataforma en modo lectura.",
    color: "bg-enfasis"
  },
  {
    href: "/super-admin/exports",
    index: "05",
    title: "Custodia y exportaciones",
    description: "Revisa solicitudes de descarga total y su flujo de aprobacion.",
    color: "bg-rojoRompe"
  }
];

const secondaryAreas = [
  { href: "/super-admin/reports", index: "03", label: "Estadisticas globales" },
  { href: "/super-admin/pro", index: "07", label: "Anuncios a profesionales" },
  { href: "/super-admin/patient-announcements", index: "08", label: "Anuncios a pacientes" },
  { href: "/super-admin/help", index: "09", label: "Centro de ayuda" }
];

export default async function SuperAdminPage() {
  const profile = await requireRole(["super_administrador"]);
  const firstName = profile.full_name.trim().split(" ")[0] || profile.full_name;

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-lg bg-principal text-blanco">
          <div className="grid gap-6 px-5 py-6 sm:px-7 md:grid-cols-[minmax(0,1fr)_300px] md:items-center md:py-8">
          <div>
            <p className="text-sm font-semibold text-enfasis">
              Control global
            </p>
            <h1 className="mt-2 max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
              Supervision clara para decisiones responsables.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blanco/75">
              Observa la operacion global sin mezclarla con el contenido clinico privado.
            </p>
          </div>
          <div className="border-l-4 border-enfasis bg-blanco px-4 py-4 text-principal">
            <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Sesion activa</p>
            <p className="mt-2 text-base font-bold">{firstName}</p>
            <p className="mt-1 text-sm leading-5 text-principal/65">
              Acceso de maxima responsabilidad para la operacion de Catholizare OS.
            </p>
          </div>
          </div>
        </header>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">
                Prioridad
              </p>
              <h2 className="mt-1 text-xl font-bold text-principal">Controles esenciales</h2>
            </div>
            <p className="text-sm text-grisTextos">Acciones sensibles y observabilidad</p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {controlAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group flex min-h-[190px] flex-col border border-principal/10 bg-blanco p-5 transition hover:border-azulMedio"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-grisMedio">{area.index}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${area.color}`} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-principal">{area.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-5 text-principal/65">{area.description}</p>
                <span className="mt-4 text-sm font-bold text-azulMedio transition group-hover:text-secundario">
                  Abrir
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">
              Gestion
            </p>
            <h2 className="mt-1 text-xl font-bold text-principal">Otras areas</h2>
            <div className="mt-5 border-t border-principal/20">
              {secondaryAreas.map((area) => (
                <Link
                  key={area.href}
                  href={area.href}
                  className="group grid min-h-16 grid-cols-[48px_minmax(0,1fr)_auto] items-center border-b border-principal/10 transition duration-200 hover:bg-white hover:px-3 motion-reduce:transition-none"
                >
                  <span className="text-xs font-black text-azulMedio">{area.index}</span>
                  <span className="text-sm font-bold text-principal">{area.label}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-grisMedio transition group-hover:text-principal">
                    Abrir
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-lg bg-principal p-6 text-blanco sm:p-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-enfasis" />
              <p className="text-xs font-bold uppercase tracking-wider text-enfasis">
                Principio activo
              </p>
            </div>
            <h2 className="mt-6 text-xl font-bold">Privacidad por diseno</h2>
            <p className="mt-3 text-sm leading-6 text-blanco/75">
              Esta consola utiliza informacion operativa agregada. El contenido clinico permanece
              separado de la capa global de Catholizare.
            </p>
            <div className="mt-8 border-t border-blanco/15 pt-5 text-xs leading-5 text-blanco/60">
              Las acciones de alto impacto deben conservar trazabilidad y respetar el principio de
              minimo privilegio.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
