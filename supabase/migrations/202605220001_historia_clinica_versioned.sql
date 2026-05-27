alter table public.historias_clinicas
drop constraint historias_clinicas_pkey;

alter table public.historias_clinicas
add column id uuid default gen_random_uuid(),
add column created_by uuid references public.profiles(id) on delete set null;

alter table public.historias_clinicas
add constraint historias_clinicas_pkey primary key (id);

create index historias_clinicas_expediente_id_idx
on public.historias_clinicas(expediente_id);

create index historias_clinicas_expediente_created_idx
on public.historias_clinicas(expediente_id, created_at desc);
