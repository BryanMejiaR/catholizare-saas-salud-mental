insert into storage.buckets (id, name, public)
values ('announcement-assets', 'announcement-assets', true)
on conflict (id) do update set public = excluded.public;

alter table public.pro_resources
  add column if not exists image_storage_path text;

alter table public.pro_banners
  add column if not exists image_storage_path text;

alter table public.pro_events
  add column if not exists image_url text,
  add column if not exists image_storage_path text;

create table if not exists public.patient_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  resource_type text not null default 'anuncio',
  category text not null default 'Portal del paciente',
  url text not null,
  image_url text,
  image_storage_path text,
  tags text[] not null default '{}',
  status public.pro_resource_status not null default 'activo',
  featured boolean not null default false,
  display_sections text[] not null default '{portal}',
  visible_from timestamptz not null default now(),
  visible_until timestamptz,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_resources_url_check check (url ~* '^https?://'),
  constraint patient_resources_visibility_check check (
    visible_until is null or visible_until > visible_from
  )
);

create table if not exists public.patient_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  banner_type text not null default 'anuncio_institucional',
  cta_label text,
  cta_url text,
  image_url text,
  image_storage_path text,
  display_sections text[] not null default '{portal}',
  status public.pro_resource_status not null default 'activo',
  priority integer not null default 0,
  dismissible boolean not null default true,
  visible_from timestamptz not null default now(),
  visible_until timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_banners_cta_url_check check (cta_url is null or cta_url ~* '^https?://'),
  constraint patient_banners_visibility_check check (
    visible_until is null or visible_until > visible_from
  )
);

create table if not exists public.patient_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_type text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  modality text not null default 'online',
  info_url text,
  registration_url text,
  image_url text,
  image_storage_path text,
  status public.pro_event_status not null default 'programado',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_events_info_url_check check (info_url is null or info_url ~* '^https?://'),
  constraint patient_events_registration_url_check check (
    registration_url is null or registration_url ~* '^https?://'
  ),
  constraint patient_events_time_check check (ends_at is null or ends_at > starts_at)
);

create index if not exists patient_resources_visibility_idx
on public.patient_resources(status, visible_from, visible_until);

create index if not exists patient_banners_visibility_idx
on public.patient_banners(status, visible_from, visible_until);

create index if not exists patient_events_upcoming_idx
on public.patient_events(status, starts_at);

drop trigger if exists patient_resources_touch_updated_at on public.patient_resources;
create trigger patient_resources_touch_updated_at
before update on public.patient_resources
for each row execute function public.touch_updated_at();

drop trigger if exists patient_banners_touch_updated_at on public.patient_banners;
create trigger patient_banners_touch_updated_at
before update on public.patient_banners
for each row execute function public.touch_updated_at();

drop trigger if exists patient_events_touch_updated_at on public.patient_events;
create trigger patient_events_touch_updated_at
before update on public.patient_events
for each row execute function public.touch_updated_at();

alter table public.patient_resources enable row level security;
alter table public.patient_banners enable row level security;
alter table public.patient_events enable row level security;

drop policy if exists "Patients can read active patient resources" on public.patient_resources;
create policy "Patients can read active patient resources"
on public.patient_resources for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and status = 'activo'
  and visible_from <= now()
  and (visible_until is null or visible_until > now())
);

drop policy if exists "Administrators can manage patient resources" on public.patient_resources;
create policy "Administrators can manage patient resources"
on public.patient_resources for all to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'))
with check (public.current_user_role() in ('administrador', 'super_administrador'));

drop policy if exists "Patients can read active patient banners" on public.patient_banners;
create policy "Patients can read active patient banners"
on public.patient_banners for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and status = 'activo'
  and visible_from <= now()
  and (visible_until is null or visible_until > now())
);

drop policy if exists "Administrators can manage patient banners" on public.patient_banners;
create policy "Administrators can manage patient banners"
on public.patient_banners for all to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'))
with check (public.current_user_role() in ('administrador', 'super_administrador'));

drop policy if exists "Patients can read upcoming patient events" on public.patient_events;
create policy "Patients can read upcoming patient events"
on public.patient_events for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and status = 'programado'
  and starts_at >= now()
);

drop policy if exists "Administrators can manage patient events" on public.patient_events;
create policy "Administrators can manage patient events"
on public.patient_events for all to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'))
with check (public.current_user_role() in ('administrador', 'super_administrador'));

revoke delete on public.patient_resources from authenticated, anon;
revoke delete on public.patient_banners from authenticated, anon;
revoke delete on public.patient_events from authenticated, anon;
