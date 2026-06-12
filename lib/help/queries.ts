import "server-only";

import * as Sentry from "@sentry/nextjs";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import type {
  AdminHelpDashboard,
  HelpArticle,
  ProfessionalHelpDashboard,
  SupportTicket
} from "@/lib/help/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ARTICLE_SELECT =
  "id, title, summary, body, category, tags, status, created_by_user_id, created_at, updated_at";

const TICKET_SELECT =
  "id, professional_id, category, subject, description, priority, status, created_at, updated_at";

export async function getProfessionalHelpDashboard(
  profile: AuthProfile
): Promise<ProfessionalHelpDashboard> {
  const supabaseAdmin = createSupabaseAdminClient();
  const [{ data: articles, error: articlesError }, { data: tickets, error: ticketsError }] =
    await Promise.all([
      supabaseAdmin
        .from("help_articles")
        .select(ARTICLE_SELECT)
        .eq("status", "activo")
        .order("category", { ascending: true })
        .order("updated_at", { ascending: false }),
      supabaseAdmin
        .from("support_tickets")
        .select(TICKET_SELECT)
        .eq("professional_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5)
    ]);

  if (articlesError || ticketsError) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "help_content_read",
      entityType: "help_center",
      result: "error",
      context: "audit_help_content_read_error"
    });

    throw new Error("Unable to load help center.");
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "help_content_read",
    entityType: "help_center",
    result: "success",
    metadata: {
      articles_count: articles?.length ?? 0,
      tickets_count: tickets?.length ?? 0
    },
    context: "audit_help_content_read_success"
  });

  const { error: interactionError } = await supabaseAdmin.from("help_interactions").insert({
    professional_id: profile.id,
    content_type: "guia"
  });

  if (interactionError) {
    Sentry.captureException(interactionError, {
      extra: {
        professional_id: profile.id,
        context: "help_dashboard_interaction"
      }
    });
  }

  return {
    articles: (articles ?? []) as HelpArticle[],
    tickets: (tickets ?? []) as SupportTicket[]
  };
}

export async function getAdminHelpDashboard(profile: AuthProfile): Promise<AdminHelpDashboard> {
  const supabaseAdmin = createSupabaseAdminClient();
  const [{ data: articles, error: articlesError }, { data: tickets, error: ticketsError }] =
    await Promise.all([
      supabaseAdmin
        .from("help_articles")
        .select(ARTICLE_SELECT)
        .order("updated_at", { ascending: false }),
      supabaseAdmin
        .from("support_tickets")
        .select(TICKET_SELECT)
        .order("created_at", { ascending: false })
        .limit(50)
    ]);

  if (articlesError || ticketsError) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "help_admin_read",
      entityType: "help_center",
      result: "error",
      context: "audit_help_admin_read_error"
    });

    throw new Error("Unable to load help administration.");
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "help_admin_read",
    entityType: "help_center",
    result: "success",
    metadata: {
      articles_count: articles?.length ?? 0,
      tickets_count: tickets?.length ?? 0
    },
    context: "audit_help_admin_read_success"
  });

  return {
    articles: (articles ?? []) as HelpArticle[],
    tickets: (tickets ?? []) as SupportTicket[]
  };
}
