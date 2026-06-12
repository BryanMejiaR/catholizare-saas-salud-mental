create table public.plantillas_nota_clinica (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete restrict,
  model_type text not null default 'general' check (model_type in ('general', 'tcc')),
  version integer not null check (version > 0),
  sections jsonb not null default '[]'::jsonb,
  created_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint plantillas_nota_clinica_sections_array check (jsonb_typeof(sections) = 'array'),
  constraint plantillas_nota_clinica_professional_model_version_unique unique (
    professional_id,
    model_type,
    version
  )
);

create index plantillas_nota_clinica_professional_version_idx
on public.plantillas_nota_clinica(professional_id, model_type, version desc);

alter table public.notas_clinicas
  add column if not exists note_template_id uuid references public.plantillas_nota_clinica(id) on delete restrict,
  add column if not exists note_template_version integer check (
    note_template_version is null or note_template_version > 0
  ),
  add column if not exists note_template_snapshot jsonb,
  add column if not exists note_template_values jsonb not null default '{}'::jsonb,
  add constraint notas_clinicas_template_snapshot_object check (
    note_template_snapshot is null or jsonb_typeof(note_template_snapshot) = 'object'
  ),
  add constraint notas_clinicas_template_values_object check (
    jsonb_typeof(note_template_values) = 'object'
  );

alter table public.plantillas_nota_clinica enable row level security;

create policy "Professionals can read own note templates"
on public.plantillas_nota_clinica for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own note templates"
on public.plantillas_nota_clinica for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke update, delete on public.plantillas_nota_clinica from authenticated, anon;

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
    or coalesce(new.note_template_id, '00000000-0000-0000-0000-000000000000'::uuid)
      <> coalesce(old.note_template_id, '00000000-0000-0000-0000-000000000000'::uuid)
    or coalesce(new.note_template_version, -1) <> coalesce(old.note_template_version, -1)
    or coalesce(new.note_template_snapshot, '{}'::jsonb)
      <> coalesce(old.note_template_snapshot, '{}'::jsonb)
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
      or coalesce(new.session_time, '00:00'::time) <> coalesce(old.session_time, '00:00'::time)
      or new.content <> old.content
      or coalesce(new.note_template_values, '{}'::jsonb) <> coalesce(old.note_template_values, '{}'::jsonb)
      or coalesce(new.clinical_summary, '') <> coalesce(old.clinical_summary, '')
      or coalesce(new.interventions, '') <> coalesce(old.interventions, '')
      or coalesce(new.patient_response, '') <> coalesce(old.patient_response, '')
      or coalesce(new.plan_next_session, '') <> coalesce(old.plan_next_session, '')
      or coalesce(new.risk_flags, '') <> coalesce(old.risk_flags, '')
      or coalesce(new.homework_or_tasks, '') <> coalesce(old.homework_or_tasks, '')
      or coalesce(new.mood_score, -1) <> coalesce(old.mood_score, -1)
      or coalesce(new.anxiety_score, -1) <> coalesce(old.anxiety_score, -1)
      or coalesce(new.hope_score, -1) <> coalesce(old.hope_score, -1)
      or coalesce(new.tcc_session_number, -1) <> coalesce(old.tcc_session_number, -1)
      or coalesce(new.objective_scores, '') <> coalesce(old.objective_scores, '')
      or coalesce(new.patient_plan, '') <> coalesce(old.patient_plan, '')
      or coalesce(new.therapist_objectives, '') <> coalesce(old.therapist_objectives, '')
      or coalesce(new.mood_review, '') <> coalesce(old.mood_review, '')
      or coalesce(new.previous_session_bridge, '') <> coalesce(old.previous_session_bridge, '')
      or coalesce(new.session_agenda, '') <> coalesce(old.session_agenda, '')
      or coalesce(new.action_plan_review, '') <> coalesce(old.action_plan_review, '')
      or coalesce(new.key_session_points, '') <> coalesce(old.key_session_points, '')
      or coalesce(new.session_summary_feedback, '') <> coalesce(old.session_summary_feedback, '')
      or coalesce(new.home_action_plan, '') <> coalesce(old.home_action_plan, '')
      or coalesce(new.patient_feedback, '') <> coalesce(old.patient_feedback, '')
      or coalesce(new.observations, '') <> coalesce(old.observations, '')
      or coalesce(new.next_session_at, 'epoch'::timestamptz)
        <> coalesce(old.next_session_at, 'epoch'::timestamptz)
    then
      raise exception 'Confirmed clinical notes are immutable';
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
