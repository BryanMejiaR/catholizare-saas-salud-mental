"use server";

import { randomUUID } from "crypto";
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
const deleteAnnouncementSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["resource", "banner", "event"]),
  audience: z.enum(["professional", "patient"]).default("professional")
});
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

function revalidatePatientAnnouncementsAdminPaths() {
  revalidatePath("/admin/patient-announcements");
  revalidatePath("/super-admin/patient-announcements");
}

function formatValidationError(error: z.ZodError, entity: string) {
  const labels: Record<string, string> = {
    title: "titulo",
    description: "descripcion",
    body: "cuerpo",
    resourceType: "tipo",
    bannerType: "tipo",
    category: "categoria",
    url: "URL",
    imageUrl: "URL de imagen",
    tags: "etiquetas",
    status: "estado",
    displaySections: "secciones",
    sortOrder: "orden",
    ctaLabel: "texto del boton",
    ctaUrl: "URL del boton",
    priority: "prioridad",
    eventType: "tipo de evento",
    startsAt: "fecha y hora",
    modality: "modalidad",
    infoUrl: "URL de informacion",
    registrationUrl: "URL de registro"
  };
  const issue = error.issues[0];
  const field = String(issue?.path[0] ?? "campo");
  const label = labels[field] ?? field;

  return `Datos de ${entity} invalidos: revisa ${label}. ${issue?.message ?? ""}`.trim();
}

function getOptionalFile(formData: FormData, name: string) {
  const file = formData.get(name);
  return file instanceof File && file.size > 0 ? file : null;
}

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

