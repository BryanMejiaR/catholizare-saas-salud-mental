"use client";

import { useState, type ReactNode } from "react";

type PortalSection = {
  id: string;
  label: string;
  statusText?: string;
  content: ReactNode;
};

type PortalSectionShellProps = {
  sections: PortalSection[];
};

export function PortalSectionShell({ sections }: PortalSectionShellProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const selected = sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="h-fit rounded-lg border border-ink/10 bg-white p-3 lg:sticky lg:top-6">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          Menu del portal
        </p>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={[
                "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition",
                section.id === selected.id
                  ? "bg-moss text-white"
                  : "text-ink/70 hover:bg-linen hover:text-ink"
              ].join(" ")}
            >
              <span>{section.label}</span>
              {section.statusText ? (
                <span
                  className={[
                    "mt-1 block text-xs font-normal",
                    section.id === selected.id ? "text-white/80" : "text-ink/45"
                  ].join(" ")}
                >
                  {section.statusText}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </aside>

      <div>{selected?.content}</div>
    </div>
  );
}
