# ZOOM-010 Technical Contract

## Scope

ZOOM-010 adds an optional per-professional Zoom connection.

Implemented:

- OAuth start and callback routes.
- Encrypted access and refresh token storage.
- Zoom integration status in `/professional/integrations`.
- Disconnect flow with token revocation attempt and logical status change.
- Zoom meeting creation for `videollamada` appointments.
- Zoom meeting cancellation when the appointment is cancelled.
- Failure isolation: appointment operations remain successful if Zoom fails.

Pending:

- Appointment edit sync, because appointment editing is not yet implemented in AGENDA-008.
- Patient portal display window for the participant join URL in PORTAL-011.
- Manual fallback URL field when Zoom is not connected.

## Database

Migration: `supabase/migrations/202605310001_zoom_connections.sql`

New enum:

- `public.zoom_connection_status`: `conectado`, `expirado`, `desconectado`

New table:

- `public.zoom_connections`

Important columns:

- `professional_id`: owner profile.
- `zoom_user_id`: connected Zoom user id.
- `zoom_account_email`: connected Zoom account email.
- `api_base_url`: API base returned by Zoom, default `https://api.zoom.us`.
- `access_token_encrypted`: encrypted OAuth access token.
- `refresh_token_encrypted`: encrypted OAuth refresh token.
- `token_expires_at`: access token expiration.
- `connection_status`: connection lifecycle.
- `last_sync_error`: latest provider-side sync failure.

Existing appointment fields used:

- `citas.zoom_meeting_id`
- `citas.zoom_join_url`
- `citas.zoom_start_url`

## Permissions And RLS

`public.zoom_connections` has RLS enabled.

Policies:

- Professionals can read their own connection.
- Professionals can update their own connection.

Client insert and delete are revoked. Connection creation and token rotation happen through
server-only code with the Supabase service role.

## Token Security

OAuth tokens are encrypted before storage using AES-256-GCM through the shared integration token
encryption helper.

Required variable when connecting Zoom:

- `INTEGRATION_TOKEN_ENCRYPTION_KEY`

Disconnecting Zoom attempts to revoke the access token with Zoom before the local connection is
marked as `desconectado`. If Zoom rejects the token or times out, the failure is reported to Sentry
and the local disconnect still completes.

## Environment

Optional variables:

- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`
- `ZOOM_REDIRECT_URI`
- `INTEGRATION_TOKEN_ENCRYPTION_KEY`

If Zoom variables are absent, the integration page remains available but the connect button is
disabled and appointment flows continue without Zoom meeting creation.

## Routes

- `GET /api/integrations/zoom/start`
- `GET /api/integrations/zoom/callback`
- `/professional/integrations`

The OAuth start route stores a short-lived HTTP-only state cookie for CSRF protection. The callback
validates the state cookie before exchanging the authorization code.

## Appointment Sync

Creation:

- `createAppointmentAction` creates the local appointment first.
- If the appointment type is `videollamada` and Zoom is connected, it creates a scheduled Zoom
  meeting.
- The Zoom meeting id, participant URL, and host start URL are stored on `citas`.
- Google Calendar sync receives the participant URL when Zoom creation succeeds.

Cancellation:

- `cancelAppointmentAction` cancels the local appointment first.
- If a Zoom meeting id exists, the Zoom meeting is deleted.

Provider errors:

- Captured in Sentry.
- Written to audit logs as `zoom_meeting_sync` or `zoom_meeting_cancel`.
- Stored in `zoom_connections.last_sync_error`.
- Do not rollback the local appointment.

## Privacy Notes

Zoom meeting topics are neutral: `Cita Catholizare`. Patient names are not sent to Zoom in the
meeting topic. `zoom_start_url` is host-sensitive and must only be displayed to the professional.
`zoom_join_url` is the participant link that PORTAL-011 may expose to the authenticated patient
inside the allowed access window.

## QA Checklist

- Apply migration `202605310001_zoom_connections.sql`.
- Add Zoom env vars only in `.env.local` or the deployment secret store.
- Confirm `/professional/integrations` loads without exposing tokens.
- Confirm Zoom connect button is disabled when Zoom env vars are missing.
- With Zoom env vars configured, complete OAuth and verify status `conectado`.
- Create a `videollamada` appointment and confirm Zoom fields are stored on `citas`.
- Confirm Google Calendar event includes the Zoom participant URL when both integrations are
  connected.
- Cancel that appointment and confirm Zoom meeting deletion is attempted while local cancellation
  remains successful.
- Disconnect Zoom and confirm new `videollamada` appointments no longer attempt Zoom creation.
