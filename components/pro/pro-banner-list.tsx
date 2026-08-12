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
    <div className="space-y-6 px-1 sm:px-8">
      {banners.map((banner) => (
        <section
          key={banner.id}
          className="relative min-h-[92px] overflow-hidden rounded-[46px] bg-azulMedio px-6 py-5 text-blanco sm:min-h-[114px] sm:rounded-[58px] sm:px-8"
        >
          <div className="flex min-h-[52px] flex-wrap items-end justify-between gap-4 pr-8 sm:min-h-[72px]">
            <div className="max-w-3xl">
              <p className="sr-only">Catholizare Pro</p>
              <h2 className="max-w-fit rounded-full bg-blanco px-4 py-2 text-sm font-semibold text-texto sm:px-6">
                {banner.title}
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-blanco sm:text-base">
                {banner.body}
              </p>
              {banner.cta_url ? (
                <a
                  href={banner.cta_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full bg-blanco px-4 py-2 text-sm font-semibold text-texto transition hover:bg-enfasis"
                >
                  {banner.cta_label || "Ver mas"}
                </a>
              ) : null}
            </div>
            {banner.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.image_url}
                alt=""
                className="h-16 w-24 rounded-full object-cover sm:h-20 sm:w-32"
                loading="lazy"
              />
            ) : null}
            {banner.dismissible ? (
              <form action={dismissProBannerAction} className="absolute right-5 top-3">
                <input type="hidden" name="bannerId" value={banner.id} />
                <button
                  type="submit"
                  className="h-4 w-8 rounded-full bg-rojoRompe text-[0px] transition hover:bg-clay"
                  title="Cerrar anuncio"
                >
                  Cerrar anuncio
                </button>
              </form>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
