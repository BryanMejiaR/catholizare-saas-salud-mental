import { dismissProBannerAction } from "@/app/pro/actions";
import type { ProBanner } from "@/lib/pro/types";

type ProBannerListProps = {
  banners: ProBanner[];
};

export function ProBannerList({ banners }: ProBannerListProps) {
  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {banners.map((banner) => (
        <section key={banner.id} className="rounded-lg border border-moss/20 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                Catholizare Pro
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink">{banner.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{banner.body}</p>
              {banner.cta_url ? (
                <a
                  href={banner.cta_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex font-medium text-moss"
                >
                  {banner.cta_label || "Ver mas"}
                </a>
              ) : null}
            </div>
            {banner.dismissible ? (
              <form action={dismissProBannerAction}>
                <input type="hidden" name="bannerId" value={banner.id} />
                <button type="submit" className="text-xs font-medium text-ink/55 hover:text-ink">
                  Cerrar
                </button>
              </form>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
