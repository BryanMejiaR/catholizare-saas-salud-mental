"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

import { getCurrentProfile } from "@/lib/auth/profile";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { disconnectGoogleCalendarConnection } from "@/lib/google-calendar/connections";

export async function disconnectGoogleCalendarAction() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    redirect("/auth/login");
  }

  try {
    await disconnectGoogleCalendarConnection(profile.id);
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "google_calendar_disconnect",
        professional_id: profile.id
      }
    });

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "gcal_disconnect",
      entityType: "google_calendar_connections",
      result: "error",
      context: "audit_gcal_disconnect_error"
    });

    redirect("/professional/integrations?gcal=disconnect_error");
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "gcal_disconnect",
    entityType: "google_calendar_connections",
    result: "success",
    context: "audit_gcal_disconnect_success"
  });

  revalidatePath("/professional/integrations");

  redirect("/professional/integrations?gcal=disconnected");
}
