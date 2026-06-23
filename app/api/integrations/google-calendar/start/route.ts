import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth/profile";
import { getPublicAppUrl } from "@/lib/integrations/public-url";
import { buildGoogleCalendarAuthUrl } from "@/lib/google-calendar/client";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar/connections";
import { GCAL_STATE_COOKIE } from "@/lib/google-calendar/oauth-state";

export async function GET() {
  const publicAppUrl = getPublicAppUrl();
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return NextResponse.redirect(new URL("/auth/login", publicAppUrl));
  }

  if (!isGoogleCalendarConfigured()) {
    return NextResponse.redirect(
      new URL("/professional/integrations?gcal=not_configured", publicAppUrl)
    );
  }

  const state = randomBytes(24).toString("hex");
  const authUrl = buildGoogleCalendarAuthUrl(state);
  const response = NextResponse.redirect(authUrl);
  response.cookies.set(GCAL_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/"
  });

  return response;
}
