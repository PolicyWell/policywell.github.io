-- Strict RLS for PolicyWell insurance data.
-- Principles:
--   * Consumers: own profile + own cases + case-linked rows
--   * Producers: only cases explicitly assigned to them
--   * Agency admins: architecture hook only (no org membership table yet)
--   * PolicyWell admins: service_role / backend only — no client-side RLS bypass
--   * Storage: private bucket; uploads limited to authorized case paths

-- ---------------------------------------------------------------------------
-- Access helpers (no client admin bypass)
-- ---------------------------------------------------------------------------

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

-- Agency-admin hook: reserved until organization membership exists in-repo.
-- Always false today so agency_admin cannot browse unrelated cases.
create or replace function public.is_agency_admin_for_case(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select false
  -- Future: join organization_memberships / agency_cases when those tables exist.
  -- and exists (
  --   select 1 from public.organization_memberships m
  --   join public.insurance_cases c on c.organization_id = m.organization_id
  --   where m.user_id = auth.uid()
  --     and m.role = 'agency_admin'
  --     and c.id = p_case_id
  -- )
$$;

comment on function public.is_agency_admin_for_case(uuid) is
  'Architecture hook for agency-scoped admin access. Returns false until organization membership tables exist.';

revoke all on function public.is_agency_admin_for_case(uuid) from public;
revoke all on function public.is_agency_admin_for_case(uuid) from anon;
grant execute on function public.is_agency_admin_for_case(uuid) to authenticated;

-- Case access for authenticated clients: owner OR assigned producer OR future agency hook.
-- Intentionally omits policywell_admin — admins use service_role (bypasses RLS).
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

-- Keep helper for server-side/trigger introspection, but never grant to Data API roles.
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

comment on function public.is_policywell_admin() is
  'Server-side only. Not granted to anon/authenticated. PolicyWell admin data access uses service_role (RLS bypass), never a client policy OR.';

-- Role changes require backend context (no end-user JWT). Blocks client self-escalation
-- and removes client-side admin role edits.
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

-- ---------------------------------------------------------------------------
-- Recreate table policies without client admin bypass
-- ---------------------------------------------------------------------------

-- profiles: own row only
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists profiles_delete on public.profiles;
-- No authenticated delete policy: profile deletion is Auth/cascade + service_role.

-- insurance_cases
drop policy if exists insurance_cases_select on public.insurance_cases;
create policy insurance_cases_select on public.insurance_cases
  for select to authenticated
  using (
    (select auth.uid()) = owner_user_id
    or (select auth.uid()) = assigned_producer_id
    or public.is_agency_admin_for_case(id)
  );

drop policy if exists insurance_cases_insert on public.insurance_cases;
create policy insurance_cases_insert on public.insurance_cases
  for insert to authenticated
  with check ((select auth.uid()) = owner_user_id);

drop policy if exists insurance_cases_update on public.insurance_cases;
create policy insurance_cases_update on public.insurance_cases
  for update to authenticated
  using (
    (select auth.uid()) = owner_user_id
    or (select auth.uid()) = assigned_producer_id
  )
  with check (
    (select auth.uid()) = owner_user_id
    or (select auth.uid()) = assigned_producer_id
  );

drop policy if exists insurance_cases_delete on public.insurance_cases;
create policy insurance_cases_delete on public.insurance_cases
  for delete to authenticated
  using ((select auth.uid()) = owner_user_id);

-- documents
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
  for select to authenticated
  using (public.is_case_accessible(case_id));

drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents
  for insert to authenticated
  with check (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = uploaded_by
  );

drop policy if exists documents_update on public.documents;
create policy documents_update on public.documents
  for update to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents
  for delete to authenticated
  using (public.is_case_accessible(case_id));

-- ingestions
drop policy if exists ingestions_all on public.ingestions;
create policy ingestions_all on public.ingestions
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

-- policies
drop policy if exists policies_all on public.policies;
create policy policies_all on public.policies
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

-- policy_facts
drop policy if exists policy_facts_all on public.policy_facts;
create policy policy_facts_all on public.policy_facts
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

-- policy_ledgers
drop policy if exists policy_ledgers_all on public.policy_ledgers;
create policy policy_ledgers_all on public.policy_ledgers
  for all to authenticated
  using (
    exists (
      select 1
      from public.policies p
      where p.id = policy_id
        and public.is_case_accessible(p.case_id)
    )
  )
  with check (
    exists (
      select 1
      from public.policies p
      where p.id = policy_id
        and public.is_case_accessible(p.case_id)
    )
  );

-- policy_analyses
drop policy if exists policy_analyses_all on public.policy_analyses;
create policy policy_analyses_all on public.policy_analyses
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

-- opportunities
drop policy if exists opportunities_all on public.opportunities;
create policy opportunities_all on public.opportunities
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

-- conversations: case participants only (owner / assigned producer via is_case_accessible)
drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select to authenticated
  using (public.is_case_accessible(case_id));

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert to authenticated
  with check (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  );

drop policy if exists conversations_update on public.conversations;
create policy conversations_update on public.conversations
  for update to authenticated
  using (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  )
  with check (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  );

drop policy if exists conversations_delete on public.conversations;
create policy conversations_delete on public.conversations
  for delete to authenticated
  using (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  );

-- audit_events: own rows only (admin review via service_role)
drop policy if exists audit_events_select on public.audit_events;
create policy audit_events_select on public.audit_events
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists audit_events_insert on public.audit_events;
create policy audit_events_insert on public.audit_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Private storage bucket for policy documents
-- Path convention: {case_id}/...  (first folder = insurance_cases.id)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'policy-documents',
  'policy-documents',
  false,
  52428800,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/png',
    'image/jpeg',
    'message/rfc822'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

comment on function public.is_case_accessible(uuid) is
  'True when auth.uid() owns the case or is the assigned producer (or future agency-admin hook). Used by table RLS and storage path checks.';

create or replace function public.is_policy_document_path_accessible(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    object_name is not null
    and (storage.foldername(object_name))[1] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.is_case_accessible(((storage.foldername(object_name))[1])::uuid);
$$;

revoke all on function public.is_policy_document_path_accessible(text) from public;
revoke all on function public.is_policy_document_path_accessible(text) from anon;
grant execute on function public.is_policy_document_path_accessible(text) to authenticated;

drop policy if exists policy_docs_storage_select on storage.objects;
create policy policy_docs_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  );

drop policy if exists policy_docs_storage_insert on storage.objects;
create policy policy_docs_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  );

drop policy if exists policy_docs_storage_update on storage.objects;
create policy policy_docs_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  )
  with check (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  );

drop policy if exists policy_docs_storage_delete on storage.objects;
create policy policy_docs_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  );
