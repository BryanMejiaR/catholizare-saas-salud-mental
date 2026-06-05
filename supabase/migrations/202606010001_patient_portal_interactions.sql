create type public.appointment_request_type as enum (
  'cancelacion',
  'reprogramacion'
);

create type public.patient_request_status as enum (
  'recibida',
  'revisada',
  'resuelta',
  'rechazada'
);

create table public.patient_appointment_requests (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.citas(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  request_type public.appointment_request_type not null,
  message text not null,
  status public.patient_request_status not null default 'recibida',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_appointment_requests_unique_open_request unique (appointment_id, patient_id),
  constraint patient_appointment_requests_message_length check (
    char_length(trim(message)) between 5 and 1200
  )
);

create index patient_appointment_requests_patient_idx
on public.patient_appointment_requests(patient_id, created_at desc);

create index patient_appointment_requests_professional_idx
on public.patient_appointment_requests(professional_id, created_at desc);

create index patient_appointment_requests_appointment_idx
on public.patient_appointment_requests(appointment_id);

create table public.patient_experience_reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.citas(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint patient_experience_reviews_comment_length check (
    comment is null or char_length(comment) <= 1200
  ),
  constraint patient_experience_reviews_appointment_patient_unique unique (appointment_id, patient_id)
);

create index patient_experience_reviews_patient_idx
on public.patient_experience_reviews(patient_id, created_at desc);

create index patient_experience_reviews_professional_idx
on public.patient_experience_reviews(professional_id, created_at desc);

create or replace function public.enforce_patient_portal_appointment_request_rules()
returns trigger
language plpgsql
as $$
declare
  appointment record;
begin
  select id, patient_id, professional_id, status, scheduled_at
  into appointment
  from public.citas
  where id = new.appointment_id;

  if appointment.id is null then
    raise exception 'Appointment does not exist';
  end if;

  if appointment.patient_id <> new.patient_id or appointment.professional_id <> new.professional_id then
    raise exception 'Appointment ownership mismatch';
  end if;

  if appointment.status <> 'programada' or appointment.scheduled_at <= now() then
    raise exception 'Only future scheduled appointments can receive patient requests';
  end if;

  return new;
end;
$$;

create trigger patient_appointment_requests_enforce_rules
before insert on public.patient_appointment_requests
for each row execute function public.enforce_patient_portal_appointment_request_rules();

create or replace function public.enforce_patient_experience_review_rules()
returns trigger
language plpgsql
as $$
declare
  appointment record;
begin
  select id, patient_id, professional_id, scheduled_at
  into appointment
  from public.citas
  where id = new.appointment_id;

  if appointment.id is null then
    raise exception 'Appointment does not exist';
  end if;

  if appointment.patient_id <> new.patient_id or appointment.professional_id <> new.professional_id then
    raise exception 'Appointment ownership mismatch';
  end if;

  if appointment.scheduled_at > now() then
    raise exception 'Only past appointments can receive experience reviews';
  end if;

  return new;
end;
$$;

create trigger patient_experience_reviews_enforce_rules
before insert on public.patient_experience_reviews
for each row execute function public.enforce_patient_experience_review_rules();

create trigger patient_appointment_requests_touch_updated_at
before update on public.patient_appointment_requests
for each row execute function public.touch_updated_at();

alter table public.patient_appointment_requests enable row level security;
alter table public.patient_experience_reviews enable row level security;

create policy "Patients can read own appointment requests"
on public.patient_appointment_requests for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

create policy "Patients can create own appointment requests"
on public.patient_appointment_requests for insert to authenticated
with check (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

create policy "Professionals can read own patient appointment requests"
on public.patient_appointment_requests for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own patient appointment requests"
on public.patient_appointment_requests for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Patients can read own experience reviews"
on public.patient_experience_reviews for select to authenticated
using (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

create policy "Patients can create own experience reviews"
on public.patient_experience_reviews for insert to authenticated
with check (
  public.current_user_role() = 'paciente'
  and patient_id = auth.uid()
);

create policy "Professionals can read own patient experience reviews"
on public.patient_experience_reviews for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke update, delete on public.patient_experience_reviews from authenticated, anon;
revoke delete on public.patient_appointment_requests from authenticated, anon;
