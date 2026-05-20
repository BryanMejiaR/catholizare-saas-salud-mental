do $$
begin
  create type public.audit_log_result as enum ('success', 'denied', 'error');
exception
  when duplicate_object then null;
end $$;

alter table public.audit_logs
drop constraint if exists audit_logs_result_check;

alter table public.audit_logs
alter column result type public.audit_log_result
using result::public.audit_log_result;

alter table public.audit_logs
drop constraint if exists audit_logs_user_id_fkey;

alter table public.audit_logs
add constraint audit_logs_user_id_fkey
foreign key (user_id) references auth.users(id) on delete set null;
