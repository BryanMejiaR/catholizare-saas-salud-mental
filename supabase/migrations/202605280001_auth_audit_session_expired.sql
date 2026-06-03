alter type public.auth_audit_event add value if not exists 'session_expired';

create or replace function public.record_session_expired_auth_audit(
  p_reason text,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.auth_audit_logs (
    actor_id,
    event,
    email,
    result,
    ip_address,
    user_agent,
    metadata
  )
  values (
    auth.uid(),
    'session_expired',
    nullif(auth.jwt() ->> 'email', ''),
    'success',
    p_ip_address,
    p_user_agent,
    jsonb_build_object('reason', p_reason)
  );
end;
$$;

revoke all on function public.record_session_expired_auth_audit(text, inet, text) from public;
grant execute on function public.record_session_expired_auth_audit(text, inet, text) to authenticated;
