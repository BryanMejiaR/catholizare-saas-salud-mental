import { deleteAnnouncementAction } from "@/app/pro/actions";
import { PRO_BANNER_TYPE_LABEL, PRO_RESOURCE_TYPE_LABEL } from "@/lib/pro/types";
import type {
  PatientAnnouncementBanner,
  PatientAnnouncementEvent,
  PatientAnnouncementResource,
  ProBanner,
  ProEvent,
  ProResource
} from "@/lib/pro/types";

type AdminProContentProps = {
  resources: Array<ProResource | PatientAnnouncementResource>;
  banners: Array<ProBanner | PatientAnnouncementBanner>;
  events: Array<ProEvent | PatientAnnouncementEvent>;
  audience?: "professional" | "patient";
};

function DeleteButton({
  id,
  kind,
  audience
}: {
  id: string;
  kind: "resource" | "banner" | "event";
  audience: "professional" | "patient";
}) {
  return (
    <form action={deleteAnnouncementAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="audience" value={audience} />
      <button
        className="rounded-md border border-clay/30 px-3 py-1 text-xs font-semibold text-clay"
        type="submit"
      >
        Borrar
      </button>
    </form>
  );
}

export function AdminProContent({
  resources,
  banners,
  events,
  audience = "professional"
}: AdminProContentProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Recursos registrados</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium text-ink">{resource.title}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {resource.category} - {resource.status} -{" "}
                  {PRO_RESOURCE_TYPE_LABEL[resource.resource_type] ?? resource.resource_type}
                </p>
              </div>
              <DeleteButton id={resource.id} kind="resource" audience={audience} />
            </div>
          ))}
          {resources.length === 0 ? <p className="text-sm text-ink/65">Sin recursos.</p> : null}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Banners registrados</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {banners.map((banner) => (
            <div key={banner.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium text-ink">{banner.title}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {PRO_BANNER_TYPE_LABEL[banner.banner_type] ?? banner.banner_type} -{" "}
                  {banner.status} - prioridad {banner.priority}
                </p>
              </div>
              <DeleteButton id={banner.id} kind="banner" audience={audience} />
            </div>
          ))}
          {banners.length === 0 ? <p className="text-sm text-ink/65">Sin banners.</p> : null}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Eventos registrados</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium text-ink">{event.title}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {event.event_type} - {event.status} -{" "}
                  {new Date(event.starts_at).toLocaleString("es-MX")}
                </p>
              </div>
              <DeleteButton id={event.id} kind="event" audience={audience} />
            </div>
          ))}
          {events.length === 0 ? <p className="text-sm text-ink/65">Sin eventos.</p> : null}
        </div>
      </section>
    </div>
  );
}
