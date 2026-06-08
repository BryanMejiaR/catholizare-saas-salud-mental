"use server";

import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  PRO_BANNER_TYPES,
  PRO_CONTENT_STATUSES,
  PRO_RESOURCE_TYPES
} from "@/lib/pro/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ProActionState = {
  message?: string;
  ok?: boolean;
};
type AdminProRole = "administrador" | "super_administrador";

const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const resourceSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(1200),
  resourceType: z.enum(PRO_RESOURCE_TYPES),
  category: z.string().trim().min(2).max(120),
  url: z.string().trim().url(),
  imageUrl: optionalUrl,
  tags: z.string().trim().max(400).optional(),
  status: z.enum(PRO_CONTENT_STATUSES),
  featured: z.coerce.boolean().default(false),
  displaySections: z.string().trim().min(1).max(400),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
});

const bannerSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(10).max(1200),
  bannerType: z.enum(PRO_BANNER_TYPES),
  ctaLabel: z.string().trim().max(80).optional(),
  ctaUrl: optionalUrl,
  displaySections: z.string().trim().min(1).max(400),
  status: z.enum(PRO_CONTENT_STATUSES),
  priority: z.coerce.number().int().min(0).max(9999).default(0),
  dismissible: z.coerce.boolean().default(true)
});

const eventSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(1200),
  eventType: z.string().trim().min(2).max(120),
  startsAt: z.string().trim().min(16),
  modality: z.string().trim().min(2).max(80),
  infoUrl: optionalUrl,
  registrationUrl: optionalUrl
});

const dismissBannerSchema = z.object({
  bannerId: z.string().uuid()
});

async function getActiveAdmin() {
  const profile = await getCurrentProfile();

  if (
    !profile ||
    (profile.role !== "administrador" && profile.role !== "super_administrador") ||
    profile.account_status !== "activo"
  ) {
    return null;
  }

  return profile as typeof profile & { role: AdminProRole };
}

async function getActiveProfessional() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return null;
  }

  return profile;
}

function parseCsv(value: string | undefined) {
  return [...new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean))];
}

function adminProPath(role: AdminProRole) {
  return role === "super_administrador" ? "/super-admin/pro" : "/admin/pro";
}

export async function createProResourceAction(
  _previousState: ProActionState,
  formData: FormData
): Promise<ProActionState> {
  const actor = await getActiveAdmin();

  if (!actor) {
    return { message: "No tienes permisos administrativos activos.", ok: false };
  }

  const parsed = resourceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    resourceType: formData.get("resourceType"),
    category: formData.get("category"),
    url: formData.get("url"),
    imageUrl: formData.get("imageUrl"),
    tags: formData.get("tags"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    displaySections: formData.get("displaySections"),
    sortOrder: formData.get("sortOrder")
  });

  if (!parsed.success) {
    return { message: "Datos de recurso invalidos.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("pro_resources").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    resource_type: parsed.data.resourceType,
    category: parsed.data.category,
    url: parsed.data.url,
    image_url: parsed.data.imageUrl ?? null,
    tags: parseCsv(parsed.data.tags),
    status: parsed.data.status,
    featured: parsed.data.featured,
    display_sections: parseCsv(parsed.data.displaySections),
    sort_order: parsed.data.sortOrder,
    created_by: actor.id
  });

  if (error) {
    Sentry.captureException(error, { extra: { context: "pro_resource_create" } });
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "pro_resource_create",
      entityType: "pro_resources",
      result: "error",
      context: "audit_pro_resource_create_error"
    });
    return { message: "No fue posible crear el recurso.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "pro_resource_create",
    entityType: "pro_resources",
    result: "success",
    context: "audit_pro_resource_create_success"
  });

  revalidatePath(adminProPath(actor.role));
  revalidatePath("/professional/resources");

  return { message: "Recurso creado.", ok: true };
}

