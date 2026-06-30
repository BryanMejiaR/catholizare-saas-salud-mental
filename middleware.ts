import { NextResponse, type NextRequest } from "next/server";

import {
  clearSessionPolicyCookies,
  readSessionTimestampCookie,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_LAST_ACTIVITY_AT_COOKIE,
  SESSION_MAX_AGE_MS,
  SESSION_STARTED_AT_COOKIE,
  setSessionPolicyCookies
} from "@/lib/auth/session-policy";
import { ROLE_HOME_PATH, USER_ROLES, type UserRole } from "@/lib/auth/types";
import { getTrustedClientIp } from "@/lib/audit/request-context";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/reset-password",
  "/auth/update-password",
  "/auth/hash-session",
  "/auth/activate",
  "/auth/inactive",
  "/auth/callback"
];

const ROLE_PREFIX: Record<UserRole, string> = {
  paciente: "/portal",
  profesional: "/professional",
  administrador: "/admin",
  super_administrador: "/super-admin"
};

function isUserRole(role: string | null | undefined): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

function getSessionExpiryReason(
  request: NextRequest,
  now: number
): "idle_timeout" | "max_age" | "invalid_timestamp" | null {
  const startedAt = readSessionTimestampCookie(request, SESSION_STARTED_AT_COOKIE);
  const lastActivityAt = readSessionTimestampCookie(request, SESSION_LAST_ACTIVITY_AT_COOKIE);

  if (!startedAt || !lastActivityAt) {
    return null;
  }

  if (startedAt > now || lastActivityAt > now) {
    return "invalid_timestamp";
  }

  if (now - lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
    return "idle_timeout";
  }

  if (now - startedAt > SESSION_MAX_AGE_MS) {
    return "max_age";
  }

  return null;
}

function touchSessionPolicyCookies(request: NextRequest, response: NextResponse, now: number) {
  const startedAt = readSessionTimestampCookie(request, SESSION_STARTED_AT_COOKIE) ?? now;
  setSessionPolicyCookies(response, startedAt, now);
}

function redirectWithSupabaseCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

function getForwardedHeaderValue(request: NextRequest, headerName: string) {
  return request.headers.get(headerName)?.split(",")[0]?.trim() || null;
}

function buildPublicRedirectUrl(request: NextRequest, pathname: string) {
  const forwardedHost = getForwardedHeaderValue(request, "x-forwarded-host");
  const forwardedProto = getForwardedHeaderValue(request, "x-forwarded-proto");
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol =
    process.env.NODE_ENV === "production" && !isLocalHost
      ? "https"
      : forwardedProto || request.nextUrl.protocol.replace(":", "");

  return new URL(pathname, `${protocol}://${host}`);
}

async function writeSessionExpiredAudit(
  supabase: Awaited<ReturnType<typeof createSupabaseMiddlewareClient>>["supabase"],
  request: NextRequest,
  reason: "idle_timeout" | "max_age" | "invalid_timestamp"
) {
  await supabase.rpc("record_session_expired_auth_audit", {
    p_reason: reason,
    p_ip_address: getTrustedClientIp(request.headers) ?? null,
    p_user_agent: request.headers.get("user-agent")
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const now = Date.now();
  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    clearSessionPolicyCookies(response);

    if (isPublicPath) {
      return response;
    }

    return redirectWithSupabaseCookies(buildPublicRedirectUrl(request, "/auth/login"), response);
  }

  const sessionExpiryReason = getSessionExpiryReason(request, now);

  if (sessionExpiryReason) {
    try {
      await writeSessionExpiredAudit(supabase, request, sessionExpiryReason);
    } catch {
      // Session expiry must not be blocked by audit availability.
    }

    await supabase.auth.signOut();
    clearSessionPolicyCookies(response);

    return redirectWithSupabaseCookies(buildPublicRedirectUrl(request, "/auth/login"), response);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return response;
  }

  if (!profile) {
    await supabase.auth.signOut();
    clearSessionPolicyCookies(response);

    if (isPublicPath) {
      return response;
    }

    return redirectWithSupabaseCookies(buildPublicRedirectUrl(request, "/auth/login"), response);
  }

  touchSessionPolicyCookies(request, response, now);

  if (!isUserRole(profile.role)) {
    await supabase.auth.signOut();
    clearSessionPolicyCookies(response);

    return redirectWithSupabaseCookies(new URL("/auth/login", request.url), response);
  }

  const role = profile.role;
  const accountStatus = profile.account_status as string;

  if (role && accountStatus && accountStatus !== "activo" && !pathname.startsWith("/api/auth/logout")) {
    const isActivationPath =
      pathname.startsWith("/auth/activate") ||
      pathname.startsWith("/auth/update-password") ||
      pathname.startsWith("/auth/callback");

    if (accountStatus === "pendiente_activacion" && !isActivationPath) {
      return redirectWithSupabaseCookies(buildPublicRedirectUrl(request, "/auth/activate"), response);
    }

    if (accountStatus !== "pendiente_activacion" && !pathname.startsWith("/auth/inactive")) {
      return redirectWithSupabaseCookies(buildPublicRedirectUrl(request, "/auth/inactive"), response);
    }
  }

  if (pathname.startsWith("/auth/login") && role) {
    return redirectWithSupabaseCookies(
      buildPublicRedirectUrl(request, ROLE_HOME_PATH[role]),
      response
    );
  }

  if (isPublicPath) {
    return response;
  }

  if (role) {
    const rolePrefix = ROLE_PREFIX[role];
    const isRoleArea =
      pathname.startsWith("/portal") ||
      pathname.startsWith("/professional") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/super-admin");

    if (isRoleArea && !pathname.startsWith(rolePrefix)) {
      return redirectWithSupabaseCookies(
        buildPublicRedirectUrl(request, ROLE_HOME_PATH[role]),
        response
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
