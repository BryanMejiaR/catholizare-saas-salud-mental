create type public.expediente_status as enum (
  'activo',
  'archivado',
  'bloqueado'
);

create type public.consentimiento_status as enum (
  'pendiente',
  'firmado_fisico',
  'firmado_digital',
  'excepcion_justificada'
);

create type public.consentimiento_modality as enum (
  'pendiente',
  'fisico',
  'digital'
);

create type public.patient_summary_status as enum (
  'no_publicado',
  'publicado',
  'despublicado'
);

create type public.patient_summary_source as enum (
  'manual',
  'ia_asistida'
);

create table public.expedientes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  identification_data jsonb not null default '{}',
  initial_consultation_reason text,
  clinical_status text,
  consent_status public.consentimiento_status not null default 'pendiente',
  patient_summary_status public.patient_summary_status not null default 'no_publicado',
  patient_summary_source public.patient_summary_source,
  patient_summary text,
  patient_summary_approved_by_professional_id uuid references public.profiles(id) on delete set null,
  status public.expediente_status not null default 'activo',
  session_notes_count integer not null default 0 check (session_notes_count >= 0),
  assessments_count integer not null default 0 check (assessments_count >= 0),
  documents_count integer not null default 0 check (documents_count >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  last_clinical_activity_at timestamptz not null default now(),
  constraint expedientes_patient_role_check check (patient_id <> professional_id)
);

create unique index expedientes_active_patient_professional_idx
on public.expedientes(patient_id, professional_id)
where status = 'activo';

create index expedientes_professional_id_idx on public.expedientes(professional_id);
create index expedientes_patient_id_idx on public.expedientes(patient_id);
create index expedientes_status_idx on public.expedientes(status);
create index expedientes_last_activity_idx on public.expedientes(last_clinical_activity_at desc);

create table public.historias_clinicas (
  expediente_id uuid primary key references public.expedientes(id) on delete restrict,
  motivo_consulta text,
  historia_problema_actual text,
  antecedentes_psicologicos text,
  antecedentes_psiquiatricos text,
  antecedentes_medicos text,
  antecedentes_familiares text,
  antecedentes_tratamiento text,
  antecedentes_medicacion text,
  contexto_familiar text,
  contexto_relacional text,
  contexto_laboral_academico text,
  contexto_espiritual_religioso text,
  factores_riesgo text,
  factores_protectores text,
  recursos_personales text,
  observaciones_clinicas_iniciales text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consentimientos (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  status public.consentimiento_status not null default 'pendiente',
  signed_at date,
  modality public.consentimiento_modality not null default 'pendiente',
  obtained_by_professional_id uuid references public.profiles(id) on delete set null,
  document_reference text,
  document_uploaded_at timestamptz,
  registered_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index consentimientos_expediente_id_idx on public.consentimientos(expediente_id);
create index consentimientos_status_idx on public.consentimientos(status);

create table public.resumenes_terapeuticos (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  status public.patient_summary_status not null default 'no_publicado',
  source public.patient_summary_source not null default 'manual',
  content text not null,
  approved_by_professional_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  unpublished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resumenes_terapeuticos_expediente_id_idx on public.resumenes_terapeuticos(expediente_id);
create index resumenes_terapeuticos_status_idx on public.resumenes_terapeuticos(status);

create or replace function public.is_professional_assigned_to_patient(
  professional_profile_id uuid,
  patient_profile_id uuid
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles patient
    where patient.id = patient_profile_id
      and patient.role = 'paciente'
      and professional_profile_id = any(patient.assigned_professional_ids)
  )
$$;

create or replace function public.enforce_expediente_create_rules()
returns trigger
language plpgsql
as $$
declare
  active_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(new.patient_id::text));

  if not public.is_professional_assigned_to_patient(new.professional_id, new.patient_id) then
    raise exception 'Professional is not assigned to patient';
  end if;

  select count(*)
  into active_count
  from public.expedientes
  where patient_id = new.patient_id
    and status = 'activo';

  if new.status = 'activo' and active_count >= 3 then
    raise exception 'Patient already has the maximum number of active clinical records';
  end if;

  return new;
end;
$$;

create trigger expedientes_enforce_create_rules
before insert on public.expedientes
for each row execute function public.enforce_expediente_create_rules();

create or replace function public.enforce_expediente_update_rules()
returns trigger
language plpgsql
as $$
declare
  active_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(new.patient_id::text));

  if new.patient_id <> old.patient_id or new.professional_id <> old.professional_id then
    raise exception 'Clinical record ownership cannot be changed';
  end if;

  if new.status = 'activo' and old.status <> 'activo' then
    select count(*)
    into active_count
    from public.expedientes
    where patient_id = new.patient_id
      and status = 'activo'
      and id <> old.id;

    if active_count >= 3 then
      raise exception 'Patient already has the maximum number of active clinical records';
    end if;
  end if;

  return new;
end;
$$;

create trigger expedientes_enforce_update_rules
before update on public.expedientes
for each row execute function public.enforce_expediente_update_rules();

create trigger expedientes_touch_updated_at
before update on public.expedientes
for each row execute function public.touch_updated_at();

create trigger historias_clinicas_touch_updated_at
before update on public.historias_clinicas
for each row execute function public.touch_updated_at();

create trigger consentimientos_touch_updated_at
before update on public.consentimientos
for each row execute function public.touch_updated_at();

create trigger resumenes_terapeuticos_touch_updated_at
before update on public.resumenes_terapeuticos
for each row execute function public.touch_updated_at();

alter table public.expedientes enable row level security;
alter table public.historias_clinicas enable row level security;
alter table public.consentimientos enable row level security;
alter table public.resumenes_terapeuticos enable row level security;

create policy "Professionals can read own expedientes"
on public.expedientes for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own expedientes"
on public.expedientes for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
  and public.is_professional_assigned_to_patient(auth.uid(), patient_id)
);

