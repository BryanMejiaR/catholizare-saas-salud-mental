drop policy if exists "Administrators can read all profiles" on public.profiles;

create policy "Administrators can read non-super-admin profiles"
on public.profiles
for select
to authenticated
using (
  public.current_user_role() = 'administrador'
  and role <> 'super_administrador'
);
