create type public.proceso_general_status as enum ('activo', 'cerrado');

create table public.plantillas_proceso (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete restrict,
  model_type text not null default 'general' check (model_type = 'general'),
  version integer not null check (version > 0),
  steps jsonb not null default '[]'::jsonb,
  created_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint plantillas_proceso_steps_array check (jsonb_typeof(steps) = 'array'),
  constraint plantillas_proceso_professional_version_unique unique (
    professional_id,
    model_type,
    version
  )
);

create table public.procesos_terapeuticos (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  template_id uuid references public.plantillas_proceso(id) on delete restrict,
  template_version integer not null check (template_version > 0),
  template_snapshot jsonb not null,
  status public.proceso_general_status not null default 'activo',
  started_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_by_note_id uuid references public.notas_clinicas(id) on delete restrict,
  step_data jsonb not null default '{}'::jsonb,
  gpt_instructions jsonb not null default '{}'::jsonb,
  linked_note_ids uuid[] not null default '{}',
  linked_assessment_ids uuid[] not null default '{}',
  created_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint procesos_terapeuticos_template_snapshot_object check (
    jsonb_typeof(template_snapshot) = 'object'
  ),
  constraint procesos_terapeuticos_step_data_object check (jsonb_typeof(step_data) = 'object'),
  constraint procesos_terapeuticos_gpt_instructions_object check (
    jsonb_typeof(gpt_instructions) = 'object'
  ),
  constraint procesos_terapeuticos_closed_has_metadata check (
    status <> 'cerrado'
    or (closed_at is not null and closed_by_note_id is not null)
  )
);

create unique index procesos_terapeuticos_active_patient_professional_idx
on public.procesos_terapeuticos(patient_id, professional_id)
where status = 'activo';

create index plantillas_proceso_professional_version_idx
on public.plantillas_proceso(professional_id, model_type, version desc);

create index procesos_terapeuticos_expediente_idx
on public.procesos_terapeuticos(expediente_id);

create index procesos_terapeuticos_professional_idx
on public.procesos_terapeuticos(professional_id);

create index procesos_terapeuticos_patient_idx
on public.procesos_terapeuticos(patient_id);

create index procesos_terapeuticos_status_idx
on public.procesos_terapeuticos(status);

alter table public.notas_clinicas
add constraint notas_clinicas_process_id_fkey
foreign key (process_id) references public.procesos_terapeuticos(id) on delete restrict;

create trigger procesos_terapeuticos_touch_updated_at
before update on public.procesos_terapeuticos
for each row execute function public.touch_updated_at();

create or replace function public.enforce_proceso_general_insert_rules()
returns trigger
language plpgsql
as $$
declare
  expediente_row public.expedientes%rowtype;
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
    raise exception 'Therapeutic process ownership does not match clinical record';
  end if;

  return new;
end;
$$;

create trigger procesos_terapeuticos_enforce_insert_rules
before insert on public.procesos_terapeuticos
for each row execute function public.enforce_proceso_general_insert_rules();

create or replace function public.enforce_proceso_general_update_rules()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
    or new.expediente_id <> old.expediente_id
    or new.patient_id <> old.patient_id
    or new.professional_id <> old.professional_id
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

create trigger procesos_terapeuticos_enforce_update_rules
before update on public.procesos_terapeuticos
for each row execute function public.enforce_proceso_general_update_rules();

alter table public.plantillas_proceso enable row level security;
alter table public.procesos_terapeuticos enable row level security;

create policy "Professionals can read own process templates"
on public.plantillas_proceso for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own process templates"
on public.plantillas_proceso for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can read own therapeutic processes"
on public.procesos_terapeuticos for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own therapeutic processes"
on public.procesos_terapeuticos for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own therapeutic processes"
on public.procesos_terapeuticos for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke update, delete on public.plantillas_proceso from authenticated, anon;
revoke delete on public.procesos_terapeuticos from authenticated, anon;
