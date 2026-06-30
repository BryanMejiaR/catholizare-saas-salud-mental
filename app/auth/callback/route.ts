import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import {
  createInviteActivationToken,
  getInviteActivationCookieOptions,
  INVITE_ACTIVATION_COOKIE_NAME
} from "@/lib/auth/invite-activation-token";
import { getPublicEnv } from "@/lib/env";
import { buildPublicRequestUrl } from "@/lib/integrations/public-url";

function renderHashSessionBridge(next: string) {
  const safeNext = JSON.stringify(next);

  return new NextResponse(
    `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <title>Activando sesion</title>
  </head>
  <body>
    <script>
      (async () => {
        const next = ${safeNext};
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (!accessToken || !refreshToken) {
          window.location.replace("/auth/login");
          return;
        }

        const response = await fetch("/auth/hash-session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ accessToken, refreshToken, next })
        });

        if (!response.ok) {
          window.location.replace("/auth/login");
          return;
        }

        const payload = await response.json().catch(() => ({ redirectTo: next }));
        window.location.replace(payload.redirectTo || next);
      })();
    </script>
  </body>
</html>`,
    {
      headers: {
        "cache-control": "no-store",
        "content-type": "text/html; charset=utf-8"
      }
    }
  );
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const env = getPublicEnv();
  const redirectResponse = NextResponse.redirect(buildPublicRequestUrl(request, next));

  if (!code) {
    return renderHashSessionBridge(next);
  }

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
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    Sentry.captureException(error, {
      extra: {
        context: "auth_callback_exchange_code"
      }
    });
    return NextResponse.redirect(buildPublicRequestUrl(request, "/auth/login"));
  }

  if (data.user) {
    redirectResponse.cookies.set(
      INVITE_ACTIVATION_COOKIE_NAME,
      createInviteActivationToken(data.user.id),
      getInviteActivationCookieOptions()
    );
    console.info("[auth_callback] invite activation cookie issued", {
      hasSupabaseSession: Boolean(data.session),
      redirectHost: buildPublicRequestUrl(request, next).host
    });
  }

  return redirectResponse;
}
