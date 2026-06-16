insert into storage.buckets (id, name, public)
values ('assessment-submissions', 'assessment-submissions', false)
on conflict (id) do nothing;

do $$
begin
  create type public.patient_assessment_upload_status as enum (
    'recibida',
    'analizada',
    'vinculada',
    'rechazada'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.patient_assessment_uploads (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  assessment_code text not null,
  assessment_label text not null,
  file_storage_path text not null,
  file_name text not null,
  file_content_type text not null,
  file_size_bytes integer not null,
  status public.patient_assessment_upload_status not null default 'recibida',
  extracted_results jsonb not null default '{}'::jsonb,
  professional_notes text,
  ai_session_id uuid references public.ai_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_assessment_uploads_code_check
    check (assessment_code ~ '^[a-z0-9_]{2,80}$'),
  constraint patient_assessment_uploads_label_check
    check (length(trim(assessment_label)) between 2 and 120),
  constraint patient_assessment_uploads_file_size_check
    check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  constraint patient_assessment_uploads_results_object_check
    check (jsonb_typeof(extracted_results) = 'object')
);

create index if not exists patient_assessment_uploads_exp_idx
on public.patient_assessment_uploads(expediente_id, created_at desc);

create index if not exists patient_assessment_uploads_patient_idx
on public.patient_assessment_uploads(patient_id, created_at desc);

create index if not exists patient_assessment_uploads_professional_idx
on public.patient_assessment_uploads(professional_id, created_at desc);

create or replace function public.enforce_patient_assessment_upload_rules()
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
    raise exception 'Assessment upload ownership mismatch';
  end if;

  if expediente.status <> 'activo' then
    raise exception 'Assessment uploads require an active clinical record';
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id
       or new.expediente_id <> old.expediente_id
       or new.patient_id <> old.patient_id
       or new.professional_id <> old.professional_id
       or new.assessment_code <> old.assessment_code
       or new.assessment_label <> old.assessment_label
       or new.file_storage_path <> old.file_storage_path
       or new.file_name <> old.file_name
       or new.file_content_type <> old.file_content_type
       or new.file_size_bytes <> old.file_size_bytes
       or new.created_at <> old.created_at then
      raise exception 'Assessment upload identity and source fields are immutable';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists patient_assessment_uploads_enforce_rules
on public.patient_assessment_uploads;

create trigger patient_assessment_uploads_enforce_rules
before insert or update on public.patient_assessment_uploads
for each row execute function public.enforce_patient_assessment_upload_rules();

drop trigger if exists patient_assessment_uploads_touch_updated_at
on public.patient_assessment_uploads;

create trigger patient_assessment_uploads_touch_updated_at
before update on public.patient_assessment_uploads
for each row execute function public.touch_updated_at();

alter table public.patient_assessment_uploads enable row level security;

drop policy if exists "Patients can create own assessment uploads"
on public.patient_assessment_uploads;

create policy "Patients can create own assessment uploads"
on public.patient_assessment_uploads for insert to authenticated
with check (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

drop policy if exists "Patients can read own assessment uploads"
on public.patient_assessment_uploads;

create policy "Patients can read own assessment uploads"
on public.patient_assessment_uploads for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

drop policy if exists "Professionals can read own patient assessment uploads"
on public.patient_assessment_uploads;

create policy "Professionals can read own patient assessment uploads"
on public.patient_assessment_uploads for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

drop policy if exists "Professionals can update own patient assessment uploads"
on public.patient_assessment_uploads;

create policy "Professionals can update own patient assessment uploads"
on public.patient_assessment_uploads for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke delete on public.patient_assessment_uploads from authenticated, anon;
grant select, insert, update on public.patient_assessment_uploads to service_role;
