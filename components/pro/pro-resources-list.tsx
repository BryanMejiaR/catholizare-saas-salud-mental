import type { ProResource } from "@/lib/pro/types";

type ProResourcesListProps = {
  resources: ProResource[];
};

export function ProResourcesList({ resources }: ProResourcesListProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Recursos</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {resources.map((resource) => (
          <article key={resource.id} className="overflow-hidden rounded-md border border-ink/10">
            {resource.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resource.image_url}
                alt=""
                className="h-36 w-full object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                  {resource.category}
                </p>
                <h3 className="mt-2 font-semibold text-ink">{resource.title}</h3>
              </div>
              {resource.featured ? (
                <span className="rounded-full bg-moss/10 px-2 py-1 text-xs font-medium text-ink">
                  Destacado
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/65">{resource.description}</p>
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex font-medium text-moss"
            >
              Ver mas
            </a>
            </div>
          </article>
        ))}

        {resources.length === 0 ? (
          <p className="text-sm text-ink/65">No hay recursos activos para mostrar.</p>
        ) : null}
      </div>
    </section>
  );
}
