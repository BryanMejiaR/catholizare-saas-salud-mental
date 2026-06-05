import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getPublicEnv } from "@/lib/env";
import { exchangeZoomCode, getZoomUser } from "@/lib/zoom/client";
import { upsertZoomConnection } from "@/lib/zoom/connections";
import { ZOOM_STATE_COOKIE } from "@/lib/zoom/oauth-state";

export async function GET(request: NextRequest) {
  const env = getPublicEnv();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(ZOOM_STATE_COOKIE)?.value;
  const profile = await getCurrentProfile();
  const responseUrl = new URL("/professional/integrations", env.NEXT_PUBLIC_APP_URL);

  function redirectToIntegrations() {
    const response = NextResponse.redirect(responseUrl);
    response.cookies.delete(ZOOM_STATE_COOKIE);
    return response;
  }

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return NextResponse.redirect(new URL("/auth/login", env.NEXT_PUBLIC_APP_URL));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    responseUrl.searchParams.set("zoom", "invalid_state");
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "zoom_connect",
      entityType: "zoom_connections",
      result: "denied",
      context: "audit_zoom_connect_invalid_state"
    });
    return redirectToIntegrations();
  }

  try {
    const tokens = await exchangeZoomCode(code);
    const apiBaseUrl = tokens.api_url ?? "https://api.zoom.us";
    const zoomUser = await getZoomUser(tokens.access_token, apiBaseUrl);
    const connectionId = await upsertZoomConnection({
      professionalId: profile.id,
      zoomUserId: zoomUser.id,
      zoomAccountEmail: zoomUser.email,
      apiBaseUrl,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "zoom_connect",
      entityType: "zoom_connections",
      entityId: connectionId,
      result: "success",
      metadata: {
        zoom_account_email: zoomUser.email
      },
      context: "audit_zoom_connect_success"
    });

    responseUrl.searchParams.set("zoom", "connected");
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "zoom_oauth_callback",
        professional_id: profile.id
      }
    });

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "zoom_connect",
      entityType: "zoom_connections",
      result: "error",
      context: "audit_zoom_connect_error"
    });

    responseUrl.searchParams.set("zoom", "error");
  }

  return redirectToIntegrations();
}
