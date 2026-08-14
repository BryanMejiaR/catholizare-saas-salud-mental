import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";

const controlAreas = [
  {
    href: "/super-admin/users",
    index: "02",
    title: "Usuarios y accesos",
    description: "Administra cuentas de nivel global y revisa perfiles profesionales.",
    color: "bg-cyan-500"
  },
  {
    href: "/super-admin/system-health",
    index: "06",
    title: "Salud del sistema",
    description: "Verifica configuracion, servicios e integraciones esenciales.",
    color: "bg-emerald-500"
  },
  {
    href: "/super-admin/audit",
    index: "04",
    title: "Auditoria",
    description: "Consulta los eventos recientes de la plataforma en modo lectura.",
    color: "bg-amber-500"
  },
  {
    href: "/super-admin/exports",
    index: "05",
    title: "Custodia y exportaciones",
    description: "Revisa solicitudes de descarga total y su flujo de aprobacion.",
    color: "bg-rose-500"
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
      <div className="mx-auto max-w-[1380px] space-y-12">
        <header className="grid gap-8 border-b border-slate-200 pb-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">
              Control global
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Supervision clara.
              <span className="block text-slate-400">Decisiones responsables.</span>
            </h1>
          </div>
          <div className="border-l-2 border-cyan-500 pl-5">
            <p className="text-sm font-bold text-slate-950">Sesion de {firstName}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Acceso de maxima responsabilidad para la operacion de Catholizare OS.
            </p>
          </div>
        </header>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Prioridad
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Controles esenciales</h2>
            </div>
            <p className="text-sm text-slate-500">Acciones sensibles y observabilidad</p>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-4">
            {controlAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group relative min-h-[270px] bg-white p-6 transition duration-300 hover:z-10 hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">{area.index}</span>
                  <span className={`h-3 w-3 rounded-full ${area.color} transition duration-300 group-hover:scale-150 motion-reduce:transform-none`} />
                </div>
                <h3 className="mt-16 text-xl font-black text-slate-950">{area.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{area.description}</p>
                <span className="absolute bottom-6 left-6 text-sm font-black text-slate-950 transition duration-200 group-hover:translate-x-1 group-hover:text-cyan-700 motion-reduce:transform-none">
                  Abrir
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Gestion
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Otras areas</h2>
            <div className="mt-5 border-t border-slate-300">
              {secondaryAreas.map((area) => (
                <Link
                  key={area.href}
                  href={area.href}
                  className="group grid min-h-16 grid-cols-[48px_minmax(0,1fr)_auto] items-center border-b border-slate-200 transition duration-200 hover:bg-white hover:px-3 motion-reduce:transition-none"
                >
                  <span className="text-xs font-black text-cyan-600">{area.index}</span>
                  <span className="text-sm font-bold text-slate-900">{area.label}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 transition group-hover:text-slate-900">
                    Abrir
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="bg-slate-950 p-6 text-white sm:p-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                Principio activo
              </p>
            </div>
            <h2 className="mt-6 text-2xl font-black">Privacidad por diseno</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Esta consola utiliza informacion operativa agregada. El contenido clinico permanece
              separado de la capa global de Catholizare.
            </p>
            <div className="mt-8 border-t border-white/15 pt-5 text-xs leading-5 text-slate-400">
              Las acciones de alto impacto deben conservar trazabilidad y respetar el principio de
              minimo privilegio.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
