# GCAL-009 Technical Contract

## Scope

GCAL-009 adds an optional per-professional Google Calendar connection.

Implemented:

- OAuth start and callback routes.
- Encrypted access and refresh token storage.
- Professional integration status page at `/professional/integrations`.
- Disconnect flow with Google token revocation and logical status change.
- Catholizare to Google sync when appointments are created or cancelled.
- Failure isolation: appointment operations remain successful if Google Calendar fails.
- Provider requests use a 20 second timeout.

Pending:

- Google push notification webhook processing.
- Google Calendar to Catholizare updates.
- Conflict warning against existing Google events.
- Appointment edit sync, because appointment editing is not yet implemented in AGENDA-008.
- Distributed token refresh locking for multi-instance deployments. Current MVP serializes refresh
  inside one Node.js process.

## Database

Migration: `supabase/migrations/202605300001_google_calendar_connections.sql`

New enum:

- `public.gcal_connection_status`: `conectado`, `expirado`, `desconectado`

New table:

- `public.google_calendar_connections`

Important columns:

- `professional_id`: owner profile.
- `google_account_email`: connected Google account.
- `calendar_id`: currently `primary`.
- `access_token_encrypted`: encrypted OAuth access token.
- `refresh_token_encrypted`: encrypted OAuth refresh token.
- `token_expires_at`: access token expiration.
- `connection_status`: connection lifecycle.
- `webhook_channel_id`, `webhook_resource_id`, `webhook_expires_at`: reserved for webhooks.
- `last_sync_error`: latest provider-side sync failure.

## Permissions And RLS

`public.google_calendar_connections` has RLS enabled.

Policies:

- Professionals can read their own connection.
- Professionals can update their own connection.

Client insert and delete are revoked. Connection creation and token rotation happen through
server-only code with the Supabase service role.

## Token Security

OAuth tokens are encrypted before storage using AES-256-GCM.
Disconnecting Google Calendar attempts to revoke the refresh token with Google before the local
connection is marked as `desconectado`. If Google rejects the token or times out, the failure is
reported to Sentry and the local disconnect still completes so the professional is not trapped in a
stale connection.

Required variable when connecting Google Calendar:

- `INTEGRATION_TOKEN_ENCRYPTION_KEY`

Accepted key formats:

- 64-character hex string.
- Base64 value that decodes to 32 bytes.
- Raw 32-byte string for local development only.

The token encryption key must never be committed.

## Environment

Optional variables:

- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`
- `INTEGRATION_TOKEN_ENCRYPTION_KEY`

If Google variables are absent, the integration page remains available but the connect button is
disabled and appointment flows continue without Google sync.

## Routes

- `GET /api/integrations/google-calendar/start`
- `GET /api/integrations/google-calendar/callback`
- `/professional/integrations`

The OAuth start route stores a short-lived HTTP-only state cookie for CSRF protection. The callback
validates the state cookie before exchanging the authorization code.

## Appointment Sync

Creation:

- `createAppointmentAction` creates the local appointment first.
- If Google Calendar is connected, it creates a Google event.
- The returned Google event id is stored in `citas.google_calendar_event_id`.

Cancellation:

- `cancelAppointmentAction` cancels the local appointment first.
- If a Google event id exists, it patches the Google event status to `cancelled`.

Provider errors:

- Captured in Sentry.
- Written to audit logs as `gcal_event_sync` or `gcal_event_cancel`.
- Stored in `google_calendar_connections.last_sync_error`.
- Do not rollback the local appointment.

## Privacy Notes

Google Calendar events currently include the patient's full name in the event summary and
description. This is intentionally visible to the connected professional's Google account and must
be treated as a disclosure to an external provider. A future privacy setting can replace the title
with a pseudonym or neutral label.

## QA Checklist

- Apply migration `202605300001_google_calendar_connections.sql`.
- Add Google Calendar env vars only in `.env.local` or the deployment secret store.
- Confirm `/professional/integrations` loads without exposing tokens.
- Confirm connect button is disabled when Google env vars are missing.
- With Google env vars configured, complete OAuth and verify status `conectado`.
- Create a cita and confirm `google_calendar_event_id` is stored.
- Cancel that cita and confirm the Google event is marked cancelled.
- Disconnect and confirm new citas no longer attempt Google sync.
