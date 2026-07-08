"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppBreadcrumbsProps = {
  homeHref: string;
};

const segmentLabels: Record<string, string> = {
  professional: "Panel profesional",
  "super-admin": "Super admin",
  admin: "Admin",
  portal: "Portal",
  expedientes: "Expedientes",
  patients: "Pacientes",
  notas: "Notas clinicas",
  template: "Plantillas",
  procesos: "Procesos terapeuticos",
  agenda: "Agenda",
  integrations: "Integraciones",
  resources: "Recursos",
  help: "Ayuda",
  export: "Exportacion",
  users: "Usuarios",
  reports: "Reportes",
  audit: "Auditoria",
  pro: "Catholizare Pro"
};

function labelForSegment(segment: string) {
  return segmentLabels[segment] ?? segment;
}

export function AppBreadcrumbs({ homeHref }: AppBreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => ({
    label: labelForSegment(segment),
    href: `/${segments.slice(0, index + 1).join("/")}`
  }));

  return (
    <header className="border-b border-ink/10 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <Link href={homeHref} className="text-sm font-semibold text-ink">
          Catholizare OS
        </Link>
        <nav aria-label="Ruta" className="flex flex-wrap items-center gap-2 text-xs text-ink/55">
          {crumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex items-center gap-2">
              <span>/</span>
              {index === crumbs.length - 1 ? (
                <span className="font-medium text-ink">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-moss">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
