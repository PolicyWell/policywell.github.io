-- Harden foundation helpers after advisor review.
-- - Fix mutable search_path on set_updated_at
-- - Revoke PUBLIC/anon execute on SECURITY DEFINER helpers
-- - Trigger-only functions are not callable via Data API roles

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon;
revoke all on function public.set_updated_at() from authenticated;

-- Trigger-only: Auth signup + role escalation guard
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

revoke all on function public.profiles_prevent_role_escalation() from public;
revoke all on function public.profiles_prevent_role_escalation() from anon;
revoke all on function public.profiles_prevent_role_escalation() from authenticated;

-- RLS helpers: authenticated may execute; anon must not
revoke all on function public.current_profile_role() from public;
revoke all on function public.current_profile_role() from anon;
grant execute on function public.current_profile_role() to authenticated;

revoke all on function public.is_policywell_admin() from public;
revoke all on function public.is_policywell_admin() from anon;
grant execute on function public.is_policywell_admin() to authenticated;

revoke all on function public.is_case_accessible(uuid) from public;
revoke all on function public.is_case_accessible(uuid) from anon;
grant execute on function public.is_case_accessible(uuid) to authenticated;
