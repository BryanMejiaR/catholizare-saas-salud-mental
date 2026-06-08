create type public.pro_resource_status as enum (
  'activo',
  'inactivo'
);

create type public.pro_resource_type as enum (
  'enlace_externo',
  'articulo',
  'ficha',
  'guia',
  'video',
  'descargable',
  'pagina_profesionales',
  'pagina_mentoria',
  'formulario_externo',
  'evento_relacionado'
);

create type public.pro_banner_type as enum (
  'recurso_destacado',
  'evento_proximo',
  'mentoria_personalizada',
  'revision_casos',
  'contagio_fe',
  'reunion_clinica',
  'formacion',
  'anuncio_institucional',
  'actualizacion_plataforma',
  'buena_practica'
);

create type public.pro_event_status as enum (
  'programado',
  'cancelado',
  'finalizado'
);

create table public.pro_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  resource_type public.pro_resource_type not null,
  category text not null,
  url text not null,
  image_url text,
  tags text[] not null default '{}',
  status public.pro_resource_status not null default 'activo',
  featured boolean not null default false,
  display_sections text[] not null default '{resources}',
  visible_from timestamptz not null default now(),
  visible_until timestamptz,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pro_resources_url_check check (url ~* '^https?://'),
  constraint pro_resources_visibility_check check (
    visible_until is null or visible_until > visible_from
  )
);

create index pro_resources_visibility_idx
on public.pro_resources(status, visible_from, visible_until);

create index pro_resources_featured_idx
on public.pro_resources(featured, sort_order);

create table public.pro_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  banner_type public.pro_banner_type not null,
  cta_label text,
  cta_url text,
  image_url text,
  display_sections text[] not null default '{dashboard}',
  status public.pro_resource_status not null default 'activo',
  priority integer not null default 0,
  dismissible boolean not null default true,
  visible_from timestamptz not null default now(),
  visible_until timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pro_banners_cta_url_check check (cta_url is null or cta_url ~* '^https?://'),
  constraint pro_banners_visibility_check check (
    visible_until is null or visible_until > visible_from
  )
);

create index pro_banners_visibility_idx
on public.pro_banners(status, visible_from, visible_until);

create index pro_banners_priority_idx
on public.pro_banners(priority desc, created_at desc);

create table public.pro_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_type text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  modality text not null default 'online',
  info_url text,
  registration_url text,
  status public.pro_event_status not null default 'programado',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pro_events_info_url_check check (info_url is null or info_url ~* '^https?://'),
  constraint pro_events_registration_url_check check (
    registration_url is null or registration_url ~* '^https?://'
  ),
  constraint pro_events_time_check check (ends_at is null or ends_at > starts_at)
);

create index pro_events_upcoming_idx
on public.pro_events(status, starts_at);

create table public.pro_banner_dismissals (
  banner_id uuid not null references public.pro_banners(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key (banner_id, professional_id)
);

create trigger pro_resources_touch_updated_at
before update on public.pro_resources
for each row execute function public.touch_updated_at();

create trigger pro_banners_touch_updated_at
before update on public.pro_banners
for each row execute function public.touch_updated_at();

create trigger pro_events_touch_updated_at
before update on public.pro_events
for each row execute function public.touch_updated_at();

alter table public.pro_resources enable row level security;
alter table public.pro_banners enable row level security;
alter table public.pro_events enable row level security;
alter table public.pro_banner_dismissals enable row level security;

create policy "Professionals can read active Pro resources"
on public.pro_resources for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and status = 'activo'
  and visible_from <= now()
  and (visible_until is null or visible_until > now())
);

create policy "Administrators can manage Pro resources"
on public.pro_resources for all to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'))
with check (public.current_user_role() in ('administrador', 'super_administrador'));

create policy "Professionals can read active Pro banners"
on public.pro_banners for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and status = 'activo'
  and visible_from <= now()
  and (visible_until is null or visible_until > now())
);

create policy "Administrators can manage Pro banners"
on public.pro_banners for all to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'))
with check (public.current_user_role() in ('administrador', 'super_administrador'));

create policy "Professionals can read upcoming Pro events"
on public.pro_events for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and status = 'programado'
  and starts_at >= now()
);

create policy "Administrators can manage Pro events"
on public.pro_events for all to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'))
with check (public.current_user_role() in ('administrador', 'super_administrador'));

create policy "Professionals can read own Pro banner dismissals"
on public.pro_banner_dismissals for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own Pro banner dismissals"
on public.pro_banner_dismissals for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke delete on public.pro_resources from authenticated, anon;
revoke delete on public.pro_banners from authenticated, anon;
revoke delete on public.pro_events from authenticated, anon;
revoke update, delete on public.pro_banner_dismissals from authenticated, anon;
