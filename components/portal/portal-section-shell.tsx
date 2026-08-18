"use client";

import { useState, type MouseEvent, type ReactNode } from "react";

type PortalSection = {
  id: string;
  label: string;
  description?: string;
  group?: "inicio" | "atencion" | "apoyo";
  statusText?: string;
  content: ReactNode;
};

type PortalSectionShellProps = {
  sections: PortalSection[];
};

export function PortalSectionShell({ sections }: PortalSectionShellProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const selected = sections.find((section) => section.id === activeSection) ?? sections[0];
  const sectionIds = new Set(sections.map((section) => section.id));

  function handleSectionTargetClick(event: MouseEvent<HTMLDivElement>) {
    const target = (event.target as Element | null)?.closest("[data-portal-section-target]");
    const sectionId = target?.getAttribute("data-portal-section-target");

    if (sectionId && sectionIds.has(sectionId)) {
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  }

  const groups = [
    { id: "inicio", label: "Inicio" },
    { id: "atencion", label: "Mi atencion" },
    { id: "apoyo", label: "Ayuda y recursos" }
  ] as const;

  return (
    <div
      className="grid items-start gap-6 lg:grid-cols-[264px_minmax(0,1fr)] xl:gap-8"
      onClick={handleSectionTargetClick}
    >
      <div className="border border-principal/10 bg-blanco p-3 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="portal-section-navigation"
          className="flex min-h-11 w-full items-center justify-between gap-4 px-3 text-left text-sm font-semibold text-principal"
        >
          <span>
            <span className="block text-xs font-medium text-grisTextos">Seccion actual</span>
            <span className="mt-0.5 block">{selected?.label}</span>
          </span>
          <span className="text-xs font-bold text-azulMedio">{mobileMenuOpen ? "Cerrar" : "Cambiar"}</span>
        </button>
      </div>

      <aside
        id="portal-section-navigation"
        className={[
          "border border-principal/10 bg-blanco p-3 shadow-sm lg:sticky lg:top-6 lg:block",
          mobileMenuOpen ? "block" : "hidden"
        ].join(" ")}
      >
        <div className="mb-3 border-b border-principal/10 px-3 pb-3 pt-2">
          <p className="text-sm font-bold text-principal">Mi portal</p>
          <p className="mt-1 text-xs text-grisTextos">Selecciona una seccion</p>
        </div>
        <nav aria-label="Secciones del portal" className="space-y-4">
          {groups.map((group) => {
            const groupSections = sections.filter(
              (section) => (section.group ?? "inicio") === group.id
            );

            if (groupSections.length === 0) {
              return null;
            }

            return (
              <div key={group.id}>
                <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-grisTextos">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                  {groupSections.map((section) => {
                    const isSelected = section.id === selected.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => {
                          setActiveSection(section.id);
                          setMobileMenuOpen(false);
                        }}
                        aria-current={isSelected ? "page" : undefined}
                        className={[
                          "min-h-11 w-full border-l-4 px-3 py-2 text-left text-sm font-semibold transition",
                          isSelected
                            ? "border-azulMedio bg-grisMuyClaro text-principal"
                            : "border-transparent text-principal/70 hover:bg-grisMuyClaro hover:text-principal"
                        ].join(" ")}
                      >
                        <span>{section.label}</span>
                        {section.statusText ? (
                          <span className="mt-1 block text-[11px] font-medium leading-4 text-grisTextos">
                            {section.statusText}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 border-b border-principal/10 pb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">
            Portal del paciente
          </p>
          <h1 className="mt-1 text-2xl font-bold text-principal sm:text-3xl">{selected?.label}</h1>
          {selected?.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-principal/65">
              {selected.description}
            </p>
          ) : null}
        </div>
        {selected?.content}
      </div>
    </div>
  );
}
