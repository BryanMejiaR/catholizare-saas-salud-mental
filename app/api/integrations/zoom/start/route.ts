import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth/profile";
import { getPublicEnv } from "@/lib/env";
import { buildZoomAuthUrl } from "@/lib/zoom/client";
import { isZoomConfigured } from "@/lib/zoom/connections";
import { ZOOM_STATE_COOKIE } from "@/lib/zoom/oauth-state";

export async function GET() {
  const env = getPublicEnv();
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return NextResponse.redirect(new URL("/auth/login", env.NEXT_PUBLIC_APP_URL));
  }

  if (!isZoomConfigured()) {
    return NextResponse.redirect(
      new URL("/professional/integrations?zoom=not_configured", env.NEXT_PUBLIC_APP_URL)
    );
  }

  const state = randomBytes(24).toString("hex");
  const authUrl = buildZoomAuthUrl(state);
  const response = NextResponse.redirect(authUrl);
  response.cookies.set(ZOOM_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/"
  });

  return response;
}
