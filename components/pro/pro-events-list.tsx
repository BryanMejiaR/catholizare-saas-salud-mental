import type { ProEvent } from "@/lib/pro/types";

type ProEventsListProps = {
  events: ProEvent[];
};

export function ProEventsList({ events }: ProEventsListProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Proximas actividades</h2>
      <div className="mt-4 divide-y divide-ink/10">
        {events.map((event) => (
          <article key={event.id} className="py-4 first:pt-0 last:pb-0">
            {event.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="mb-3 h-36 w-full rounded-md object-cover" src={event.image_url} />
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
              {event.event_type}
            </p>
            <h3 className="mt-2 font-semibold text-ink">{event.title}</h3>
            <p className="mt-1 text-sm text-ink/65">
              {new Date(event.starts_at).toLocaleString("es-MX")} - {event.modality}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/65">{event.description}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {event.info_url ? (
                <a href={event.info_url} target="_blank" rel="noreferrer" className="font-medium text-moss">
                  Ver detalles
                </a>
              ) : null}
              {event.registration_url ? (
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-moss"
                >
                  Registrarme
                </a>
              ) : null}
            </div>
          </article>
        ))}

        {events.length === 0 ? (
          <p className="text-sm text-ink/65">No hay actividades programadas.</p>
        ) : null}
      </div>
    </section>
  );
}
