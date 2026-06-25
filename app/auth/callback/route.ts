import { NextResponse, type NextRequest } from "next/server";

import { buildPublicRequestUrl } from "@/lib/integrations/public-url";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  let supabaseResponse = NextResponse.next();

  if (code) {
    const { supabase, response } = createSupabaseMiddlewareClient(request);
    await supabase.auth.exchangeCodeForSession(code);
    supabaseResponse = response;
  }

  const redirectResponse = NextResponse.redirect(buildPublicRequestUrl(request, next));
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
