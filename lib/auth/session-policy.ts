import { type NextResponse, type NextRequest } from "next/server";

export const SESSION_STARTED_AT_COOKIE = "catholizare_session_started_at";
export const SESSION_LAST_ACTIVITY_AT_COOKIE = "catholizare_session_last_activity_at";

export const SESSION_IDLE_TIMEOUT_MS = 20 * 60 * 1000;
export const SESSION_MAX_AGE_MS = 5 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;

export function readSessionTimestampCookie(request: NextRequest, name: string) {
  const value = Number(request.cookies.get(name)?.value);

  return Number.isFinite(value) && value > 0 ? value : null;
}

export function setSessionPolicyCookies(
  response: NextResponse,
  startedAt: number,
  lastActivityAt: number
) {
  const secure = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };

  response.cookies.set(SESSION_STARTED_AT_COOKIE, String(startedAt), options);
  response.cookies.set(SESSION_LAST_ACTIVITY_AT_COOKIE, String(lastActivityAt), options);
}

export function clearSessionPolicyCookies(response: NextResponse) {
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  };

  response.cookies.set(SESSION_STARTED_AT_COOKIE, "", options);
  response.cookies.set(SESSION_LAST_ACTIVITY_AT_COOKIE, "", options);
}
