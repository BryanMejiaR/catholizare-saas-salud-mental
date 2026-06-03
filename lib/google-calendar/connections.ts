import "server-only";

import * as Sentry from "@sentry/nextjs";

import { decryptToken, encryptToken } from "@/lib/integrations/token-encryption";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  refreshGoogleCalendarAccessToken,
  getGoogleCalendarConfig
} from "@/lib/google-calendar/client";
import type { GoogleCalendarConnection } from "@/lib/google-calendar/types";

type UpsertGoogleConnectionInput = {
  professionalId: string;
  googleAccountEmail: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

const TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000;

export function isGoogleCalendarConfigured() {
  return getGoogleCalendarConfig() !== null;
}

export async function getGoogleCalendarConnection(professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("google_calendar_connections")
    .select("*")
    .eq("professional_id", professionalId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load Google Calendar connection: ${error.message}`);
  }

  return data as GoogleCalendarConnection | null;
}

export async function upsertGoogleCalendarConnection(input: UpsertGoogleConnectionInput) {
  const supabaseAdmin = createSupabaseAdminClient();
  const tokenExpiresAt = new Date(Date.now() + input.expiresIn * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("google_calendar_connections")
    .upsert(
      {
        professional_id: input.professionalId,
        google_account_email: input.googleAccountEmail,
        calendar_id: "primary",
        access_token_encrypted: encryptToken(input.accessToken),
        refresh_token_encrypted: encryptToken(input.refreshToken),
        token_expires_at: tokenExpiresAt,
        connection_status: "conectado",
        last_sync_error: null,
        disconnected_at: null,
        connected_at: new Date().toISOString()
      },
      {
        onConflict: "professional_id"
      }
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Unable to save Google Calendar connection: ${error?.message ?? "no id"}`);
  }

  return data.id as string;
}

export async function disconnectGoogleCalendarConnection(professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("google_calendar_connections")
    .update({
      connection_status: "desconectado",
      disconnected_at: new Date().toISOString(),
      last_sync_error: null
    })
    .eq("professional_id", professionalId);

  if (error) {
    throw new Error(`Unable to disconnect Google Calendar: ${error.message}`);
  }
}

export async function markGoogleCalendarConnectionError(professionalId: string, message: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("google_calendar_connections")
    .update({
      connection_status: "expirado",
      last_sync_error: message.slice(0, 1000)
    })
    .eq("professional_id", professionalId);

  if (error) {
    Sentry.captureException(error, {
      extra: {
        context: "google_calendar_mark_connection_error",
        professional_id: professionalId
      }
    });
  }
}

export async function getValidGoogleCalendarAccessToken(connection: GoogleCalendarConnection) {
  const expiresAt = new Date(connection.token_expires_at).getTime();

  if (expiresAt - TOKEN_REFRESH_SKEW_MS > Date.now()) {
    return decryptToken(connection.access_token_encrypted);
  }

  const refreshToken = decryptToken(connection.refresh_token_encrypted);
  const refreshed = await refreshGoogleCalendarAccessToken(refreshToken);
  const nextRefreshToken = refreshed.refresh_token ?? refreshToken;
  const tokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("google_calendar_connections")
    .update({
      access_token_encrypted: encryptToken(refreshed.access_token),
      refresh_token_encrypted: encryptToken(nextRefreshToken),
      token_expires_at: tokenExpiresAt,
      connection_status: "conectado",
      last_sync_error: null
    })
    .eq("id", connection.id);

  if (error) {
    throw new Error(`Unable to persist refreshed Google token: ${error.message}`);
  }

  return refreshed.access_token;
}
