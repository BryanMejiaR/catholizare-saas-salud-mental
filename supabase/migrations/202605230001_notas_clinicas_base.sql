create type public.nota_clinica_type as enum (
  'admision',
  'evolucion',
  'interconsulta',
  'referencia_traslado',
  'egreso',
  'addendum'
);

create type public.nota_clinica_status as enum (
  'borrador',
  'confirmada',
  'con_addendum',
  'anulada_logicamente',
  'exportada'
);

create table public.notas_clinicas (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  appointment_id uuid,
  process_id uuid,
  tcc_process_id uuid,
  tcc_session_plan_item_id uuid,
  tcc_session_number integer check (tcc_session_number is null or tcc_session_number > 0),
  tcc_phase text,
  note_type public.nota_clinica_type not null,
  status public.nota_clinica_status not null default 'borrador',
  session_date date not null,
  content text not null,
  clinical_summary text,
  interventions text,
  patient_response text,
  plan_next_session text,
  risk_flags text,
  homework_or_tasks text,
  mood_score integer check (mood_score is null or mood_score between 1 and 10),
  anxiety_score integer check (anxiety_score is null or anxiety_score between 1 and 10),
  hope_score integer check (hope_score is null or hope_score between 1 and 10),
  created_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_by_user_id uuid references public.profiles(id) on delete set null,
  confirmed_at timestamptz,
  addendum_to_note_id uuid references public.notas_clinicas(id) on delete restrict,
  correction_reason text,
  annulment_reason text,
  annulled_at timestamptz,
  annulled_by_user_id uuid references public.profiles(id) on delete set null,
  pdf_file_id uuid,
  exported_at timestamptz,
  ai_used boolean not null default false,
  ai_session_id uuid,
  constraint notas_clinicas_addendum_requires_original check (
    note_type <> 'addendum'
    or addendum_to_note_id is not null
  ),
  constraint notas_clinicas_confirmed_has_metadata check (
    status <> 'confirmada'
    or (confirmed_at is not null and confirmed_by_user_id is not null)
  )
);

create unique index notas_clinicas_admision_principal_idx
on public.notas_clinicas(expediente_id)
where note_type = 'admision' and addendum_to_note_id is null and status <> 'anulada_logicamente';

create index notas_clinicas_expediente_created_idx
on public.notas_clinicas(expediente_id, created_at desc);

create index notas_clinicas_professional_idx
on public.notas_clinicas(professional_id);

create index notas_clinicas_patient_idx
on public.notas_clinicas(patient_id);

create index notas_clinicas_status_idx
on public.notas_clinicas(status);

create index notas_clinicas_type_idx
on public.notas_clinicas(note_type);

create index notas_clinicas_session_date_idx
on public.notas_clinicas(session_date desc);

create trigger notas_clinicas_touch_updated_at
before update on public.notas_clinicas
for each row execute function public.touch_updated_at();

create or replace function public.enforce_nota_clinica_rules()
returns trigger
language plpgsql
as $$
declare
  expediente_row public.expedientes%rowtype;
  original_note_status public.nota_clinica_status;
begin
  select *
  into expediente_row
  from public.expedientes
  where id = new.expediente_id;

  if expediente_row.id is null then
    raise exception 'Clinical record not found';
  end if;

  if expediente_row.status <> 'activo' then
    raise exception 'Clinical record is not active';
  end if;

  if new.patient_id <> expediente_row.patient_id or new.professional_id <> expediente_row.professional_id then
    raise exception 'Clinical note ownership does not match clinical record';
  end if;

  if expediente_row.consent_status not in ('firmado_fisico', 'firmado_digital', 'excepcion_justificada') then
    raise exception 'Clinical notes require informed consent or justified exception';
  end if;

  if new.note_type = 'addendum' then
    select status
    into original_note_status
    from public.notas_clinicas
    where id = new.addendum_to_note_id
      and expediente_id = new.expediente_id
      and professional_id = new.professional_id;

    if original_note_status not in ('confirmada', 'con_addendum', 'exportada') then
      raise exception 'Addendum requires a confirmed original note';
    end if;
  end if;

  return new;
