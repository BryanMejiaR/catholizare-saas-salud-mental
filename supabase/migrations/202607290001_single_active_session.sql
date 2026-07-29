alter table public.profiles
  add column if not exists active_session_token_hash text,
  add column if not exists active_session_started_at timestamptz;

create index if not exists profiles_active_session_started_idx
on public.profiles(active_session_started_at desc)
where active_session_started_at is not null;
