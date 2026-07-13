import type { PortalCatholizareLink, PortalProcessHistory } from "@/lib/portal/types";

type PortalProcessResourcesPanelProps = {
  processes: PortalProcessHistory[];
  links: PortalCatholizareLink[];
};

export function PortalProcessResourcesPanel({ processes, links }: PortalProcessResourcesPanelProps) {
  const processLinks = links.filter((link) => link.category === "proceso");
  const resourceLinks = links.filter((link) => ["recurso", "evento", "test", "podcast"].includes(link.category));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Historial de procesos terapeuticos</h2>
        <div className="mt-4 space-y-3">
          {processes.map((process) => (
            <article key={process.id} className="rounded-md border border-ink/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{process.model_label}</p>
                <span className="rounded-full bg-linen px-3 py-1 text-xs font-semibold text-ink/65">
                  {process.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink/55">
                Profesional: {process.professional.full_name} - Ingreso:{" "}
                {new Date(process.started_at).toLocaleDateString("es-MX")}
              </p>
              {process.consultation_reason ? (
                <p className="mt-2 text-sm text-ink/70">
                  Motivo de consulta: {process.consultation_reason}
                </p>
              ) : null}
            </article>
          ))}
          {processes.length === 0 ? (
            <p className="text-sm text-ink/65">Aun no tienes procesos terapeuticos registrados.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Iniciar un nuevo proceso</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {processLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-ink/10 p-4 transition hover:border-moss"
            >
              <p className="text-sm font-semibold text-ink">{link.title}</p>
              <p className="mt-1 text-xs text-ink/60">{link.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Recursos, eventos y tests</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {resourceLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-ink/10 p-4 transition hover:border-moss"
            >
              <p className="text-sm font-semibold text-ink">{link.title}</p>
              <p className="mt-1 text-xs text-ink/60">{link.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
