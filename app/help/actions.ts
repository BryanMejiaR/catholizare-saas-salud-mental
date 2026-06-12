"use server";

import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  HELP_ARTICLE_STATUSES,
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES
} from "@/lib/help/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type HelpActionState = {
  message?: string;
  ok?: boolean;
};

const csvText = z
  .string()
  .trim()
  .max(300)
  .transform((value) =>
    Array.from(
      new Set(
        value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    ).slice(0, 12)
  );

const createTicketSchema = z.object({
  category: z.string().trim().min(3).max(80),
  subject: z.string().trim().min(5).max(180),
  description: z.string().trim().min(20).max(3000),
  priority: z.enum(SUPPORT_TICKET_PRIORITIES),
  privacyConfirmation: z.literal("on", {
    errorMap: () => ({
      message: "Confirma que no incluyes datos clinicos sensibles."
    })
  })
});

const createArticleSchema = z.object({
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(500),
  body: z.string().trim().min(20).max(12000),
  category: z.string().trim().min(3).max(80),
  tags: csvText,
  status: z.enum(HELP_ARTICLE_STATUSES)
});

const updateTicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(SUPPORT_TICKET_STATUSES)
});

const updateArticleStatusSchema = z.object({
  articleId: z.string().uuid(),
  status: z.enum(HELP_ARTICLE_STATUSES)
});

async function getActiveProfessional() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return null;
  }

  return profile;
}

async function getActiveHelpAdmin() {
  const profile = await getCurrentProfile();

  if (
    !profile ||
    !["administrador", "super_administrador"].includes(profile.role) ||
    profile.account_status !== "activo"
  ) {
    return null;
  }

  return profile;
}

export async function createSupportTicketAction(
  _previousState: HelpActionState,
  formData: FormData
): Promise<HelpActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = createTicketSchema.safeParse({
    category: formData.get("category"),
    subject: formData.get("subject"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    privacyConfirmation: formData.get("privacyConfirmation")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos de soporte invalidos.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .insert({
      professional_id: actor.id,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority
    })
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Support ticket insert did not return id"), {
      extra: {
        professional_id: actor.id,
        category: parsed.data.category
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "support_ticket_create",
      entityType: "support_tickets",
      result: "error",
      context: "audit_support_ticket_create_error"
    });

    return { message: "No fue posible enviar la solicitud de soporte.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "support_ticket_create",
    entityType: "support_tickets",
    entityId: data.id,
    result: "success",
    metadata: {
      category: parsed.data.category,
      priority: parsed.data.priority
    },
    context: "audit_support_ticket_create_success"
  });

  revalidatePath("/professional/help");

  return { message: "Solicitud de soporte enviada.", ok: true };
}

export async function createHelpArticleAction(
  _previousState: HelpActionState,
  formData: FormData
): Promise<HelpActionState> {
  const actor = await getActiveHelpAdmin();

  if (!actor) {
    return { message: "No tienes permisos para gestionar ayuda.", ok: false };
  }

  const parsed = createArticleSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    body: formData.get("body"),
    category: formData.get("category"),
    tags: formData.get("tags"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos de articulo invalidos.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("help_articles")
    .insert({
      title: parsed.data.title,
      summary: parsed.data.summary,
      body: parsed.data.body,
      category: parsed.data.category,
      tags: parsed.data.tags,
      status: parsed.data.status,
      created_by_user_id: actor.id
    })
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Help article insert did not return id"), {
      extra: {
        role: actor.role,
        category: parsed.data.category
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "help_article_create",
      entityType: "help_articles",
      result: "error",
      context: "audit_help_article_create_error"
    });

    return { message: "No fue posible crear el articulo.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "help_article_create",
    entityType: "help_articles",
    entityId: data.id,
    result: "success",
    metadata: {
      category: parsed.data.category,
      status: parsed.data.status
    },
    context: "audit_help_article_create_success"
  });

  revalidatePath("/admin/help");
  revalidatePath("/super-admin/help");
  revalidatePath("/professional/help");

  return { message: "Articulo creado.", ok: true };
}

export async function updateSupportTicketStatusAction(
  _previousState: HelpActionState,
  formData: FormData
): Promise<HelpActionState> {
  const actor = await getActiveHelpAdmin();

  if (!actor) {
    return { message: "No tienes permisos para actualizar tickets.", ok: false };
  }

  const parsed = updateTicketStatusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return { message: "Datos de ticket invalidos.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .update({
      status: parsed.data.status
    })
    .eq("id", parsed.data.ticketId)
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Support ticket update affected zero rows"), {
      extra: {
        ticket_id: parsed.data.ticketId,
        status: parsed.data.status
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "support_ticket_update",
      entityType: "support_tickets",
      entityId: parsed.data.ticketId,
      result: "error",
      context: "audit_support_ticket_update_error"
    });

    return { message: "No fue posible actualizar el ticket.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "support_ticket_update",
    entityType: "support_tickets",
    entityId: parsed.data.ticketId,
    result: "success",
    metadata: {
      status: parsed.data.status
    },
    context: "audit_support_ticket_update_success"
  });

  revalidatePath("/admin/help");
  revalidatePath("/super-admin/help");

  return { message: "Ticket actualizado.", ok: true };
}

export async function updateHelpArticleStatusAction(
  _previousState: HelpActionState,
  formData: FormData
): Promise<HelpActionState> {
  const actor = await getActiveHelpAdmin();

  if (!actor) {
    return { message: "No tienes permisos para actualizar articulos.", ok: false };
  }

  const parsed = updateArticleStatusSchema.safeParse({
    articleId: formData.get("articleId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return { message: "Datos de articulo invalidos.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("help_articles")
    .update({
      status: parsed.data.status
    })
    .eq("id", parsed.data.articleId)
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Help article update affected zero rows"), {
      extra: {
        article_id: parsed.data.articleId,
        status: parsed.data.status
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "help_article_update",
      entityType: "help_articles",
      entityId: parsed.data.articleId,
      result: "error",
      context: "audit_help_article_update_error"
    });

    return { message: "No fue posible actualizar el articulo.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "help_article_update",
    entityType: "help_articles",
    entityId: parsed.data.articleId,
    result: "success",
    metadata: {
      status: parsed.data.status
    },
    context: "audit_help_article_update_success"
  });

  revalidatePath("/admin/help");
  revalidatePath("/super-admin/help");
  revalidatePath("/professional/help");

  return { message: "Articulo actualizado.", ok: true };
}
