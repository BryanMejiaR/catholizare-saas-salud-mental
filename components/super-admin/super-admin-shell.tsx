"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import styles from "./super-admin-shell.module.css";

type SuperAdminShellProps = {
  fullName: string;
  children: ReactNode;
};

const navigation = [
  { index: "01", href: "/super-admin", label: "Inicio" },
  { index: "02", href: "/super-admin/users", label: "Usuarios" },
  { index: "03", href: "/super-admin/reports", label: "Estadisticas" },
  { index: "04", href: "/super-admin/audit", label: "Auditoria" },
  { index: "05", href: "/super-admin/exports", label: "Exportaciones" },
  { index: "06", href: "/super-admin/system-health", label: "System Health" },
  { index: "07", href: "/super-admin/pro", label: "Profesionales" },
  { index: "08", href: "/super-admin/patient-announcements", label: "Pacientes" },
  { index: "09", href: "/super-admin/help", label: "Ayuda" }
];

function isActivePath(pathname: string, href: string) {
  return href === "/super-admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function SuperAdminNavigation({ pathname, closeMenu }: { pathname: string; closeMenu?: () => void }) {
  return (
    <nav aria-label="Navegacion de super administrador" className="space-y-1">
      {navigation.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            aria-current={active ? "page" : undefined}
            className={[
              "group grid min-h-11 grid-cols-[34px_minmax(0,1fr)_12px] items-center gap-2 border-b border-slate-100 px-2 text-sm transition duration-200",
              active ? "text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            ].join(" ")}
          >
            <span className={active ? "text-xs font-black text-cyan-600" : "text-xs font-bold text-slate-300"}>
              {item.index}
            </span>
            <span className="font-semibold">{item.label}</span>
            <span
              aria-hidden="true"
              className={[
                "h-2 w-2 rounded-full transition duration-300",
                active ? "scale-100 bg-cyan-500" : "scale-0 bg-slate-300 group-hover:scale-75"
              ].join(" ")}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function SuperAdminShell({ fullName, children }: SuperAdminShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950 lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
        <Link href="/super-admin" className="block border-b border-slate-200 pb-6">
          <span className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-600">
            Catholizare OS
          </span>
          <span className="mt-2 block text-xl font-black tracking-tight text-slate-950">CONTROL</span>
        </Link>

        <div className="mt-5 flex-1 overflow-y-auto">
          <SuperAdminNavigation pathname={pathname} />
        </div>

        <div className="border-t border-slate-200 pt-5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <span className={`${styles.statusPulse} h-2 w-2 rounded-full bg-emerald-500`} />
            Sesion supervisora activa
          </div>
          <p className="mt-3 truncate text-sm font-bold text-slate-900">{fullName}</p>
          <p className="mt-0.5 text-xs text-slate-500">Super administrador</p>
          <form action="/api/auth/logout" method="post" className="mt-4">
            <button
              type="submit"
              className="min-h-10 w-full border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition duration-200 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-700"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex min-h-16 items-center justify-between px-4">
            <Link href="/super-admin">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Catholizare</span>
              <span className="ml-2 text-sm font-black text-slate-950">CONTROL</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              className="min-h-10 border border-slate-300 px-4 text-sm font-bold text-slate-800"
            >
              {menuOpen ? "Cerrar" : "Menu"}
            </button>
          </div>
          {menuOpen ? (
            <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 shadow-xl">
              <SuperAdminNavigation pathname={pathname} closeMenu={() => setMenuOpen(false)} />
              <form action="/api/auth/logout" method="post" className="mt-5">
                <button
                  type="submit"
                  className="min-h-11 w-full bg-slate-950 px-4 text-sm font-bold text-white"
                >
                  Cerrar sesion
                </button>
              </form>
            </div>
          ) : null}
        </header>

        <div key={pathname} className={styles.pageReveal}>
          {children}
        </div>
      </div>
    </div>
  );
}
