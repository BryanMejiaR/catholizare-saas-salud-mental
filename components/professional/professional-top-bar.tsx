"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const segmentLabels: Record<string, string> = {
  professional: "Profesional",
  patients: "Pacientes",
  expedientes: "Expedientes",
  notas: "Notas clinicas",
  template: "Plantillas",
  procesos: "Procesos terapeuticos",
  agenda: "Agenda",
  integrations: "Integraciones",
  resources: "Recursos",
  help: "Centro de ayuda",
  export: "Exportacion"
};

function labelForSegment(segment: string) {
  return segmentLabels[segment] ?? segment;
}

export function ProfessionalTopBar({ fullName }: { fullName: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentLabel = segments.map(labelForSegment).join(" / ") || "Profesional";

  return (
    <header className="sticky top-0 z-40 bg-principal text-blanco">
      <div className="relative mx-auto flex min-h-[60px] max-w-7xl items-center justify-center px-4 sm:px-6">
        <Link
          href="/professional"
          className="max-w-[58vw] truncate text-center text-[22px] font-medium tracking-[0.42em] sm:text-[24px] md:text-[28px]"
        >
          Catholizare OS
        </Link>

        <Link
          href="/professional"
          className="absolute bottom-[-6px] left-2 max-w-[52vw] truncate rounded-full bg-azulMedio px-3 py-2 text-[10px] font-medium tracking-[0.2em] text-principal sm:left-4 sm:text-xs"
          title={currentLabel}
        >
          Catholizare OS / {currentLabel}
        </Link>

        <form action="/api/auth/logout" method="post" className="absolute right-2 top-[36px] sm:right-4">
          <button
            type="submit"
            className="rounded-full bg-azulMedio px-4 py-2 text-xs font-medium tracking-[0.08em] text-principal transition hover:bg-enfasis"
            title={`Cerrar sesion de ${fullName}`}
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </header>
  );
}