create policy "Professionals can update own expedientes"
on public.expedientes for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can read own historias clinicas"
on public.historias_clinicas for select to authenticated
using (
  exists (
    select 1 from public.expedientes
    where expedientes.id = historias_clinicas.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

create policy "Professionals can upsert own historias clinicas"
on public.historias_clinicas for insert to authenticated
with check (
  exists (
    select 1 from public.expedientes
    where expedientes.id = historias_clinicas.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

create policy "Professionals can update own historias clinicas"
on public.historias_clinicas for update to authenticated
using (
  exists (
    select 1 from public.expedientes
    where expedientes.id = historias_clinicas.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
)
with check (
  exists (
    select 1 from public.expedientes
    where expedientes.id = historias_clinicas.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

create policy "Professionals can read own consentimientos"
on public.consentimientos for select to authenticated
using (
  exists (
    select 1 from public.expedientes
    where expedientes.id = consentimientos.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

create policy "Professionals can create own consentimientos"
on public.consentimientos for insert to authenticated
with check (
  exists (
    select 1 from public.expedientes
    where expedientes.id = consentimientos.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

create policy "Professionals can update own consentimientos"
on public.consentimientos for update to authenticated
using (
  exists (
    select 1 from public.expedientes
    where expedientes.id = consentimientos.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
)
with check (
  exists (
    select 1 from public.expedientes
    where expedientes.id = consentimientos.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

create policy "Professionals can read own resumenes terapeuticos"
on public.resumenes_terapeuticos for select to authenticated
using (
  exists (
    select 1 from public.expedientes
    where expedientes.id = resumenes_terapeuticos.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

create policy "Patients can read published resumenes terapeuticos"
on public.resumenes_terapeuticos for select to authenticated
using (
  status = 'publicado'
  and exists (
    select 1 from public.expedientes
    where expedientes.id = resumenes_terapeuticos.expediente_id
      and expedientes.patient_id = auth.uid()
      and public.current_user_role() = 'paciente'
  )
);

create policy "Professionals can create own resumenes terapeuticos"
on public.resumenes_terapeuticos for insert to authenticated
with check (
  exists (
    select 1 from public.expedientes
    where expedientes.id = resumenes_terapeuticos.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

create policy "Professionals can update own resumenes terapeuticos"
on public.resumenes_terapeuticos for update to authenticated
using (
  exists (
    select 1 from public.expedientes
    where expedientes.id = resumenes_terapeuticos.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
)
with check (
  exists (
    select 1 from public.expedientes
    where expedientes.id = resumenes_terapeuticos.expediente_id
      and expedientes.professional_id = auth.uid()
      and public.current_user_role() = 'profesional'
  )
);

revoke delete on public.expedientes from authenticated, anon;
revoke delete on public.historias_clinicas from authenticated, anon;
revoke delete on public.consentimientos from authenticated, anon;
revoke delete on public.resumenes_terapeuticos from authenticated, anon;
