import "server-only";

import type { NextRequest } from "next/server";

import { getServerEnv } from "@/lib/env";

function forceHttpsForPublicUrl(url: URL) {
  const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (process.env.NODE_ENV === "production" && !isLocalHost) {
    url.protocol = "https:";
  }

  return url;
}

export function getPublicAppUrl() {
  return forceHttpsForPublicUrl(new URL(getServerEnv().NEXT_PUBLIC_APP_URL));
}

function getForwardedHeaderValue(request: NextRequest, headerName: string) {
  return request.headers.get(headerName)?.split(",")[0]?.trim() || null;
}

export function buildPublicRequestUrl(request: NextRequest, pathname: string) {
  const requestUrl = new URL(request.url);
  const forwardedHost = getForwardedHeaderValue(request, "x-forwarded-host");
  const forwardedProto = getForwardedHeaderValue(request, "x-forwarded-proto");
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol =
    process.env.NODE_ENV === "production" && !isLocalHost
      ? "https"
      : forwardedProto || requestUrl.protocol.replace(":", "");

  return new URL(pathname, `${protocol}://${host}`);
}

export function buildPublicIntegrationCallback(pathname: string, configuredUrl?: string) {
  const baseUrl = configuredUrl ? new URL(configuredUrl) : new URL(pathname, getPublicAppUrl());
  const isLocalHost = baseUrl.hostname === "localhost" || baseUrl.hostname === "127.0.0.1";

  if (process.env.NODE_ENV === "production" && !isLocalHost) {
    baseUrl.protocol = "https:";
  }

  return baseUrl.toString();
}
