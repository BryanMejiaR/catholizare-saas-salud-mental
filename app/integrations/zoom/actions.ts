"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getCurrentProfile } from "@/lib/auth/profile";
import { disconnectZoomConnection } from "@/lib/zoom/connections";

export async function disconnectZoomAction() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    redirect("/auth/login");
  }

  try {
    await disconnectZoomConnection(profile.id);
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "zoom_disconnect",
        professional_id: profile.id
      }
    });

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "zoom_disconnect",
      entityType: "zoom_connections",
      result: "error",
      context: "audit_zoom_disconnect_error"
    });

    redirect("/professional/integrations?zoom=disconnect_error");
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "zoom_disconnect",
    entityType: "zoom_connections",
    result: "success",
    context: "audit_zoom_disconnect_success"
  });

  revalidatePath("/professional/integrations");

  redirect("/professional/integrations?zoom=disconnected");
}
