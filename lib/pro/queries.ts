import "server-only";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicProEvents, getPublicProResources } from "@/lib/pro/public-site";
import type { ProBanner, ProEvent, ProfessionalProDashboard, ProResource } from "@/lib/pro/types";

const RESOURCE_SELECT =
  "id, title, description, resource_type, category, url, image_url, tags, status, featured, display_sections, visible_from, visible_until, sort_order, created_by, created_at, updated_at";
const BANNER_SELECT =
  "id, title, body, banner_type, cta_label, cta_url, image_url, display_sections, status, priority, dismissible, visible_from, visible_until, created_by, created_at, updated_at";
const EVENT_SELECT =
  "id, title, description, event_type, starts_at, ends_at, modality, info_url, registration_url, status, created_by, created_at, updated_at";

function isVisibleWindow(row: { visible_from: string; visible_until: string | null }) {
  const now = Date.now();
  const from = new Date(row.visible_from).getTime();
  const until = row.visible_until ? new Date(row.visible_until).getTime() : Number.POSITIVE_INFINITY;

  return from <= now && until > now;
}

function rotateVisibleBanners(banners: ProBanner[]) {
  if (banners.length <= 2) {
    return banners;
  }

  const daySeed = Math.floor(Date.now() / 86_400_000);
  const start = daySeed % banners.length;
  return [...banners.slice(start), ...banners.slice(0, start)].slice(0, 2);
}

export async function getProfessionalProDashboard(
  profile: AuthProfile,
  section = "dashboard"
): Promise<ProfessionalProDashboard> {
  const supabaseAdmin = createSupabaseAdminClient();
  const [
    { data: resources, error: resourcesError },
    { data: banners, error: bannersError },
    { data: events, error: eventsError },
    publicResourcesResult,
    publicEventsResult
  ] = await Promise.all([
    supabaseAdmin
      .from("pro_resources")
      .select(RESOURCE_SELECT)
      .eq("status", "activo")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("pro_banners")
      .select(BANNER_SELECT)
      .eq("status", "activo")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("pro_events")
      .select(EVENT_SELECT)
      .eq("status", "programado")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(6),
    getPublicProResources(),
    getPublicProEvents()
  ]);

  if (resourcesError || bannersError || eventsError) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "pro_content_read",
      entityType: "pro_content",
      result: "error",
      metadata: {
        section
      },
      context: "audit_pro_content_read_error"
    });

    throw new Error("Unable to load Catholizare Pro content.");
  }

  const visibleResources = ((resources ?? []) as ProResource[]).filter(
    (resource) =>
      isVisibleWindow(resource) &&
      (resource.display_sections.includes(section) || resource.display_sections.includes("resources")) &&
      !resource.title.toLowerCase().includes("precio")
  );
  const visibleBanners = rotateVisibleBanners(((banners ?? []) as ProBanner[])
    .filter(
      (banner) =>
        isVisibleWindow(banner) &&
        banner.display_sections.includes(section) &&
        !banner.title.toLowerCase().includes("precio") &&
        !banner.body.toLowerCase().includes("precio")
    ));
  const mergedResources = [...(publicResourcesResult ?? []), ...visibleResources].slice(0, 12);
  const mergedEvents = [...(publicEventsResult ?? []), ...((events ?? []) as ProEvent[])].slice(0, 8);

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "pro_content_read",
    entityType: "pro_content",
    result: "success",
    metadata: {
      section,
      resources_count: mergedResources.length,
      banners_count: visibleBanners.length
    },
    context: "audit_pro_content_read_success"
  });

  return {
    resources: mergedResources,
    banners: visibleBanners,
    events: mergedEvents
  };
}

export async function getAdminProContent(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const [
    { data: resources, error: resourcesError },
    { data: banners, error: bannersError },
    { data: events, error: eventsError }
  ] = await Promise.all([
    supabaseAdmin
      .from("pro_resources")
      .select(RESOURCE_SELECT)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("pro_banners")
      .select(BANNER_SELECT)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("pro_events")
      .select(EVENT_SELECT)
      .order("starts_at", { ascending: false })
  ]);

  if (resourcesError || bannersError || eventsError) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "pro_admin_content_read",
      entityType: "pro_content",
      result: "error",
      context: "audit_pro_admin_content_read_error"
    });

    throw new Error("Unable to load Catholizare Pro admin content.");
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "pro_admin_content_read",
    entityType: "pro_content",
    result: "success",
    metadata: {
      resources_count: resources?.length ?? 0,
      banners_count: banners?.length ?? 0,
      events_count: events?.length ?? 0
    },
    context: "audit_pro_admin_content_read_success"
  });

  return {
    resources: (resources ?? []) as ProResource[],
    banners: (banners ?? []) as ProBanner[],
    events: (events ?? []) as ProEvent[]
  };
}
