import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import {
  ACTIVE_SESSION_TOKEN_COOKIE,
  SESSION_MAX_AGE_SECONDS
} from "@/lib/auth/session-policy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ProfileSessionUpdates = Record<string, unknown>;

function getActiveSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}

export function hashActiveSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueActiveSession(
  userId: string,
  profileUpdates: ProfileSessionUpdates = {}
) {
  const token = randomBytes(32).toString("base64url");
  const startedAt = new Date().toISOString();
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      ...profileUpdates,
      active_session_token_hash: hashActiveSessionToken(token),
      active_session_started_at: startedAt
    })
    .eq("id", userId)
    .select("id")
    .single();

  if (error) {
    throw new Error("Unable to persist the active session", { cause: error });
  }

  return { token, startedAt };
}

export async function setActiveSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_SESSION_TOKEN_COOKIE, token, getActiveSessionCookieOptions());
}

export function setActiveSessionCookieOnResponse(response: NextResponse, token: string) {
  response.cookies.set(ACTIVE_SESSION_TOKEN_COOKIE, token, getActiveSessionCookieOptions());
}