async function uploadAnnouncementImage(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  file: File | null,
  actorId: string
) {
  if (!file) {
    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen debe ser JPG, PNG, WEBP o GIF y pesar maximo 5 MB.");
  }

  const path = `${actorId}/${randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabaseAdmin.storage
    .from("announcement-assets")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabaseAdmin.storage.from("announcement-assets").getPublicUrl(path);
  return {
    path,
    publicUrl: data.publicUrl
  };
}

async function removeAnnouncementImage(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  path: string | null | undefined
) {
  if (path) {
    await supabaseAdmin.storage.from("announcement-assets").remove([path]);
  }
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
    return { message: formatValidationError(parsed.error, "recurso"), ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  let uploadedImage = null;

  try {
    uploadedImage = await uploadAnnouncementImage(supabaseAdmin, getOptionalFile(formData, "imageFile"), actor.id);
  } catch (error) {
    Sentry.captureException(error, { extra: { context: "pro_resource_image_upload" } });
    return { message: error instanceof Error ? error.message : "No fue posible subir la imagen.", ok: false };
  }

  const { error } = await supabaseAdmin.from("pro_resources").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    resource_type: parsed.data.resourceType,
    category: parsed.data.category,
    url: parsed.data.url,
    image_url: uploadedImage?.publicUrl ?? parsed.data.imageUrl ?? null,
    image_storage_path: uploadedImage?.path ?? null,
    tags: parseCsv(parsed.data.tags),
    status: parsed.data.status,
    featured: parsed.data.featured,
    display_sections: parseCsv(parsed.data.displaySections),
    sort_order: parsed.data.sortOrder,
    created_by: actor.id
  });

  if (error) {
    await removeAnnouncementImage(supabaseAdmin, uploadedImage?.path);
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

export async function createPatientResourceAction(
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
    return { message: formatValidationError(parsed.error, "recurso"), ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  let uploadedImage = null;

  try {
    uploadedImage = await uploadAnnouncementImage(supabaseAdmin, getOptionalFile(formData, "imageFile"), actor.id);
  } catch (error) {
    Sentry.captureException(error, { extra: { context: "patient_resource_image_upload" } });
    return { message: error instanceof Error ? error.message : "No fue posible subir la imagen.", ok: false };
  }

  const { error } = await supabaseAdmin.from("patient_resources").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    resource_type: parsed.data.resourceType,
    category: parsed.data.category,
    url: parsed.data.url,
    image_url: uploadedImage?.publicUrl ?? parsed.data.imageUrl ?? null,
    image_storage_path: uploadedImage?.path ?? null,
    tags: parseCsv(parsed.data.tags),
    status: parsed.data.status,
    featured: parsed.data.featured,
    display_sections: parseCsv(parsed.data.displaySections),
    sort_order: parsed.data.sortOrder,
    created_by: actor.id
  });

  if (error) {
    await removeAnnouncementImage(supabaseAdmin, uploadedImage?.path);
    Sentry.captureException(error, { extra: { context: "patient_resource_create" } });
    return { message: "No fue posible crear el recurso para pacientes.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "patient_resource_create",
    entityType: "patient_resources",
    result: "success",
    context: "audit_patient_resource_create_success"
  });

  revalidatePatientAnnouncementsAdminPaths();
  revalidatePath("/portal");

  return { message: "Recurso para pacientes creado.", ok: true };
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
    return { message: formatValidationError(parsed.error, "banner"), ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  let uploadedImage = null;

  try {
    uploadedImage = await uploadAnnouncementImage(supabaseAdmin, getOptionalFile(formData, "imageFile"), actor.id);
  } catch (error) {
    Sentry.captureException(error, { extra: { context: "pro_banner_image_upload" } });
    return { message: error instanceof Error ? error.message : "No fue posible subir la imagen.", ok: false };
  }

  const { error } = await supabaseAdmin.from("pro_banners").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    banner_type: parsed.data.bannerType,
    cta_label: parsed.data.ctaLabel || null,
    cta_url: parsed.data.ctaUrl ?? null,
    image_url: uploadedImage?.publicUrl ?? null,
    image_storage_path: uploadedImage?.path ?? null,
    display_sections: parseCsv(parsed.data.displaySections),
    status: parsed.data.status,
    priority: parsed.data.priority,
    dismissible: parsed.data.dismissible,
    created_by: actor.id
  });

  if (error) {
    await removeAnnouncementImage(supabaseAdmin, uploadedImage?.path);
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

export async function createPatientBannerAction(
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
    return { message: formatValidationError(parsed.error, "banner"), ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  let uploadedImage = null;

  try {
    uploadedImage = await uploadAnnouncementImage(supabaseAdmin, getOptionalFile(formData, "imageFile"), actor.id);
  } catch (error) {
    Sentry.captureException(error, { extra: { context: "patient_banner_image_upload" } });
    return { message: error instanceof Error ? error.message : "No fue posible subir la imagen.", ok: false };
  }

  const { error } = await supabaseAdmin.from("patient_banners").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    banner_type: parsed.data.bannerType,
    cta_label: parsed.data.ctaLabel || null,
    cta_url: parsed.data.ctaUrl ?? null,
    image_url: uploadedImage?.publicUrl ?? null,
    image_storage_path: uploadedImage?.path ?? null,
    display_sections: parseCsv(parsed.data.displaySections),
    status: parsed.data.status,
    priority: parsed.data.priority,
    dismissible: parsed.data.dismissible,
    created_by: actor.id
  });

  if (error) {
    await removeAnnouncementImage(supabaseAdmin, uploadedImage?.path);
    Sentry.captureException(error, { extra: { context: "patient_banner_create" } });
    return { message: "No fue posible crear el banner para pacientes.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "patient_banner_create",
    entityType: "patient_banners",
    result: "success",
    context: "audit_patient_banner_create_success"
  });

  revalidatePatientAnnouncementsAdminPaths();
  revalidatePath("/portal");

  return { message: "Banner para pacientes creado.", ok: true };
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
    return { message: formatValidationError(parsed.error, "evento"), ok: false };
  }

  const startsAt = new Date(parsed.data.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    return { message: "Fecha de evento invalida.", ok: false };
  }

  if (startsAt.getTime() <= Date.now()) {
    return { message: "El evento debe programarse en una fecha futura.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  let uploadedImage = null;

  try {
    uploadedImage = await uploadAnnouncementImage(supabaseAdmin, getOptionalFile(formData, "imageFile"), actor.id);
  } catch (error) {
    Sentry.captureException(error, { extra: { context: "pro_event_image_upload" } });
    return { message: error instanceof Error ? error.message : "No fue posible subir la imagen.", ok: false };
  }

  const { error } = await supabaseAdmin.from("pro_events").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    event_type: parsed.data.eventType,
    starts_at: startsAt.toISOString(),
    modality: parsed.data.modality,
    info_url: parsed.data.infoUrl ?? null,
    registration_url: parsed.data.registrationUrl ?? null,
    image_url: uploadedImage?.publicUrl ?? null,
    image_storage_path: uploadedImage?.path ?? null,
    created_by: actor.id
  });

  if (error) {
    await removeAnnouncementImage(supabaseAdmin, uploadedImage?.path);
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

export async function createPatientEventAction(
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
    return { message: formatValidationError(parsed.error, "evento"), ok: false };
  }

  const startsAt = new Date(parsed.data.startsAt);

  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
    return { message: "El evento debe programarse en una fecha futura.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  let uploadedImage = null;

  try {
    uploadedImage = await uploadAnnouncementImage(supabaseAdmin, getOptionalFile(formData, "imageFile"), actor.id);
  } catch (error) {
    Sentry.captureException(error, { extra: { context: "patient_event_image_upload" } });
    return { message: error instanceof Error ? error.message : "No fue posible subir la imagen.", ok: false };
  }

  const { error } = await supabaseAdmin.from("patient_events").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    event_type: parsed.data.eventType,
    starts_at: startsAt.toISOString(),
    modality: parsed.data.modality,
    info_url: parsed.data.infoUrl ?? null,
    registration_url: parsed.data.registrationUrl ?? null,
    image_url: uploadedImage?.publicUrl ?? null,
    image_storage_path: uploadedImage?.path ?? null,
    created_by: actor.id
  });

  if (error) {
    await removeAnnouncementImage(supabaseAdmin, uploadedImage?.path);
    Sentry.captureException(error, { extra: { context: "patient_event_create" } });
    return { message: "No fue posible crear el evento para pacientes.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "patient_event_create",
    entityType: "patient_events",
    result: "success",
    context: "audit_patient_event_create_success"
  });

  revalidatePatientAnnouncementsAdminPaths();
  revalidatePath("/portal");

  return { message: "Evento para pacientes creado.", ok: true };
}

export async function deleteAnnouncementAction(formData: FormData) {
  const actor = await getActiveAdmin();

  if (!actor) {
    return;
  }

  const parsed = deleteAnnouncementSchema.safeParse({
    id: formData.get("id"),
    kind: formData.get("kind"),
    audience: formData.get("audience") ?? "professional"
  });

  if (!parsed.success) {
    return;
  }

  const tableByKind = {
    professional: {
      resource: "pro_resources",
      banner: "pro_banners",
      event: "pro_events"
    },
    patient: {
      resource: "patient_resources",
      banner: "patient_banners",
      event: "patient_events"
    }
  } as const;
  const table = tableByKind[parsed.data.audience][parsed.data.kind];
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: existing, error: loadError } = await supabaseAdmin
    .from(table)
    .select("id, image_storage_path")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (loadError || !existing) {
    Sentry.captureException(loadError ?? new Error("Announcement not found for deletion"), {
      extra: { table, id: parsed.data.id }
    });
    return;
  }

  const { error } = await supabaseAdmin.from(table).delete().eq("id", parsed.data.id);

  if (error) {
    Sentry.captureException(error, { extra: { context: "announcement_delete", table } });
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "announcement_delete",
      entityType: table,
      entityId: parsed.data.id,
      result: "error",
      context: "audit_announcement_delete_error"
    });
    return;
  }

  await removeAnnouncementImage(supabaseAdmin, existing.image_storage_path as string | null);
  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "announcement_delete",
    entityType: table,
    entityId: parsed.data.id,
    result: "success",
    context: "audit_announcement_delete_success"
  });

  revalidatePath(adminProPath(actor.role));
  revalidatePatientAnnouncementsAdminPaths();
  revalidatePath("/professional");
  revalidatePath("/professional/resources");
  revalidatePath("/portal");
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
