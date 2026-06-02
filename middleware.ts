import { NextResponse, type NextRequest } from "next/server";

import { ROLE_HOME_PATH, type UserRole } from "@/lib/auth/types";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/reset-password",
  "/auth/update-password",
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

function redirectWithSupabaseCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    if (isPublicPath) {
      return response;
    }

    return redirectWithSupabaseCookies(new URL("/auth/login", request.url), response);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();

    if (isPublicPath) {
      return response;
    }

    return redirectWithSupabaseCookies(new URL("/auth/login", request.url), response);
  }

  const role = profile.role as UserRole;
  const accountStatus = profile.account_status as string;

  if (role && accountStatus && accountStatus !== "activo" && !pathname.startsWith("/api/auth/logout")) {
    if (accountStatus === "pendiente_activacion" && !pathname.startsWith("/auth/activate")) {
      return redirectWithSupabaseCookies(new URL("/auth/activate", request.url), response);
    }

    if (accountStatus !== "pendiente_activacion" && !pathname.startsWith("/auth/inactive")) {
      return redirectWithSupabaseCookies(new URL("/auth/inactive", request.url), response);
    }
  }

  if (pathname.startsWith("/auth/login") && role) {
    return redirectWithSupabaseCookies(new URL(ROLE_HOME_PATH[role], request.url), response);
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
      return redirectWithSupabaseCookies(new URL(ROLE_HOME_PATH[role], request.url), response);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
