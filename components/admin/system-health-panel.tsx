import type { SystemHealthCheck } from "@/lib/admin/system-health";

const statusClass: Record<SystemHealthCheck["status"], string> = {
  ok: "border-moss/20 bg-moss/5 text-moss",
  warning: "border-gold/30 bg-gold/10 text-ink",
  error: "border-clay/30 bg-clay/10 text-clay"
};

export function SystemHealthPanel({ checks }: { checks: SystemHealthCheck[] }) {
  return (
    <section className="mt-8 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">System health</h2>
        <p className="mt-1 text-sm text-ink/60">
          Pruebas automaticas no destructivas para verificar configuracion y servicios criticos.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((check) => (
          <div key={check.label} className={`rounded-md border p-4 ${statusClass[check.status]}`}>
            <p className="text-xs font-semibold uppercase">{check.status}</p>
            <h3 className="mt-1 font-semibold text-ink">{check.label}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">{check.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
