create table if not exists public.nota_clinica_draft_revisions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notas_clinicas(id) on delete restrict,
  expediente_id uuid not null references public.expedientes(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  edited_by_user_id uuid references public.profiles(id) on delete set null,
  revision_event text not null check (revision_event in ('draft_update', 'confirm')),
  previous_values jsonb not null default '{}',
  next_values jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists nota_draft_revisions_note_idx
on public.nota_clinica_draft_revisions(note_id, created_at desc);

create index if not exists nota_draft_revisions_expediente_idx
on public.nota_clinica_draft_revisions(expediente_id, created_at desc);

create index if not exists nota_draft_revisions_professional_idx
on public.nota_clinica_draft_revisions(professional_id, created_at desc);

alter table public.nota_clinica_draft_revisions enable row level security;

drop policy if exists "Professionals can read own note draft revisions"
on public.nota_clinica_draft_revisions;

create policy "Professionals can read own note draft revisions"
on public.nota_clinica_draft_revisions for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke insert, update, delete on public.nota_clinica_draft_revisions from authenticated, anon;
revoke delete on public.nota_clinica_draft_revisions from service_role;
