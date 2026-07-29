import { createHash } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { writeAuthAuditLog } from "@/lib/auth/audit";
import { ACTIVE_SESSION_TOKEN_COOKIE, clearSessionPolicyCookies } from "@/lib/auth/session-policy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function hashActiveSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getForwardedHeaderValue(request: NextRequest, headerName: string) {
  return request.headers.get(headerName)?.split(",")[0]?.trim() || null;
}

function buildPublicRedirectUrl(request: NextRequest, pathname: string) {
  const forwardedHost = getForwardedHeaderValue(request, "x-forwarded-host");
  const forwardedProto = getForwardedHeaderValue(request, "x-forwarded-proto");
  const requestUrl = new URL(request.url);
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol =
    process.env.NODE_ENV === "production" && !isLocalHost
      ? "https"
      : forwardedProto || requestUrl.protocol.replace(":", "");

  return new URL(pathname, `${protocol}://${host}`);
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user) {
    const activeSessionToken = request.cookies.get(ACTIVE_SESSION_TOKEN_COOKIE)?.value;

    if (activeSessionToken) {
      const supabaseAdmin = createSupabaseAdminClient();
      await supabaseAdmin
        .from("profiles")
        .update({
          active_session_token_hash: null,
          active_session_started_at: null
        })
        .eq("id", user.id)
        .eq("active_session_token_hash", hashActiveSessionToken(activeSessionToken));
    }

    try {
      await writeAuthAuditLog({
        event: "logout",
        actorId: user.id,
        email: user.email,
        result: "success"
      });
    } catch (auditError) {
      Sentry.captureException(auditError, {
        extra: {
          context: "audit_write_on_logout_success",
          actor_id: user.id
        }
      });
    }
  }

  const response = NextResponse.redirect(buildPublicRedirectUrl(request, "/auth/login"), 303);
  clearSessionPolicyCookies(response);

  return response;
}
