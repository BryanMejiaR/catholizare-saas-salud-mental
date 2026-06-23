import "server-only";

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

export function buildPublicIntegrationCallback(pathname: string, configuredUrl?: string) {
  const baseUrl = configuredUrl ? new URL(configuredUrl) : new URL(pathname, getPublicAppUrl());
  const isLocalHost = baseUrl.hostname === "localhost" || baseUrl.hostname === "127.0.0.1";

  if (process.env.NODE_ENV === "production" && !isLocalHost) {
    baseUrl.protocol = "https:";
  }

  return baseUrl.toString();
}
