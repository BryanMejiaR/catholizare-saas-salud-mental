alter table public.consentimientos
  add column if not exists acceptance_folio text unique,
  add column if not exists acceptance_document text,
  add column if not exists acceptance_document_version text,
  add column if not exists legal_accepted_at timestamptz,
  add column if not exists acceptance_actor_full_name text,
  add column if not exists acceptance_actor_email text,
  add column if not exists acceptance_actor_phone text,
  add column if not exists acceptance_actor_rfc text,
  add column if not exists acceptance_ip inet,
  add column if not exists acceptance_user_agent text,
  add column if not exists acceptance_method text,
  add column if not exists acceptance_document_hash text,
  add column if not exists acceptance_session_reference text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'consentimientos_acceptance_hash_format'
  ) then
    alter table public.consentimientos
      add constraint consentimientos_acceptance_hash_format
      check (
        acceptance_document_hash is null
        or acceptance_document_hash ~ '^[a-f0-9]{64}$'
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'consentimientos_acceptance_method_length'
  ) then
    alter table public.consentimientos
      add constraint consentimientos_acceptance_method_length
      check (
        acceptance_method is null
        or length(trim(acceptance_method)) between 5 and 160
      ) not valid;
  end if;
end $$;

create index if not exists consentimientos_acceptance_folio_idx
on public.consentimientos(acceptance_folio)
where acceptance_folio is not null;
