import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";
import { buildPublicRequestUrl } from "@/lib/integrations/public-url";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const env = getPublicEnv();
  const redirectResponse = NextResponse.redirect(buildPublicRequestUrl(request, next));

  if (code) {
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options);
            });
          }
        }
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      Sentry.captureException(error, {
        extra: {
          context: "auth_callback_exchange_code"
        }
      });
      return NextResponse.redirect(buildPublicRequestUrl(request, "/auth/login"));
    }
  }

  return redirectResponse;
}
