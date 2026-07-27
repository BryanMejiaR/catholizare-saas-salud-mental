create table if not exists public.patient_resource_preferences (
  patient_id uuid primary key references public.profiles(id) on delete cascade,
  selected_topics text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_resource_preferences_topics_count
    check (cardinality(selected_topics) <= 12)
);

drop trigger if exists patient_resource_preferences_touch_updated_at
on public.patient_resource_preferences;

create trigger patient_resource_preferences_touch_updated_at
before update on public.patient_resource_preferences
for each row execute function public.touch_updated_at();

alter table public.patient_resource_preferences enable row level security;

drop policy if exists "Patients can read own resource preferences"
on public.patient_resource_preferences;

create policy "Patients can read own resource preferences"
on public.patient_resource_preferences for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

drop policy if exists "Patients can insert own resource preferences"
on public.patient_resource_preferences;

create policy "Patients can insert own resource preferences"
on public.patient_resource_preferences for insert to authenticated
with check (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

drop policy if exists "Patients can update own resource preferences"
on public.patient_resource_preferences;

create policy "Patients can update own resource preferences"
on public.patient_resource_preferences for update to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
)
with check (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

revoke delete on public.patient_resource_preferences from authenticated, anon;
grant select, insert, update on public.patient_resource_preferences to service_role;
