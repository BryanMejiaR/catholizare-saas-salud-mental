import "server-only";

import { getServerEnv } from "@/lib/env";
import { buildPublicIntegrationCallback } from "@/lib/integrations/public-url";
import type { ZoomMeetingResponse, ZoomTokenResponse, ZoomUserResponse } from "@/lib/zoom/types";

const ZOOM_AUTH_URL = "https://zoom.us/oauth/authorize";
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_REVOKE_URL = "https://zoom.us/oauth/revoke";
const ZOOM_DEFAULT_API_URL = "https://api.zoom.us";
const ZOOM_FETCH_TIMEOUT_MS = 20_000;
const ZOOM_SCOPES = ["meeting:write", "meeting:read", "user:read"].join(" ");

type ZoomConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

type ZoomMeetingInput = {
  accessToken: string;
  apiBaseUrl: string;
  topic: string;
  startTime: string;
  durationMinutes: number;
  timezone: string;
};

export function getZoomConfig(): ZoomConfig | null {
  const env = getServerEnv();

  if (!env.ZOOM_CLIENT_ID || !env.ZOOM_CLIENT_SECRET) {
    return null;
  }

  return {
    clientId: env.ZOOM_CLIENT_ID,
    clientSecret: env.ZOOM_CLIENT_SECRET,
    redirectUri: buildPublicIntegrationCallback(
      "/api/integrations/zoom/callback",
      env.ZOOM_REDIRECT_URI
    )
  };
}

function getZoomBasicAuthHeader(config: ZoomConfig) {
  return `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`;
}

export function buildZoomAuthUrl(state: string) {
  const config = getZoomConfig();

  if (!config) {
    throw new Error("Zoom OAuth is not configured.");
  }

  const url = new URL(ZOOM_AUTH_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", ZOOM_SCOPES);
  url.searchParams.set("state", state);

  return url;
}

async function fetchZoom(input: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ZOOM_FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseZoomJson<T>(response: Response, context: string): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | T
    | { reason?: string; message?: string; error?: string }
    | null;

  if (!response.ok) {
    const error =
      payload && typeof payload === "object"
        ? "reason" in payload
          ? payload.reason
          : "message" in payload
            ? payload.message
            : "error" in payload
              ? payload.error
              : response.statusText
        : response.statusText;
    throw new Error(`${context}: ${error ?? "Zoom API request failed"}`);
  }

  return payload as T;
}

export async function exchangeZoomCode(code: string) {
  const config = getZoomConfig();

  if (!config) {
    throw new Error("Zoom OAuth is not configured.");
  }

  const response = await fetchZoom(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      authorization: getZoomBasicAuthHeader(config),
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri
    })
  });

  return parseZoomJson<ZoomTokenResponse>(response, "zoom_token_exchange");
}

export async function refreshZoomAccessToken(refreshToken: string) {
  const config = getZoomConfig();

  if (!config) {
    throw new Error("Zoom OAuth is not configured.");
  }

  const response = await fetchZoom(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      authorization: getZoomBasicAuthHeader(config),
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  return parseZoomJson<ZoomTokenResponse>(response, "zoom_token_refresh");
}

export async function revokeZoomOAuthToken(token: string) {
  const config = getZoomConfig();

  if (!config) {
    throw new Error("Zoom OAuth is not configured.");
  }

  const response = await fetchZoom(ZOOM_REVOKE_URL, {
    method: "POST",
    headers: {
      authorization: getZoomBasicAuthHeader(config),
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      token
    })
  });

  if (!response.ok) {
    await parseZoomJson(response, "zoom_token_revoke");
  }
}

export async function getZoomUser(accessToken: string, apiBaseUrl = ZOOM_DEFAULT_API_URL) {
  const response = await fetchZoom(`${apiBaseUrl}/v2/users/me`, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  return parseZoomJson<ZoomUserResponse>(response, "zoom_user_me");
}

export async function createZoomMeeting(input: ZoomMeetingInput) {
  const response = await fetchZoom(`${input.apiBaseUrl}/v2/users/me/meetings`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      topic: input.topic,
      type: 2,
      start_time: input.startTime,
      duration: input.durationMinutes,
      timezone: input.timezone,
      settings: {
        join_before_host: false,
        waiting_room: true
      }
    })
  });

  return parseZoomJson<ZoomMeetingResponse>(response, "zoom_meeting_create");
}

export async function deleteZoomMeeting(accessToken: string, apiBaseUrl: string, meetingId: string) {
  const response = await fetchZoom(
    `${apiBaseUrl}/v2/meetings/${encodeURIComponent(meetingId)}`,
    {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok && response.status !== 404) {
    await parseZoomJson(response, "zoom_meeting_delete");
  }
}
