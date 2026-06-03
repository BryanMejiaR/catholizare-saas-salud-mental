import "server-only";

import { getServerEnv } from "@/lib/env";
import type { GoogleCalendarEventResponse, GoogleTokenResponse } from "@/lib/google-calendar/types";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3";
const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events"
].join(" ");

type GoogleCalendarConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

type GoogleUserInfo = {
  email?: string;
};

type CalendarEventInput = {
  accessToken: string;
  calendarId: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  timeZone: string;
  zoomJoinUrl?: string | null;
};

export function getGoogleCalendarConfig(): GoogleCalendarConfig | null {
  const env = getServerEnv();

  if (
    !env.GOOGLE_CALENDAR_CLIENT_ID ||
    !env.GOOGLE_CALENDAR_CLIENT_SECRET ||
    !env.GOOGLE_CALENDAR_REDIRECT_URI
  ) {
    return null;
  }

  return {
    clientId: env.GOOGLE_CALENDAR_CLIENT_ID,
    clientSecret: env.GOOGLE_CALENDAR_CLIENT_SECRET,
    redirectUri: env.GOOGLE_CALENDAR_REDIRECT_URI
  };
}

export function buildGoogleCalendarAuthUrl(state: string) {
  const config = getGoogleCalendarConfig();

  if (!config) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_CALENDAR_SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  return url;
}

async function parseGoogleJson<T>(response: Response, context: string): Promise<T> {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    const error =
      payload && typeof payload === "object" && "error" in payload
        ? payload.error
        : response.statusText;
    throw new Error(`${context}: ${error ?? "Google API request failed"}`);
  }

  return payload as T;
}

export async function exchangeGoogleCalendarCode(code: string) {
  const config = getGoogleCalendarConfig();

  if (!config) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code"
    })
  });

  return parseGoogleJson<GoogleTokenResponse>(response, "google_calendar_token_exchange");
}

export async function refreshGoogleCalendarAccessToken(refreshToken: string) {
  const config = getGoogleCalendarConfig();

  if (!config) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token"
    })
  });

  return parseGoogleJson<GoogleTokenResponse>(response, "google_calendar_token_refresh");
}

export async function getGoogleCalendarUserEmail(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });
  const userInfo = await parseGoogleJson<GoogleUserInfo>(response, "google_calendar_userinfo");

  if (!userInfo.email) {
    throw new Error("Google account email was not returned.");
  }

  return userInfo.email;
}

export async function createGoogleCalendarEvent(input: CalendarEventInput) {
  const description = [input.description, input.zoomJoinUrl ? `Zoom: ${input.zoomJoinUrl}` : null]
    .filter(Boolean)
    .join("\n\n");

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(input.calendarId)}/events`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        summary: input.summary,
        description,
        start: {
          dateTime: input.start,
          timeZone: input.timeZone
        },
        end: {
          dateTime: input.end,
          timeZone: input.timeZone
        }
      })
    }
  );

  return parseGoogleJson<GoogleCalendarEventResponse>(response, "google_calendar_event_create");
}

export async function cancelGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
) {
  const response = await fetch(
    `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(
      eventId
    )}`,
    {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "cancelled"
      })
    }
  );

  if (!response.ok) {
    await parseGoogleJson(response, "google_calendar_event_cancel");
  }
}