export async function createProBannerAction(
  _previousState: ProActionState,
  formData: FormData
): Promise<ProActionState> {
  const actor = await getActiveAdmin();

  if (!actor) {
    return { message: "No tienes permisos administrativos activos.", ok: false };
  }

  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    bannerType: formData.get("bannerType"),
    ctaLabel: formData.get("ctaLabel"),
    ctaUrl: formData.get("ctaUrl"),
    displaySections: formData.get("displaySections"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    dismissible: formData.get("dismissible") === "on"
  });

  if (!parsed.success) {
    return { message: "Datos de banner invalidos.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("pro_banners").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    banner_type: parsed.data.bannerType,
    cta_label: parsed.data.ctaLabel || null,
    cta_url: parsed.data.ctaUrl ?? null,
    display_sections: parseCsv(parsed.data.displaySections),
    status: parsed.data.status,
    priority: parsed.data.priority,
    dismissible: parsed.data.dismissible,
    created_by: actor.id
  });

  if (error) {
    Sentry.captureException(error, { extra: { context: "pro_banner_create" } });
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "pro_banner_create",
      entityType: "pro_banners",
      result: "error",
      context: "audit_pro_banner_create_error"
    });
    return { message: "No fue posible crear el banner.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "pro_banner_create",
    entityType: "pro_banners",
    result: "success",
    context: "audit_pro_banner_create_success"
  });

  revalidatePath(adminProPath(actor.role));
  revalidatePath("/professional");

  return { message: "Banner creado.", ok: true };
}

export async function createProEventAction(
  _previousState: ProActionState,
  formData: FormData
): Promise<ProActionState> {
  const actor = await getActiveAdmin();

  if (!actor) {
    return { message: "No tienes permisos administrativos activos.", ok: false };
  }

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    eventType: formData.get("eventType"),
    startsAt: formData.get("startsAt"),
    modality: formData.get("modality"),
    infoUrl: formData.get("infoUrl"),
    registrationUrl: formData.get("registrationUrl")
  });

  if (!parsed.success) {
    return { message: "Datos de evento invalidos.", ok: false };
  }

  const startsAt = new Date(parsed.data.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    return { message: "Fecha de evento invalida.", ok: false };
  }

  if (startsAt.getTime() <= Date.now()) {
    return { message: "El evento debe programarse en una fecha futura.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("pro_events").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    event_type: parsed.data.eventType,
    starts_at: startsAt.toISOString(),
    modality: parsed.data.modality,
    info_url: parsed.data.infoUrl ?? null,
    registration_url: parsed.data.registrationUrl ?? null,
    created_by: actor.id
  });

  if (error) {
    Sentry.captureException(error, { extra: { context: "pro_event_create" } });
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "pro_event_create",
      entityType: "pro_events",
      result: "error",
      context: "audit_pro_event_create_error"
    });
    return { message: "No fue posible crear el evento.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "pro_event_create",
    entityType: "pro_events",
    result: "success",
    context: "audit_pro_event_create_success"
  });

  revalidatePath(adminProPath(actor.role));
  revalidatePath("/professional");

  return { message: "Evento creado.", ok: true };
}

export async function dismissProBannerAction(formData: FormData) {
  const actor = await getActiveProfessional();

  if (!actor) {
    return;
  }

  const parsed = dismissBannerSchema.safeParse({
    bannerId: formData.get("bannerId")
  });

  if (!parsed.success) {
    return;
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("pro_banner_dismissals").upsert({
    banner_id: parsed.data.bannerId,
    professional_id: actor.id
  });

  if (error) {
    Sentry.captureException(error, {
      extra: {
        context: "pro_banner_dismiss",
        banner_id: parsed.data.bannerId,
        professional_id: actor.id
      }
    });
    return;
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "pro_banner_dismiss",
    entityType: "pro_banners",
    entityId: parsed.data.bannerId,
    result: "success",
    context: "audit_pro_banner_dismiss_success"
  });

  revalidatePath("/professional");
  revalidatePath("/professional/resources");
}
