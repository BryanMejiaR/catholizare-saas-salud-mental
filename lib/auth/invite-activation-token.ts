import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { CookieOptions } from "@supabase/ssr";

import { getServerEnv } from "@/lib/env";

export const INVITE_ACTIVATION_COOKIE_NAME = "catholizare_invite_activation";

const INVITE_ACTIVATION_TTL_SECONDS = 15 * 60;

type InviteActivationPayload = {
  exp: number;
  userId: string;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getServerEnv().SUPABASE_SERVICE_ROLE_KEY)
    .update(value)
    .digest("base64url");
}

export function createInviteActivationToken(userId: string) {
  const payload: InviteActivationPayload = {
    exp: Math.floor(Date.now() / 1000) + INVITE_ACTIVATION_TTL_SECONDS,
    userId
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyInviteActivationToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as InviteActivationPayload;

    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getInviteActivationCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    maxAge: INVITE_ACTIVATION_TTL_SECONDS,
    path: "/auth",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  };
}

export function getExpiredInviteActivationCookieOptions(): CookieOptions {
  return {
    ...getInviteActivationCookieOptions(),
    maxAge: 0
  };
}
