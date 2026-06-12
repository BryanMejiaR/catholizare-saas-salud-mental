create type public.psychological_assessment_type as enum (
  'inventario',
  'cuestionario',
  'escala_clinica',
  'personalidad',
  'proyectiva',
  'entrevista_estructurada',
  'psicometrica_externa',
  'clinica_no_estandarizada',
  'otra'
);

create type public.psychological_assessment_status as enum (
  'borrador',
  'analizada',
  'validada',
  'archivada',
  'anulada_logicamente'
);

create type public.psychological_validation_status as enum (
  'pendiente',
  'validado',
  'rechazado',
  'corregido'
);

create type public.assessment_input_method as enum (
  'manual',
  'imagen',
  'archivo',
  'resultado_externo'
);

create table public.psychological_assessments (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  linked_tcc_process_id uuid references public.procesos_terapeuticos(id) on delete restrict,
  linked_reevaluation_cut_id text,
  assessment_name text not null,
  assessment_type public.psychological_assessment_type not null,
  assessment_purpose text not null,
  applied_at date not null,
  input_method public.assessment_input_method not null default 'manual',
  raw_scores jsonb not null default '{}'::jsonb,
  scaled_scores jsonb not null default '{}'::jsonb,
  percentiles jsonb not null default '{}'::jsonb,
  cutoff_points jsonb not null default '{}'::jsonb,
  interpretation text,
  limitations text,
  implications text,
  ai_draft_interpretation text,
  comparison_notes text,
  professional_validation_status public.psychological_validation_status not null default 'pendiente',
  validated_by_user_id uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  status public.psychological_assessment_status not null default 'borrador',
  ai_session_id uuid references public.ai_sessions(id) on delete set null,
  annulment_reason text,
  annulled_at timestamptz,
  annulled_by_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint psychological_assessments_json_objects check (
    jsonb_typeof(raw_scores) = 'object'
    and jsonb_typeof(scaled_scores) = 'object'
    and jsonb_typeof(percentiles) = 'object'
    and jsonb_typeof(cutoff_points) = 'object'
  ),
  constraint psychological_assessments_validation_metadata check (
    professional_validation_status <> 'validado'
    or (validated_by_user_id is not null and validated_at is not null)
  ),
  constraint psychological_assessments_annulment_metadata check (
    status <> 'anulada_logicamente'
    or (annulment_reason is not null and annulled_at is not null and annulled_by_user_id is not null)
  )
);

create index psychological_assessments_expediente_idx
on public.psychological_assessments(expediente_id, created_at desc);

create index psychological_assessments_professional_idx
on public.psychological_assessments(professional_id, created_at desc);

create index psychological_assessments_patient_idx
on public.psychological_assessments(patient_id, created_at desc);

create or replace function public.enforce_psychological_assessment_rules()
returns trigger
language plpgsql
as $$
declare
  expediente record;
  tcc_process record;
begin
  select id, patient_id, professional_id, status
  into expediente
  from public.expedientes
  where id = new.expediente_id;

  if expediente.id is null then
    raise exception 'Clinical record does not exist';
  end if;

  if expediente.patient_id <> new.patient_id or expediente.professional_id <> new.professional_id then
    raise exception 'Assessment ownership mismatch';
  end if;

  if expediente.status <> 'activo' and tg_op = 'INSERT' then
    raise exception 'Assessments can only be created for active clinical records';
  end if;

  if new.linked_tcc_process_id is not null then
    select id, patient_id, professional_id, expediente_id, model_type
    into tcc_process
    from public.procesos_terapeuticos
    where id = new.linked_tcc_process_id;

    if tcc_process.id is null
       or tcc_process.patient_id <> new.patient_id
       or tcc_process.professional_id <> new.professional_id
       or tcc_process.expediente_id <> new.expediente_id
       or tcc_process.model_type <> 'tcc' then
      raise exception 'Linked TCC process is invalid for assessment';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    if old.status in ('validada', 'archivada', 'anulada_logicamente') then
      raise exception 'Finalized assessments are read-only';
    end if;

    if new.id <> old.id
       or new.expediente_id <> old.expediente_id
       or new.patient_id <> old.patient_id
       or new.professional_id <> old.professional_id
       or new.created_by is distinct from old.created_by
       or new.created_at <> old.created_at then
      raise exception 'Assessment identity fields are immutable';
    end if;
  end if;

  return new;
end;
$$;

create trigger psychological_assessments_enforce_rules
before insert or update on public.psychological_assessments
for each row execute function public.enforce_psychological_assessment_rules();

create or replace function public.increment_assessments_count()
returns trigger
language plpgsql
as $$
begin
  update public.expedientes
  set assessments_count = assessments_count + 1,
      last_clinical_activity_at = now()
  where id = new.expediente_id;

  return new;
end;
$$;

create trigger psychological_assessments_increment_count
after insert on public.psychological_assessments
for each row execute function public.increment_assessments_count();

create trigger psychological_assessments_touch_updated_at
before update on public.psychological_assessments
for each row execute function public.touch_updated_at();

alter table public.psychological_assessments enable row level security;

create policy "Professionals can read own psychological assessments"
on public.psychological_assessments for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own psychological assessments"
on public.psychological_assessments for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own psychological assessments"
on public.psychological_assessments for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke delete on public.psychological_assessments from authenticated, anon;
