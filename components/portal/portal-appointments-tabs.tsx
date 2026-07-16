"use client";

import { useState, type ReactNode } from "react";

type PortalAppointmentsTabsProps = {
  upcomingContent: ReactNode;
  historyContent: ReactNode;
};

const TABS = [
  { id: "upcoming", label: "Proximas citas" },
  { id: "history", label: "Historial" }
] as const;

export function PortalAppointmentsTabs({
  upcomingContent,
  historyContent
}: PortalAppointmentsTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("upcoming");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border border-ink/10 bg-white p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id ? "bg-moss text-white" : "text-ink hover:bg-ink/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "upcoming" ? upcomingContent : historyContent}
    </div>
  );
}
