-- Shared functions, triggers, and document-precedence helpers.

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), ''),
    'consumer'
  )
  on conflict (id) do update
  set
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

comment on function public.handle_new_user() is
  'Creates public.profiles on auth.users insert. Never copies passwords.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger insurance_cases_updated_at
  before update on public.insurance_cases
  for each row execute function public.set_updated_at();

create trigger policies_updated_at
  before update on public.policies
  for each row execute function public.set_updated_at();

create trigger policy_analyses_updated_at
  before update on public.policy_analyses
  for each row execute function public.set_updated_at();

create or replace function public.profiles_prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and (select auth.uid()) is not null then
    raise exception 'profiles.role may only be changed by server-side admin tooling (service role)';
  end if;
  return new;
end;
$$;

revoke all on function public.profiles_prevent_role_escalation() from public;
revoke all on function public.profiles_prevent_role_escalation() from anon;
revoke all on function public.profiles_prevent_role_escalation() from authenticated;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.profiles_prevent_role_escalation();

-- Document precedence (higher = preferred source of truth for conflicting fields)
-- annual_statement (current carrier statement) > inforce_illustration > policy_contract
-- > original_illustration > application > other
create or replace function public.document_precedence_rank(p_type public.document_type)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_type
    when 'annual_statement'::public.document_type then 100
    when 'inforce_illustration'::public.document_type then 80
    when 'policy_contract'::public.document_type then 60
    when 'original_illustration'::public.document_type then 40
    when 'application'::public.document_type then 20
    else 0
  end;
$$;

revoke all on function public.document_precedence_rank(public.document_type) from public;
revoke all on function public.document_precedence_rank(public.document_type) from anon;
grant execute on function public.document_precedence_rank(public.document_type) to authenticated;

comment on function public.document_precedence_rank(public.document_type) is
  'Source precedence rank. Never delete historical facts; mark superseded instead.';

-- Mark prior facts for the same case+field_path as superseded (keeps history).
create or replace function public.supersede_policy_facts(
  p_case_id uuid,
  p_field_path text,
  p_except_fact_id uuid default null
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.policy_facts f
  set verification_status = 'superseded'::public.fact_verification_status
  where f.case_id = p_case_id
    and f.field_path = p_field_path
    and f.verification_status is distinct from 'superseded'::public.fact_verification_status
    and (p_except_fact_id is null or f.id <> p_except_fact_id);
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.supersede_policy_facts(uuid, text, uuid) from public;
revoke all on function public.supersede_policy_facts(uuid, text, uuid) from anon;
grant execute on function public.supersede_policy_facts(uuid, text, uuid) to authenticated;

create or replace function public.is_case_owner(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.insurance_cases c
    where c.id = p_case_id
      and c.owner_user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_case_owner(uuid) from public;
revoke all on function public.is_case_owner(uuid) from anon;
grant execute on function public.is_case_owner(uuid) to authenticated;

create or replace function public.is_assigned_producer(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.insurance_cases c
    where c.id = p_case_id
      and c.assigned_producer_id = (select auth.uid())
  );
$$;

revoke all on function public.is_assigned_producer(uuid) from public;
revoke all on function public.is_assigned_producer(uuid) from anon;
grant execute on function public.is_assigned_producer(uuid) to authenticated;

create or replace function public.is_agency_admin_for_case(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select false;
$$;

revoke all on function public.is_agency_admin_for_case(uuid) from public;
revoke all on function public.is_agency_admin_for_case(uuid) from anon;
grant execute on function public.is_agency_admin_for_case(uuid) to authenticated;

create or replace function public.is_case_accessible(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_case_owner(p_case_id)
    or public.is_assigned_producer(p_case_id)
    or public.is_agency_admin_for_case(p_case_id);
$$;

revoke all on function public.is_case_accessible(uuid) from public;
revoke all on function public.is_case_accessible(uuid) from anon;
grant execute on function public.is_case_accessible(uuid) to authenticated;

create or replace function public.is_policywell_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role = 'policywell_admin'::public.profile_role
     from public.profiles p
     where p.id = (select auth.uid())),
    false
  );
$$;

revoke all on function public.is_policywell_admin() from public;
revoke all on function public.is_policywell_admin() from anon;
revoke all on function public.is_policywell_admin() from authenticated;

create or replace function public.current_profile_role()
returns public.profile_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid());
$$;

revoke all on function public.current_profile_role() from public;
revoke all on function public.current_profile_role() from anon;
grant execute on function public.current_profile_role() to authenticated;
