export type ZoomConnectionStatus = "conectado" | "expirado" | "desconectado";

export type ZoomConnection = {
  id: string;
  professional_id: string;
  zoom_user_id: string;
  zoom_account_email: string;
  api_base_url: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string;
  connection_status: ZoomConnectionStatus;
  last_sync_error: string | null;
  connected_at: string;
  disconnected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ZoomTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  api_url?: string;
};

export type ZoomUserResponse = {
  id: string;
  email: string;
};

export type ZoomMeetingResponse = {
  id: number;
  join_url: string;
  start_url: string;
};
