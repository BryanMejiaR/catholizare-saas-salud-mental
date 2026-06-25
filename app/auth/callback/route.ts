import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const env = getPublicEnv();
  let supabaseResponse = NextResponse.next();

  if (code) {
    const { supabase, response } = createSupabaseMiddlewareClient(request);
    await supabase.auth.exchangeCodeForSession(code);
    supabaseResponse = response;
  }

  const redirectResponse = NextResponse.redirect(new URL(next, env.NEXT_PUBLIC_APP_URL));
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
