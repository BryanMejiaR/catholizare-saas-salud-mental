create type public.zoom_connection_status as enum (
  'conectado',
  'expirado',
  'desconectado'
);

create table public.zoom_connections (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete restrict,
  zoom_user_id text not null,
  zoom_account_email text not null,
  api_base_url text not null default 'https://api.zoom.us',
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  token_expires_at timestamptz not null,
  connection_status public.zoom_connection_status not null default 'conectado',
  last_sync_error text,
  connected_at timestamptz not null default now(),
  disconnected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint zoom_connections_professional_unique unique (professional_id),
  constraint zoom_connections_disconnect_metadata check (
    connection_status <> 'desconectado'
    or disconnected_at is not null
  )
);

create index zoom_connections_status_idx
on public.zoom_connections(connection_status);

create trigger zoom_connections_touch_updated_at
before update on public.zoom_connections
for each row execute function public.touch_updated_at();

alter table public.zoom_connections enable row level security;

create policy "Professionals can read own Zoom connection"
on public.zoom_connections for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own Zoom connection"
on public.zoom_connections for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke insert, delete on public.zoom_connections from authenticated, anon;
