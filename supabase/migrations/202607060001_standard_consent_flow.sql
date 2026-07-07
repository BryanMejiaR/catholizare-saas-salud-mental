alter table public.consentimientos
  add column if not exists consent_flow text not null default 'custom',
  add column if not exists standard_document_title text,
  add column if not exists standard_document_version text,
  add column if not exists standard_sent_at timestamptz,
  add column if not exists standard_sent_by_professional_id uuid references public.profiles(id) on delete set null,
  add column if not exists signature_code_hash text,
  add column if not exists signature_code_expires_at timestamptz,
  add column if not exists signature_code_sent_at timestamptz,
  add column if not exists signature_code_attempts integer not null default 0;

do $$
begin
  alter table public.consentimientos
    add constraint consentimientos_consent_flow_check
    check (consent_flow in ('custom', 'standard'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.consentimientos
    add constraint consentimientos_signature_code_hash_check
    check (signature_code_hash is null or signature_code_hash ~ '^[a-f0-9]{64}$');
exception
  when duplicate_object then null;
end $$;

create index if not exists consentimientos_standard_pending_idx
  on public.consentimientos(expediente_id, consent_flow, status, created_at desc);
