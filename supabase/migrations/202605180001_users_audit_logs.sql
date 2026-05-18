create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  role public.user_role,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  result text not null check (result in ('success', 'denied', 'error')),
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_logs_user_id_idx on public.audit_logs(user_id);
create index audit_logs_action_idx on public.audit_logs(action);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

create policy "Super administrators can read audit logs"
on public.audit_logs
for select
to authenticated
using (public.current_user_role() = 'super_administrador');

-- Audit logs are append-only and written by trusted server code with service role.
revoke update, delete on public.audit_logs from authenticated;
revoke update, delete on public.audit_logs from anon;
