alter type public.nota_clinica_type add value if not exists 'sesion';

alter table public.notas_clinicas
  add column if not exists session_time time,
  add column if not exists objective_scores text,
  add column if not exists patient_plan text,
  add column if not exists therapist_objectives text,
  add column if not exists mood_review text,
  add column if not exists previous_session_bridge text,
  add column if not exists session_agenda text,
  add column if not exists action_plan_review text,
  add column if not exists key_session_points text,
  add column if not exists session_summary_feedback text,
  add column if not exists home_action_plan text,
  add column if not exists patient_feedback text,
  add column if not exists observations text,
  add column if not exists next_session_at timestamptz;

drop index if exists public.notas_clinicas_admision_principal_idx;

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
    raise exception 'Clinical notes require informed consent';
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
      or coalesce(new.session_time, '00:00'::time) <> coalesce(old.session_time, '00:00'::time)
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
      or coalesce(new.next_session_at, 'epoch'::timestamptz) <> coalesce(old.next_session_at, 'epoch'::timestamptz)
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
