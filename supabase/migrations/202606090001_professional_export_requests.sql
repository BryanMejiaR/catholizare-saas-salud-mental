do $$
begin
  create type public.professional_export_request_status as enum (
    'solicitada',
    'aprobada',
    'rechazada',
    'expirada',
    'descargada'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.professional_export_requests (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  status public.professional_export_request_status not null default 'solicitada',
  reason text not null,
  requested_at timestamptz not null default now(),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  rejected_by uuid references public.profiles(id) on delete set null,
  rejected_at timestamptz,
  rejection_reason text,
  approval_token_hash text unique,
  token_expires_at timestamptz,
  acceptance_folio text unique,
  accepted_at timestamptz,
  acceptance_full_name text,
  acceptance_email text,
  acceptance_phone text,
  acceptance_rfc text,
  acceptance_ip inet,
  acceptance_user_agent text,
  acceptance_method text,
  acceptance_document_hash text,
  acceptance_session_reference text,
  mfa_code_required boolean not null default false,
  mfa_provider text,
  downloaded_at timestamptz,
  download_ip inet,
  download_user_agent text,
  download_session_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_export_reason_length check (length(trim(reason)) between 10 and 2000),
  constraint professional_export_acceptance_method_length check (
    acceptance_method is null or length(trim(acceptance_method)) between 5 and 120
  )
);

create index if not exists professional_export_requests_professional_idx
on public.professional_export_requests(professional_id, created_at desc);

create index if not exists professional_export_requests_status_idx
on public.professional_export_requests(status, created_at desc);

drop trigger if exists professional_export_requests_touch_updated_at
on public.professional_export_requests;

create trigger professional_export_requests_touch_updated_at
before update on public.professional_export_requests
for each row execute function public.touch_updated_at();

alter table public.professional_export_requests enable row level security;

drop policy if exists "Professionals can read own export requests"
on public.professional_export_requests;

create policy "Professionals can read own export requests"
on public.professional_export_requests for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

drop policy if exists "Professionals can create own export requests"
on public.professional_export_requests;

create policy "Professionals can create own export requests"
on public.professional_export_requests for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

drop policy if exists "Super administrators can read export requests"
on public.professional_export_requests;

create policy "Super administrators can read export requests"
on public.professional_export_requests for select to authenticated
using (public.current_user_role() = 'super_administrador');

drop policy if exists "Super administrators can update export requests"
on public.professional_export_requests;

create policy "Super administrators can update export requests"
on public.professional_export_requests for update to authenticated
using (public.current_user_role() = 'super_administrador')
with check (public.current_user_role() = 'super_administrador');

revoke delete on public.professional_export_requests from authenticated, anon;
grant select, insert, update on public.professional_export_requests to service_role;
