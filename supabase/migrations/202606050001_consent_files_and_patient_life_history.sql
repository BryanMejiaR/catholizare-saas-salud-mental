insert into storage.buckets (id, name, public)
values ('clinical-consents', 'clinical-consents', false)
on conflict (id) do nothing;

alter table public.consentimientos
  add column if not exists document_storage_path text,
  add column if not exists document_file_name text,
  add column if not exists document_content_type text,
  add column if not exists document_size_bytes integer;

create type public.patient_life_history_status as enum (
  'inactiva',
  'borrador',
  'enviada',
  'reabierta'
);

create table public.patient_life_histories (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  status public.patient_life_history_status not null default 'inactiva',
  answers jsonb not null default '{}'::jsonb,
  activated_by_professional_id uuid references public.profiles(id) on delete set null,
  activated_at timestamptz,
  submitted_at timestamptz,
  reopened_by_professional_id uuid references public.profiles(id) on delete set null,
  reopened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_life_histories_exp_unique unique (expediente_id),
  constraint patient_life_histories_answers_object check (jsonb_typeof(answers) = 'object')
);

create index patient_life_histories_patient_idx
on public.patient_life_histories(patient_id, updated_at desc);

create index patient_life_histories_professional_idx
on public.patient_life_histories(professional_id, updated_at desc);

create or replace function public.enforce_patient_life_history_rules()
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
    raise exception 'Life history ownership mismatch';
  end if;

  if expediente.status <> 'activo' then
    raise exception 'Life history can only be managed for active clinical records';
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id
       or new.expediente_id <> old.expediente_id
       or new.patient_id <> old.patient_id
       or new.professional_id <> old.professional_id
       or new.created_at <> old.created_at then
      raise exception 'Life history identity fields are immutable';
    end if;
  end if;

  return new;
end;
$$;

create trigger patient_life_histories_enforce_rules
before insert or update on public.patient_life_histories
for each row execute function public.enforce_patient_life_history_rules();

create trigger patient_life_histories_touch_updated_at
before update on public.patient_life_histories
for each row execute function public.touch_updated_at();

alter table public.patient_life_histories enable row level security;

create policy "Professionals can read own patient life histories"
on public.patient_life_histories for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own patient life histories"
on public.patient_life_histories for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own patient life histories"
on public.patient_life_histories for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Patients can read active own life history"
on public.patient_life_histories for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
  and status in ('borrador', 'enviada', 'reabierta')
);

create policy "Patients can update editable own life history"
on public.patient_life_histories for update to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
  and status in ('borrador', 'reabierta')
)
with check (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
  and status in ('borrador', 'enviada', 'reabierta')
);

revoke delete on public.patient_life_histories from authenticated, anon;
