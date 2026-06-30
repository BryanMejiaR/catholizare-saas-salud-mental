import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { z } from "zod";

import {
  createInviteActivationToken,
  getInviteActivationCookieOptions,
  INVITE_ACTIVATION_COOKIE_NAME
} from "@/lib/auth/invite-activation-token";
import { getPublicEnv } from "@/lib/env";

const hashSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  next: z.string().min(1).optional()
});

function safeNextPath(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/auth/login";
}

export async function POST(request: NextRequest) {
  const parsed = hashSessionSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid session payload." }, { status: 400 });
  }

  const env = getPublicEnv();
  const redirectTo = safeNextPath(parsed.data.next);
  const response = NextResponse.json({ redirectTo });
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
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data, error } = await supabase.auth.setSession({
    access_token: parsed.data.accessToken,
    refresh_token: parsed.data.refreshToken
  });

  if (error || !data.user) {
    Sentry.captureException(error ?? new Error("Hash session did not return a user"), {
      extra: {
        context: "auth_hash_session_set_session"
      }
    });

    return NextResponse.json({ message: "Invalid auth session." }, { status: 401 });
  }

  response.cookies.set(
    INVITE_ACTIVATION_COOKIE_NAME,
    createInviteActivationToken(data.user.id),
    getInviteActivationCookieOptions()
  );

  console.info("[auth_hash_session] session cookies issued from URL fragment", {
    redirectTo
  });

  return response;
}
