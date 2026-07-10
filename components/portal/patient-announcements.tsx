import type { PatientAnnouncementsDashboard } from "@/lib/pro/types";

type PatientAnnouncementsProps = {
  announcements: PatientAnnouncementsDashboard;
};

export function PatientAnnouncements({ announcements }: PatientAnnouncementsProps) {
  const hasContent =
    announcements.banners.length > 0 ||
    announcements.resources.length > 0 ||
    announcements.events.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Anuncios y recursos</h2>
        <p className="mt-1 text-sm text-ink/60">Informacion general de Catholizare para pacientes.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {announcements.banners.slice(0, 2).map((banner) => (
          <article key={banner.id} className="rounded-md border border-moss/15 bg-moss/5 p-4">
            {banner.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="mb-3 h-28 w-full rounded-md object-cover" src={banner.image_url} />
            ) : null}
            <h3 className="font-semibold text-ink">{banner.title}</h3>
            <p className="mt-1 text-sm leading-6 text-ink/65">{banner.body}</p>
            {banner.cta_url ? (
              <a className="mt-3 inline-flex text-sm font-semibold text-moss" href={banner.cta_url}>
                {banner.cta_label ?? "Ver mas"}
              </a>
            ) : null}
          </article>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {announcements.resources.slice(0, 3).map((resource) => (
          <article key={resource.id} className="overflow-hidden rounded-md border border-ink/10">
            {resource.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-24 w-full object-cover" src={resource.image_url} />
            ) : null}
            <div className="p-3">
              <p className="text-xs font-semibold uppercase text-moss">{resource.category}</p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{resource.title}</h3>
              <a className="mt-2 inline-flex text-xs font-semibold text-moss" href={resource.url}>
                Ver mas
              </a>
            </div>
          </article>
        ))}
      </div>

      {announcements.events.length > 0 ? (
        <div className="rounded-md border border-ink/10 p-4">
          <h3 className="text-sm font-semibold text-ink">Proximas actividades</h3>
          <div className="mt-2 divide-y divide-ink/10">
            {announcements.events.slice(0, 3).map((event) => (
              <div key={event.id} className="py-2 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-ink">{event.title}</p>
                <p className="text-xs text-ink/55">
                  {new Date(event.starts_at).toLocaleString("es-MX")} - {event.modality}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
