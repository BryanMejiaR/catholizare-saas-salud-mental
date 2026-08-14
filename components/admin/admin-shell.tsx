"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

type AdminShellProps = {
  fullName: string;
  children: ReactNode;
};

const navigationGroups = [
  {
    label: "Operacion",
    links: [
      { href: "/admin", label: "Inicio", hint: "Vista general" },
      { href: "/admin/users", label: "Usuarios", hint: "Cuentas y accesos" },
      { href: "/admin/reports", label: "Reportes", hint: "Actividad operativa" }
    ]
  },
  {
    label: "Comunicacion",
    links: [
      { href: "/admin/pro", label: "Anuncios profesionales", hint: "Recursos y eventos" },
      {
        href: "/admin/patient-announcements",
        label: "Anuncios pacientes",
        hint: "Contenido del portal"
      },
      { href: "/admin/help", label: "Centro de ayuda", hint: "Articulos y tickets" }
    ]
  }
];

function initialsForName(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AdminNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegacion administrativa" className="space-y-7">
      {navigationGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-azulMedio">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.links.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === link.href
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "block border-l-4 px-3 py-2.5 transition",
                    isActive
                      ? "border-azulMedio bg-blanco text-principal shadow-sm"
                      : "border-transparent text-principal/65 hover:bg-blanco hover:text-principal"
                  ].join(" ")}
                >
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className={isActive ? "mt-0.5 block text-xs text-azulMedio" : "mt-0.5 block text-xs text-grisTextos"}>
                    {link.hint}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SessionBlock({ fullName }: { fullName: string }) {
  return (
    <div className="border-t border-principal/10 pt-4">
      <div className="flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-enfasis text-xs font-bold text-principal">
          {initialsForName(fullName)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-principal">{fullName}</span>
          <span className="block text-xs text-grisTextos">Administrador</span>
        </span>
      </div>
      <form action="/api/auth/logout" method="post" className="mt-3">
        <button
          type="submit"
          className="min-h-10 w-full border border-principal/15 bg-blanco px-3 text-sm font-semibold text-principal transition hover:border-rojoRompe hover:text-rojoRompe"
        >
          Cerrar sesion
        </button>
      </form>
    </div>
  );
}

export function AdminShell({ fullName, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-principal/10 bg-grisMuyClaro px-4 py-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-enfasis text-sm font-black text-principal">
            CO
          </span>
          <span>
            <span className="block text-base font-bold text-principal">Catholizare OS</span>
            <span className="block text-xs font-medium text-grisTextos">Consola administrativa</span>
          </span>
        </Link>

        <div className="mt-9 flex-1 overflow-y-auto">
          <AdminNavigation pathname={pathname} />
        </div>
        <SessionBlock fullName={fullName} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4">
            <Link href="/admin" className="text-sm font-bold text-slate-950">
              Catholizare OS
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800"
            >
              {mobileMenuOpen ? "Cerrar menu" : "Menu"}
            </button>
          </div>
          {mobileMenuOpen ? (
            <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-principal/10 bg-grisMuyClaro px-4 py-5 shadow-xl">
              <AdminNavigation pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
              <div className="mt-7">
                <SessionBlock fullName={fullName} />
              </div>
            </div>
          ) : null}
        </header>

        {children}
      </div>
    </div>
  );
}
