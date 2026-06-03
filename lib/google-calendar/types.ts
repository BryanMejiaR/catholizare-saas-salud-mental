export type GoogleCalendarConnectionStatus = "conectado" | "expirado" | "desconectado";

export type GoogleCalendarConnection = {
  id: string;
  professional_id: string;
  google_account_email: string;
  calendar_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string;
  connection_status: GoogleCalendarConnectionStatus;
  webhook_channel_id: string | null;
  webhook_resource_id: string | null;
  webhook_expires_at: string | null;
  last_sync_error: string | null;
  connected_at: string;
  disconnected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

export type GoogleCalendarEventResponse = {
  id: string;
  htmlLink?: string;
};
