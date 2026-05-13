create extension if not exists citext with schema public;
create extension if not exists pgcrypto with schema public;

create type public.user_role as enum (
  'paciente',
  'profesional',
  'administrador',
  'super_administrador'
);

create type public.account_status as enum (
  'activo',
  'inactivo',
  'bloqueado',
  'pendiente_activacion'
);

create type public.auth_audit_event as enum (
  'login_success',
  'login_failed',
  'logout',
  'password_reset_requested',
  'password_changed'
);

create type public.audit_result as enum (
  'success',
  'failure'
);

-- No existe tabla organizations (ver D-12 en docs/decisions-log.md).
-- Los Profesionales son cuentas individuales; el Administrador es un rol de plataforma.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  role public.user_role not null,
  account_status public.account_status not null default 'pendiente_activacion',
  full_name text not null,
  email citext not null unique,
  assigned_professional_ids uuid[] not null default '{}',
  last_login_at timestamptz,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_patient_assignment_limit check (
    array_length(assigned_professional_ids, 1) is null
    or array_length(assigned_professional_ids, 1) <= 3
  ),
  constraint profiles_patient_fields check (
    role = 'paciente'
    or assigned_professional_ids = '{}'
  )
);

create table public.auth_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  event public.auth_audit_event not null,
  email citext,
  result public.audit_result not null,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_account_status_idx on public.profiles(account_status);
create index auth_audit_logs_actor_id_idx on public.auth_audit_logs(actor_id);
create index auth_audit_logs_created_at_idx on public.auth_audit_logs(created_at desc);
create index auth_audit_logs_event_idx on public.auth_audit_logs(event);

alter table public.profiles enable row level security;
alter table public.auth_audit_logs enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'role', '')::public.user_role
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

-- Profesional: solo su propio perfil
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- Administrador: lee todos los perfiles (sin datos clínicos — enforced en app layer)
create policy "Administrators can read all profiles"
on public.profiles
for select
to authenticated
using (public.current_user_role() = 'administrador');

-- Super Administrador: acceso completo
create policy "Super administrators can read profiles"
on public.profiles
for select
to authenticated
using (public.current_user_role() = 'super_administrador');

-- Audit logs: solo escritura vía service role (admin client en el servidor)
-- No se permite INSERT desde el cliente autenticado para evitar eventos arbitrarios
create policy "Super administrators can read audit logs"
on public.auth_audit_logs
for select
to authenticated
using (public.current_user_role() = 'super_administrador');

-- Append-only: se revoca UPDATE y DELETE para todos los roles
revoke update, delete on public.auth_audit_logs from authenticated;
revoke update, delete on public.auth_audit_logs from anon;
