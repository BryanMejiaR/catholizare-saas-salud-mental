create type public.help_article_status as enum ('borrador', 'activo', 'inactivo');

create type public.support_ticket_priority as enum ('baja', 'media', 'alta');

create type public.support_ticket_status as enum ('abierto', 'en_revision', 'resuelto', 'cerrado');

create type public.help_content_type as enum ('articulo', 'faq', 'guia', 'enlace', 'asistente');

create table public.help_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  body text not null,
  category text not null,
  tags text[] not null default '{}',
  status public.help_article_status not null default 'borrador',
  created_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint help_articles_title_length check (char_length(title) between 3 and 160),
  constraint help_articles_summary_length check (char_length(summary) between 10 and 500),
  constraint help_articles_body_length check (char_length(body) between 20 and 12000),
  constraint help_articles_category_length check (char_length(category) between 3 and 80)
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete restrict,
  category text not null,
  subject text not null,
  description text not null,
  priority public.support_ticket_priority not null default 'media',
  status public.support_ticket_status not null default 'abierto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_tickets_category_length check (char_length(category) between 3 and 80),
  constraint support_tickets_subject_length check (char_length(subject) between 5 and 180),
  constraint support_tickets_description_length check (char_length(description) between 20 and 3000)
);

create table public.help_interactions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.profiles(id) on delete set null,
  content_type public.help_content_type not null,
  content_id uuid,
  created_at timestamptz not null default now()
);

create index help_articles_status_category_idx
on public.help_articles(status, category, updated_at desc);

create index support_tickets_professional_idx
on public.support_tickets(professional_id, created_at desc);

create index support_tickets_status_idx
on public.support_tickets(status, created_at desc);

create index help_interactions_professional_idx
on public.help_interactions(professional_id, created_at desc);

create trigger help_articles_touch_updated_at
before update on public.help_articles
for each row execute function public.touch_updated_at();

create trigger support_tickets_touch_updated_at
before update on public.support_tickets
for each row execute function public.touch_updated_at();

alter table public.help_articles enable row level security;
alter table public.support_tickets enable row level security;
alter table public.help_interactions enable row level security;

create policy "Professionals can read active help articles"
on public.help_articles for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and status = 'activo'
);

create policy "Administrators can read all help articles"
on public.help_articles for select to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'));

create policy "Administrators can create help articles"
on public.help_articles for insert to authenticated
with check (public.current_user_role() in ('administrador', 'super_administrador'));

create policy "Administrators can update help articles"
on public.help_articles for update to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'))
with check (public.current_user_role() in ('administrador', 'super_administrador'));

create policy "Professionals can create own support tickets"
on public.support_tickets for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can read own support tickets"
on public.support_tickets for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Administrators can read support tickets"
on public.support_tickets for select to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'));

create policy "Administrators can update support tickets"
on public.support_tickets for update to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'))
with check (public.current_user_role() in ('administrador', 'super_administrador'));

create policy "Professionals can create own help interactions"
on public.help_interactions for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Administrators can read help interactions"
on public.help_interactions for select to authenticated
using (public.current_user_role() in ('administrador', 'super_administrador'));

revoke delete on public.help_articles from authenticated, anon;
revoke delete on public.support_tickets from authenticated, anon;
revoke update, delete on public.help_interactions from authenticated, anon;
