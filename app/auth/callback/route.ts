import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

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
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      Sentry.captureException(error, {
        extra: {
          context: "auth_callback_exchange_code"
        }
      });
      return NextResponse.redirect(buildPublicRequestUrl(request, "/auth/login"));
    }

    supabaseResponse = response;
  }

  const redirectResponse = NextResponse.redirect(buildPublicRequestUrl(request, next));
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
