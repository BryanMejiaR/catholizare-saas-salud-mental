import "server-only";

import type { ProEvent, ProResource } from "@/lib/pro/types";

const PRO_BASE_URL = "https://profesionales.catholizare.com";
const RESOURCE_PAGES = [
  `${PRO_BASE_URL}/`,
  `${PRO_BASE_URL}/recursos-psicologicos/`,
  `${PRO_BASE_URL}/reuniones-clinicas/`,
  `${PRO_BASE_URL}/rondas-clinicas/`,
  `${PRO_BASE_URL}/reuniones-de-integracion/`
];
const ACTIVITY_PAGES = [
  `${PRO_BASE_URL}/reuniones-clinicas/`,
  `${PRO_BASE_URL}/rondas-clinicas/`,
  `${PRO_BASE_URL}/reuniones-de-integracion/`
];

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(value: string, sourceUrl: string) {
  try {
    return new URL(value, sourceUrl).toString();
  } catch {
    return sourceUrl;
  }
}

function firstSrcFromSet(value: string | undefined) {
  return value?.split(",")[0]?.trim().split(" ")[0] ?? "";
}

function imageFromTag(tag: string, sourceUrl: string) {
  const src =
    tag.match(/\s(?:data-src|data-lazy-src|src)=["']([^"']+)["']/i)?.[1] ??
    firstSrcFromSet(
      tag.match(/\s(?:data-srcset|data-lazy-srcset|srcset)=["']([^"']+)["']/i)?.[1]
    );
  const alt = tag.match(/\salt=["']([^"']*)["']/i)?.[1] ?? "";
  const absolute = src ? absoluteUrl(src, sourceUrl) : "";

  return {
    src: absolute.startsWith("http") && !absolute.startsWith("data:") ? absolute : "",
    alt: stripHtml(alt)
  };
}

function isAllowedTitle(title: string, url: string) {
  const text = `${title} ${url}`.toLowerCase();

  return (
    title.length >= 8 &&
    !text.includes("precio") &&
    !text.includes("precios") &&
    !text.includes("pricing") &&
    !text.includes("whatsapp")
  );
}

function rotateByDay<T>(items: T[], limit: number) {
  if (items.length <= limit) {
    return items;
  }

  const todaySeed = Math.floor(Date.now() / 86_400_000);
  const start = todaySeed % items.length;
  return [...items.slice(start), ...items.slice(0, start)].slice(0, limit);
}

async function fetchPage(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 6 }
  });

  if (!response.ok) {
    return "";
  }

  return response.text();
}

function extractLinks(html: string, sourceUrl: string) {
  const matches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const imageMatches = [...html.matchAll(/<img\s+[^>]*>/gi)];
  const images = imageMatches
    .map((match) => imageFromTag(match[0], sourceUrl))
    .filter((image) => image.src.startsWith("http"));
  const seen = new Set<string>();

  return matches
    .map((match, index) => {
      const url = absoluteUrl(match[1], sourceUrl);
      const title = stripHtml(match[2]);
      const inlineImageTag = match[2].match(/<img\s+[^>]*>/i)?.[0];
      const inlineImage = inlineImageTag ? imageFromTag(inlineImageTag, sourceUrl) : null;
      const image =
        (inlineImage?.src ? inlineImage : null) ??
        images.find((item) => title.includes(item.alt) || item.alt.includes(title)) ??
        images[index % Math.max(images.length, 1)] ??
        images[0];

      return {
        title,
        url,
        image_url: image?.src ?? null
      };
    })
    .filter((item) => {
      if (seen.has(item.url) || !item.url.startsWith(PRO_BASE_URL)) {
        return false;
      }

      seen.add(item.url);
      return isAllowedTitle(item.title, item.url);
    });
}

export async function getPublicProResources(): Promise<ProResource[]> {
  const pages = await Promise.allSettled(RESOURCE_PAGES.map(fetchPage));
  const items = pages.flatMap((result, index) =>
    result.status === "fulfilled" ? extractLinks(result.value, RESOURCE_PAGES[index]) : []
  );

  return rotateByDay(items, 8).map((item, index) => ({
    id: `public-resource-${index}-${item.url}`,
    title: item.title,
    description: "Recurso publico recomendado desde Catholizare Pro.",
    resource_type: "articulo",
    category: "Catholizare Pro",
    url: item.url,
    image_url: item.image_url,
    image_storage_path: null,
    tags: ["catholizare-pro", "publico"],
    status: "activo",
    featured: index < 2,
    display_sections: ["dashboard", "resources"],
    visible_from: new Date(0).toISOString(),
    visible_until: null,
    sort_order: index,
    created_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date().toISOString()
  }));
}

export async function getPublicProEvents(): Promise<ProEvent[]> {
  const pages = await Promise.allSettled(ACTIVITY_PAGES.map(fetchPage));
  const items = pages.flatMap((result, index) =>
    result.status === "fulfilled" ? extractLinks(result.value, ACTIVITY_PAGES[index]) : []
  );
  const now = Date.now();

  return rotateByDay(items, 6).map((item, index) => ({
    id: `public-event-${index}-${item.url}`,
    title: item.title,
    description: "Actividad publicada en Catholizare Pro. Revisa la pagina para confirmar fecha, cupo y modalidad.",
    event_type: "Actividad Catholizare Pro",
    starts_at: new Date(now + (index + 1) * 86_400_000).toISOString(),
    ends_at: null,
    modality: "Consultar en Catholizare Pro",
    info_url: item.url,
    registration_url: item.url,
    image_url: item.image_url,
    image_storage_path: null,
    status: "programado",
    created_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date().toISOString()
  }));
}
