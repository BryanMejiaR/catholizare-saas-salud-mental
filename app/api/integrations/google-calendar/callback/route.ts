import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { getCurrentProfile } from "@/lib/auth/profile";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getPublicAppUrl } from "@/lib/integrations/public-url";
import {
  exchangeGoogleCalendarCode,
  getGoogleCalendarUserEmail
} from "@/lib/google-calendar/client";
import { GCAL_STATE_COOKIE } from "@/lib/google-calendar/oauth-state";
import { upsertGoogleCalendarConnection } from "@/lib/google-calendar/connections";

export async function GET(request: NextRequest) {
  const publicAppUrl = getPublicAppUrl();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(GCAL_STATE_COOKIE)?.value;
  const profile = await getCurrentProfile();
  const responseUrl = new URL("/professional/integrations", publicAppUrl);

  function redirectToIntegrations() {
    const response = NextResponse.redirect(responseUrl);
    response.cookies.delete(GCAL_STATE_COOKIE);
    return response;
  }

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return NextResponse.redirect(new URL("/auth/login", publicAppUrl));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    responseUrl.searchParams.set("gcal", "invalid_state");
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "gcal_connect",
      entityType: "google_calendar_connections",
      result: "denied",
      context: "audit_gcal_connect_invalid_state"
    });
    return redirectToIntegrations();
  }

  try {
    const tokens = await exchangeGoogleCalendarCode(code);

    if (!tokens.refresh_token) {
      throw new Error("Google did not return a refresh token.");
    }

    const email = await getGoogleCalendarUserEmail(tokens.access_token);
    const connectionId = await upsertGoogleCalendarConnection({
      professionalId: profile.id,
      googleAccountEmail: email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "gcal_connect",
      entityType: "google_calendar_connections",
      entityId: connectionId,
      result: "success",
      metadata: {
        google_account_email: email
      },
      context: "audit_gcal_connect_success"
    });

    responseUrl.searchParams.set("gcal", "connected");
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "google_calendar_oauth_callback",
        professional_id: profile.id
      }
    });

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "gcal_connect",
      entityType: "google_calendar_connections",
      result: "error",
      context: "audit_gcal_connect_error"
    });

    responseUrl.searchParams.set("gcal", "error");
  }

  return redirectToIntegrations();
}
