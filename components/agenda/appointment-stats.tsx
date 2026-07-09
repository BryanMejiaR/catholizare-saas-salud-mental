import type { AppointmentStats } from "@/lib/agenda/types";

type AppointmentStatsProps = {
  stats: AppointmentStats;
};

const items: Array<[keyof AppointmentStats, string]> = [
  ["programadas", "Citas programadas"],
  ["completadas", "Citas tomadas"],
  ["no_tomadas", "Citas no tomadas"],
  ["canceladas", "Citas canceladas"],
  ["reagendadas", "Citas reagendadas"],
  ["videollamadas", "Videollamadas"],
  ["presenciales", "Presenciales"]
];

export function AppointmentStatsPanel({ stats }: AppointmentStatsProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Estadisticas</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map(([key, label]) => (
          <div key={key} className="rounded-md border border-ink/10 bg-linen p-3">
            <p className="text-xs text-ink/55">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{stats[key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
