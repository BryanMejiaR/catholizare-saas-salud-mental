alter table public.procesos_terapeuticos
add column model_type text not null default 'general';

alter table public.procesos_terapeuticos
add constraint procesos_terapeuticos_model_type_check
check (model_type in ('general', 'tcc'));

create index procesos_terapeuticos_model_type_idx
on public.procesos_terapeuticos(model_type);

create or replace function public.enforce_proceso_general_update_rules()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
    or new.expediente_id <> old.expediente_id
    or new.patient_id <> old.patient_id
    or new.professional_id <> old.professional_id
    or new.model_type <> old.model_type
    or coalesce(new.template_id, '00000000-0000-0000-0000-000000000000'::uuid)
      <> coalesce(old.template_id, '00000000-0000-0000-0000-000000000000'::uuid)
    or new.template_version <> old.template_version
    or new.template_snapshot <> old.template_snapshot
    or new.started_at <> old.started_at
    or coalesce(new.created_by_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
      <> coalesce(old.created_by_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
  then
    raise exception 'Therapeutic process identity fields are immutable';
  end if;

  if old.status = 'cerrado' then
    raise exception 'Closed therapeutic processes are read-only';
  end if;

  if old.status = 'activo' and new.status = 'cerrado' then
    if new.closed_at is null or new.closed_by_note_id is null then
      raise exception 'Closing a process requires closure metadata';
    end if;
    return new;
  end if;

  if new.status <> old.status then
    raise exception 'Invalid therapeutic process status transition';
  end if;

  return new;
end;
$$;
