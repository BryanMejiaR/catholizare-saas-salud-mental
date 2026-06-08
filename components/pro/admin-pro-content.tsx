import type { ProBanner, ProEvent, ProResource } from "@/lib/pro/types";

type AdminProContentProps = {
  resources: ProResource[];
  banners: ProBanner[];
  events: ProEvent[];
};

export function AdminProContent({ resources, banners, events }: AdminProContentProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Recursos registrados</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {resources.map((resource) => (
            <div key={resource.id} className="py-3 first:pt-0 last:pb-0">
              <p className="font-medium text-ink">{resource.title}</p>
              <p className="mt-1 text-xs text-ink/55">
                {resource.category} - {resource.status} - {resource.resource_type}
              </p>
            </div>
          ))}
          {resources.length === 0 ? <p className="text-sm text-ink/65">Sin recursos.</p> : null}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Banners registrados</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {banners.map((banner) => (
            <div key={banner.id} className="py-3 first:pt-0 last:pb-0">
              <p className="font-medium text-ink">{banner.title}</p>
              <p className="mt-1 text-xs text-ink/55">
                {banner.banner_type} - {banner.status} - prioridad {banner.priority}
              </p>
            </div>
          ))}
          {banners.length === 0 ? <p className="text-sm text-ink/65">Sin banners.</p> : null}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Eventos registrados</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {events.map((event) => (
            <div key={event.id} className="py-3 first:pt-0 last:pb-0">
              <p className="font-medium text-ink">{event.title}</p>
              <p className="mt-1 text-xs text-ink/55">
                {event.event_type} - {event.status} -{" "}
                {new Date(event.starts_at).toLocaleString("es-MX")}
              </p>
            </div>
          ))}
          {events.length === 0 ? <p className="text-sm text-ink/65">Sin eventos.</p> : null}
        </div>
      </section>
    </div>
  );
}
