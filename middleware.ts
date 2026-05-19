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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next({
      request
    });
  }

  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const role = user.app_metadata.role as UserRole | undefined;
  const accountStatus = user.app_metadata.account_status as string | undefined;

  if (
    role &&
    accountStatus &&
    accountStatus !== "activo" &&
    !pathname.startsWith("/auth/inactive") &&
    !pathname.startsWith("/api/auth/logout")
  ) {
    return NextResponse.redirect(new URL("/auth/inactive", request.url));
  }

  if (pathname.startsWith("/auth/login") && role) {
    return NextResponse.redirect(new URL(ROLE_HOME_PATH[role], request.url));
  }

  if (role) {
    const rolePrefix = ROLE_PREFIX[role];
    const isRoleArea =
      pathname.startsWith("/portal") ||
      pathname.startsWith("/professional") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/super-admin");

    if (isRoleArea && !pathname.startsWith(rolePrefix)) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATH[role], request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
