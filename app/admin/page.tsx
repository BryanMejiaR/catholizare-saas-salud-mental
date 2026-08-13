import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireRole } from "@/lib/auth/profile";

const secondaryActions = [
  {
    href: "/admin/reports",
    eyebrow: "Analisis",
    title: "Reportes operativos",
    description: "Revisa actividad agregada de profesionales, expedientes y agenda.",
    accent: "border-sky-500",
    labelColor: "text-sky-700"
  },
  {
    href: "/admin/pro",
    eyebrow: "Profesionales",
    title: "Centro de anuncios",
    description: "Publica recursos, banners y eventos para los profesionales.",
    accent: "border-emerald-500",
    labelColor: "text-emerald-700"
  },
  {
    href: "/admin/patient-announcements",
    eyebrow: "Pacientes",
    title: "Comunicacion del portal",
    description: "Administra el contenido informativo visible para pacientes.",
    accent: "border-amber-500",
    labelColor: "text-amber-700"
  },
  {
    href: "/admin/help",
    eyebrow: "Soporte",
    title: "Centro de ayuda",
    description: "Gestiona articulos operativos y da seguimiento a tickets.",
    accent: "border-rose-500",
    labelColor: "text-rose-700"
  }
];

export default async function AdminPage() {
  const profile = await requireRole(["administrador"]);
  const firstName = profile.full_name.trim().split(" ")[0] || profile.full_name;

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
      <div className="mx-auto max-w-7xl space-y-9">
        <AdminPageHeader
          eyebrow="Centro de control"
          title={`Hola, ${firstName}`}
          description="Gestiona las tareas operativas de Catholizare desde un solo lugar, sin acceso al contenido clinico de los expedientes."
          action={
            <Link
              href="/admin/users"
              className="inline-flex min-h-11 items-center justify-center bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-sky-700"
            >
              Crear usuario
            </Link>
          }
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <Link
            href="/admin/users"
            className="group relative overflow-hidden bg-slate-950 p-6 text-white transition hover:bg-slate-900 sm:p-8"
          >
            <div className="absolute right-0 top-0 h-full w-2 bg-cyan-400" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
              Tarea principal
            </p>
            <h2 className="mt-3 max-w-xl text-2xl font-bold sm:text-3xl">Gestionar usuarios</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Crea cuentas, reenvia invitaciones, administra estados y consulta perfiles
              profesionales desde una sola vista.
            </p>
            <span className="mt-8 inline-flex min-h-10 items-center border border-white/25 px-4 text-sm font-bold transition group-hover:border-cyan-400 group-hover:text-cyan-300">
              Abrir gestion de usuarios
            </span>
          </Link>

          <aside className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Alcance administrativo
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Operacion con privacidad</h2>
            <div className="mt-5 space-y-4">
              <OperationalPrinciple
                number="01"
                title="Datos agregados"
                description="Los reportes no muestran contenido clinico individual."
              />
              <OperationalPrinciple
                number="02"
                title="Acciones trazables"
                description="Los cambios relevantes conservan su registro de auditoria."
              />
              <OperationalPrinciple
                number="03"
                title="Audiencias separadas"
                description="Pacientes y profesionales reciben contenido independiente."
              />
            </div>
          </aside>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                Accesos frecuentes
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Que necesitas gestionar?</h2>
            </div>
            <p className="text-sm text-slate-500">Selecciona un area para continuar</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {secondaryActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group border-l-4 ${action.accent} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6`}
              >
                <span className={`text-xs font-bold uppercase tracking-[0.14em] ${action.labelColor}`}>
                  {action.eyebrow}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-950">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                <span className="mt-5 inline-block text-sm font-bold text-slate-900 group-hover:text-sky-700">
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

function OperationalPrinciple({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
      <span className="text-xs font-black text-cyan-600">{number}</span>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
