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

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete restrict,
  role public.user_role not null,
  account_status public.account_status not null default 'pendiente_activacion',
  full_name text not null,
  email citext not null unique,
  primary_professional_id uuid references public.profiles(id) on delete restrict,
  assigned_professional_ids uuid[] not null default '{}',
  last_login_at timestamptz,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_patient_assignment_limit check (array_length(assigned_professional_ids, 1) is null or array_length(assigned_professional_ids, 1) <= 3),
  constraint profiles_patient_fields check (
    role = 'paciente'
    or (
      primary_professional_id is null
      and assigned_professional_ids = '{}'
    )
  ),
  constraint profiles_super_admin_org check (
    role <> 'super_administrador'
    or organization_id is null
  ),
  constraint profiles_non_super_admin_org check (
    role = 'super_administrador'
    or organization_id is not null
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

create index profiles_organization_id_idx on public.profiles(organization_id);
create index profiles_role_idx on public.profiles(role);
create index profiles_account_status_idx on public.profiles(account_status);
create index auth_audit_logs_actor_id_idx on public.auth_audit_logs(actor_id);
create index auth_audit_logs_created_at_idx on public.auth_audit_logs(created_at desc);
create index auth_audit_logs_event_idx on public.auth_audit_logs(event);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.auth_audit_logs enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'role', '')::public.user_role
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'organization_id', '')::uuid
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

create trigger organizations_touch_updated_at
before update on public.organizations
for each row execute function public.touch_updated_at();

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create policy "Super administrators can read organizations"
on public.organizations
for select
to authenticated
using (public.current_user_role() = 'super_administrador');

create policy "Organization members can read their own organization"
on public.organizations
for select
to authenticated
using (id = public.current_organization_id());

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Administrators can read non-clinical profiles in their organization"
on public.profiles
for select
to authenticated
using (
  public.current_user_role() = 'administrador'
  and organization_id = public.current_organization_id()
);

create policy "Super administrators can read profiles"
on public.profiles
for select
to authenticated
using (public.current_user_role() = 'super_administrador');

create policy "Users can insert their own auth audit event"
on public.auth_audit_logs
for insert
to authenticated
with check (actor_id = auth.uid());

create policy "Super administrators can read audit logs"
on public.auth_audit_logs
for select
to authenticated
using (public.current_user_role() = 'super_administrador');

revoke update, delete on public.auth_audit_logs from authenticated;
revoke update, delete on public.auth_audit_logs from anon;
