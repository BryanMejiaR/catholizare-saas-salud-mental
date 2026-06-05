import "server-only";

import * as Sentry from "@sentry/nextjs";

import { decryptToken, encryptToken } from "@/lib/integrations/token-encryption";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getZoomConfig, refreshZoomAccessToken, revokeZoomOAuthToken } from "@/lib/zoom/client";
import type { ZoomConnection } from "@/lib/zoom/types";

type UpsertZoomConnectionInput = {
  professionalId: string;
  zoomUserId: string;
  zoomAccountEmail: string;
  apiBaseUrl: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

const TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000;
const refreshLocks = new Map<string, Promise<string>>();

export function isZoomConfigured() {
  return getZoomConfig() !== null;
}

export async function getZoomConnection(professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("zoom_connections")
    .select("*")
    .eq("professional_id", professionalId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load Zoom connection: ${error.message}`);
  }

  return data as ZoomConnection | null;
}

export async function upsertZoomConnection(input: UpsertZoomConnectionInput) {
  const supabaseAdmin = createSupabaseAdminClient();
  const tokenExpiresAt = new Date(Date.now() + input.expiresIn * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("zoom_connections")
    .upsert(
      {
        professional_id: input.professionalId,
        zoom_user_id: input.zoomUserId,
        zoom_account_email: input.zoomAccountEmail,
        api_base_url: input.apiBaseUrl,
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
    throw new Error(`Unable to save Zoom connection: ${error?.message ?? "no id"}`);
  }

  return data.id as string;
}

export async function disconnectZoomConnection(professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const connection = await getZoomConnection(professionalId);

  if (connection?.connection_status === "conectado") {
    try {
      const accessToken = decryptToken(connection.access_token_encrypted);
      await revokeZoomOAuthToken(accessToken);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: "zoom_token_revoke_on_disconnect",
          professional_id: professionalId
        }
      });
    }
  }

  const { error } = await supabaseAdmin
    .from("zoom_connections")
    .update({
      connection_status: "desconectado",
      disconnected_at: new Date().toISOString(),
      last_sync_error: null
    })
    .eq("professional_id", professionalId);

  if (error) {
    throw new Error(`Unable to disconnect Zoom: ${error.message}`);
  }
}

export async function markZoomConnectionError(professionalId: string, message: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("zoom_connections")
    .update({
      connection_status: "expirado",
      last_sync_error: message.slice(0, 1000)
    })
    .eq("professional_id", professionalId);

  if (error) {
    Sentry.captureException(error, {
      extra: {
        context: "zoom_mark_connection_error",
        professional_id: professionalId
      }
    });
  }
}

export async function getValidZoomAccessToken(connection: ZoomConnection) {
  const expiresAt = new Date(connection.token_expires_at).getTime();

  if (expiresAt - TOKEN_REFRESH_SKEW_MS > Date.now()) {
    return decryptToken(connection.access_token_encrypted);
  }

  const existingRefresh = refreshLocks.get(connection.id);

  if (existingRefresh) {
    return existingRefresh;
  }

  const refreshPromise = refreshAndPersistZoomAccessToken(connection).finally(() => {
    refreshLocks.delete(connection.id);
  });

  refreshLocks.set(connection.id, refreshPromise);

  return refreshPromise;
}

async function refreshAndPersistZoomAccessToken(connection: ZoomConnection) {
  const refreshToken = decryptToken(connection.refresh_token_encrypted);
  const refreshed = await refreshZoomAccessToken(refreshToken);
  const tokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("zoom_connections")
    .update({
      access_token_encrypted: encryptToken(refreshed.access_token),
      refresh_token_encrypted: encryptToken(refreshed.refresh_token),
      token_expires_at: tokenExpiresAt,
      api_base_url: refreshed.api_url ?? connection.api_base_url,
      connection_status: "conectado",
      last_sync_error: null
    })
    .eq("id", connection.id);

  if (error) {
    throw new Error(`Unable to persist refreshed Zoom token: ${error.message}`);
  }

  return refreshed.access_token;
}