end;
$$;

create trigger notas_clinicas_enforce_insert_rules
before insert on public.notas_clinicas
for each row execute function public.enforce_nota_clinica_rules();

create or replace function public.enforce_nota_clinica_update_rules()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
    or new.expediente_id <> old.expediente_id
    or new.patient_id <> old.patient_id
    or new.professional_id <> old.professional_id
    or coalesce(new.created_by_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
      <> coalesce(old.created_by_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    or new.note_type <> old.note_type
    or coalesce(new.addendum_to_note_id, '00000000-0000-0000-0000-000000000000'::uuid)
      <> coalesce(old.addendum_to_note_id, '00000000-0000-0000-0000-000000000000'::uuid)
  then
    raise exception 'Clinical note identity fields are immutable';
  end if;

  if old.status = 'borrador' then
    if new.status = 'confirmada' then
      if new.confirmed_at is null or new.confirmed_by_user_id is null then
        raise exception 'Confirmed notes require confirmation metadata';
      end if;
      return new;
    end if;

    if new.status <> 'borrador' then
      raise exception 'Draft notes can only move to confirmed';
    end if;

    return new;
  end if;

  if old.status in ('confirmada', 'con_addendum', 'exportada') then
    if new.session_date <> old.session_date
      or new.content <> old.content
      or coalesce(new.clinical_summary, '') <> coalesce(old.clinical_summary, '')
      or coalesce(new.interventions, '') <> coalesce(old.interventions, '')
      or coalesce(new.patient_response, '') <> coalesce(old.patient_response, '')
      or coalesce(new.plan_next_session, '') <> coalesce(old.plan_next_session, '')
      or coalesce(new.risk_flags, '') <> coalesce(old.risk_flags, '')
      or coalesce(new.homework_or_tasks, '') <> coalesce(old.homework_or_tasks, '')
      or coalesce(new.mood_score, -1) <> coalesce(old.mood_score, -1)
      or coalesce(new.anxiety_score, -1) <> coalesce(old.anxiety_score, -1)
      or coalesce(new.hope_score, -1) <> coalesce(old.hope_score, -1)
    then
      raise exception 'Confirmed clinical notes are immutable; use addendum';
    end if;

    if new.status = 'con_addendum' and old.status in ('confirmada', 'exportada') then
      return new;
    end if;

    if new.status = 'exportada' and old.status in ('confirmada', 'con_addendum') then
      return new;
    end if;

    if new.status = 'anulada_logicamente' then
      if new.annulled_at is null or new.annulled_by_user_id is null or new.annulment_reason is null then
        raise exception 'Logical annulment requires metadata';
      end if;
      return new;
    end if;

    if new.status <> old.status then
      raise exception 'Invalid clinical note status transition';
    end if;

    return new;
  end if;

  if old.status = 'anulada_logicamente' then
    raise exception 'Annulled clinical notes cannot be modified';
  end if;

  return new;
end;
$$;

create trigger notas_clinicas_enforce_update_rules
before update on public.notas_clinicas
for each row execute function public.enforce_nota_clinica_update_rules();

create or replace function public.increment_session_notes_count()
returns trigger
language plpgsql
as $$
begin
  if new.note_type <> 'addendum' then
    update public.expedientes
    set
      session_notes_count = session_notes_count + 1,
      last_clinical_activity_at = now()
    where id = new.expediente_id;
  end if;

  return new;
end;
$$;

create trigger notas_clinicas_increment_session_notes_count
after insert on public.notas_clinicas
for each row execute function public.increment_session_notes_count();

alter table public.notas_clinicas enable row level security;

create policy "Professionals can read own notas clinicas"
on public.notas_clinicas for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own notas clinicas"
on public.notas_clinicas for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own notas clinicas"
on public.notas_clinicas for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke delete on public.notas_clinicas from authenticated, anon;
