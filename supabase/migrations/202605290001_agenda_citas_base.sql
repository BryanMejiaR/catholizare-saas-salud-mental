create type public.appointment_type as enum ('presencial', 'videollamada');
create type public.appointment_status as enum ('programada', 'completada', 'cancelada');

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  process_id uuid references public.procesos_terapeuticos(id) on delete restrict,
  tcc_process_id uuid references public.procesos_terapeuticos(id) on delete restrict,
  tcc_session_plan_item_id text,
  scheduled_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 15 and 240),
  type public.appointment_type not null,
  status public.appointment_status not null default 'programada',
  zoom_meeting_id text,
  zoom_join_url text,
  zoom_start_url text,
  google_calendar_event_id text,
  cancellation_reason text,
  created_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancelled_by_user_id uuid references public.profiles(id) on delete set null,
  constraint citas_cancelled_has_metadata check (
    status <> 'cancelada'
    or (cancelled_at is not null and cancelled_by_user_id is not null)
  )
);

create index citas_professional_scheduled_idx
on public.citas(professional_id, scheduled_at desc);

create index citas_patient_scheduled_idx
on public.citas(patient_id, scheduled_at desc);

create index citas_status_idx
on public.citas(status);

create trigger citas_touch_updated_at
before update on public.citas
for each row execute function public.touch_updated_at();

alter table public.notas_clinicas
add constraint notas_clinicas_appointment_id_fkey
foreign key (appointment_id) references public.citas(id) on delete restrict;

create or replace function public.enforce_cita_insert_rules()
returns trigger
language plpgsql
as $$
declare
  patient_role public.user_role;
  professional_role public.user_role;
begin
  select role into patient_role from public.profiles where id = new.patient_id;
  select role into professional_role from public.profiles where id = new.professional_id;

  if patient_role <> 'paciente' then
    raise exception 'Appointment patient must have patient role';
  end if;

  if professional_role <> 'profesional' then
    raise exception 'Appointment professional must have professional role';
  end if;

  if new.process_id is not null then
    if not exists (
      select 1 from public.procesos_terapeuticos
      where id = new.process_id
        and patient_id = new.patient_id
        and professional_id = new.professional_id
    ) then
      raise exception 'Appointment process does not match patient and professional';
    end if;
  end if;

  if new.tcc_process_id is not null then
    if not exists (
      select 1 from public.procesos_terapeuticos
      where id = new.tcc_process_id
        and model_type = 'tcc'
        and patient_id = new.patient_id
        and professional_id = new.professional_id
    ) then
      raise exception 'Appointment TCC process does not match patient and professional';
    end if;
  end if;

  return new;
end;
$$;

create trigger citas_enforce_insert_rules
before insert on public.citas
for each row execute function public.enforce_cita_insert_rules();

create or replace function public.enforce_cita_update_rules()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
    or new.professional_id <> old.professional_id
    or new.patient_id <> old.patient_id
    or coalesce(new.created_by_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
      <> coalesce(old.created_by_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    or new.created_at <> old.created_at
  then
    raise exception 'Appointment identity fields are immutable';
  end if;

  if old.status = 'cancelada' then
    raise exception 'Cancelled appointments are read-only';
  end if;

  if old.status = 'programada' and new.status = 'cancelada' then
    if new.cancelled_at is null or new.cancelled_by_user_id is null then
      raise exception 'Cancelling an appointment requires metadata';
    end if;
    return new;
  end if;

  if new.status <> old.status and new.status <> 'completada' then
    raise exception 'Invalid appointment status transition';
  end if;

  return new;
end;
$$;

create trigger citas_enforce_update_rules
before update on public.citas
for each row execute function public.enforce_cita_update_rules();

alter table public.citas enable row level security;

create policy "Professionals can read own appointments"
on public.citas for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Patients can read own appointments"
on public.citas for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

create policy "Professionals can create own appointments"
on public.citas for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own appointments"
on public.citas for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke delete on public.citas from authenticated, anon;
