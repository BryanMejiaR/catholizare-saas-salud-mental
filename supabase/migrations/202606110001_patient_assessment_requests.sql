do $$
begin
  create type public.patient_assessment_request_status as enum (
    'pendiente',
    'subida',
    'cancelada'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.patient_assessment_requests (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  assessment_code text not null,
  assessment_label text not null,
  status public.patient_assessment_request_status not null default 'pendiente',
  requested_by uuid references public.profiles(id) on delete set null,
  requested_at timestamptz not null default now(),
  uploaded_at timestamptz,
  upload_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_assessment_requests_code_check
    check (assessment_code ~ '^[a-z0-9_]{2,80}$'),
  constraint patient_assessment_requests_label_check
    check (length(trim(assessment_label)) between 2 and 120)
);

alter table public.patient_assessment_uploads
  add column if not exists request_id uuid references public.patient_assessment_requests(id) on delete set null;

alter table public.patient_assessment_requests
  drop constraint if exists patient_assessment_requests_upload_id_fkey;

alter table public.patient_assessment_requests
  add constraint patient_assessment_requests_upload_id_fkey
  foreign key (upload_id) references public.patient_assessment_uploads(id) on delete set null;

create unique index if not exists patient_assessment_requests_pending_unique
on public.patient_assessment_requests(expediente_id, assessment_code)
where status = 'pendiente';

create unique index if not exists patient_assessment_uploads_request_unique
on public.patient_assessment_uploads(request_id)
where request_id is not null;

create index if not exists patient_assessment_requests_exp_idx
on public.patient_assessment_requests(expediente_id, created_at desc);

create index if not exists patient_assessment_requests_patient_idx
on public.patient_assessment_requests(patient_id, created_at desc);

create index if not exists patient_assessment_requests_professional_idx
on public.patient_assessment_requests(professional_id, created_at desc);

create or replace function public.enforce_patient_assessment_request_rules()
returns trigger
language plpgsql
as $$
declare
  expediente record;
begin
  select id, patient_id, professional_id, status
  into expediente
  from public.expedientes
  where id = new.expediente_id;

  if expediente.id is null then
    raise exception 'Clinical record does not exist';
  end if;

  if expediente.patient_id <> new.patient_id or expediente.professional_id <> new.professional_id then
    raise exception 'Assessment request ownership mismatch';
  end if;

  if expediente.status <> 'activo' then
    raise exception 'Assessment requests require an active clinical record';
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id
       or new.expediente_id <> old.expediente_id
       or new.patient_id <> old.patient_id
       or new.professional_id <> old.professional_id
       or new.assessment_code <> old.assessment_code
       or new.assessment_label <> old.assessment_label
       or new.requested_by is distinct from old.requested_by
       or new.requested_at <> old.requested_at
       or new.created_at <> old.created_at then
      raise exception 'Assessment request identity fields are immutable';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists patient_assessment_requests_enforce_rules
on public.patient_assessment_requests;

create trigger patient_assessment_requests_enforce_rules
before insert or update on public.patient_assessment_requests
for each row execute function public.enforce_patient_assessment_request_rules();

drop trigger if exists patient_assessment_requests_touch_updated_at
on public.patient_assessment_requests;

create trigger patient_assessment_requests_touch_updated_at
before update on public.patient_assessment_requests
for each row execute function public.touch_updated_at();

alter table public.patient_assessment_requests enable row level security;

drop policy if exists "Professionals can manage own assessment requests"
on public.patient_assessment_requests;

create policy "Professionals can manage own assessment requests"
on public.patient_assessment_requests for all to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

drop policy if exists "Patients can read own assessment requests"
on public.patient_assessment_requests;

create policy "Patients can read own assessment requests"
on public.patient_assessment_requests for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

revoke delete on public.patient_assessment_requests from authenticated, anon;
grant select, insert, update on public.patient_assessment_requests to service_role;
