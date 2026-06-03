create type public.gcal_connection_status as enum (
  'conectado',
  'expirado',
  'desconectado'
);

create table public.google_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete restrict,
  google_account_email text not null,
  calendar_id text not null default 'primary',
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  token_expires_at timestamptz not null,
  connection_status public.gcal_connection_status not null default 'conectado',
  webhook_channel_id text,
  webhook_resource_id text,
  webhook_expires_at timestamptz,
  last_sync_error text,
  connected_at timestamptz not null default now(),
  disconnected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint google_calendar_connections_professional_unique unique (professional_id),
  constraint google_calendar_connections_disconnect_metadata check (
    connection_status <> 'desconectado'
    or disconnected_at is not null
  )
);

create index google_calendar_connections_status_idx
on public.google_calendar_connections(connection_status);

create trigger google_calendar_connections_touch_updated_at
before update on public.google_calendar_connections
for each row execute function public.touch_updated_at();

alter table public.google_calendar_connections enable row level security;

create policy "Professionals can read own Google Calendar connection"
on public.google_calendar_connections for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own Google Calendar connection"
on public.google_calendar_connections for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke insert, delete on public.google_calendar_connections from authenticated, anon;
