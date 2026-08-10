-- Row Level Security: owner / assigned producer only. No client admin bypass.
-- PolicyWell admins use service_role (bypasses RLS) on the server.

alter table public.profiles enable row level security;
alter table public.insurance_cases enable row level security;
alter table public.documents enable row level security;
alter table public.ingestions enable row level security;
alter table public.policies enable row level security;
alter table public.policy_facts enable row level security;
alter table public.policy_ledgers enable row level security;
alter table public.policy_analyses enable row level security;
alter table public.opportunities enable row level security;
alter table public.conversations enable row level security;
alter table public.feedback enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy insurance_cases_select on public.insurance_cases
  for select to authenticated
  using (
    (select auth.uid()) = owner_user_id
    or (select auth.uid()) = assigned_producer_id
    or public.is_agency_admin_for_case(id)
  );

create policy insurance_cases_insert on public.insurance_cases
  for insert to authenticated
  with check ((select auth.uid()) = owner_user_id);

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

create policy insurance_cases_delete on public.insurance_cases
  for delete to authenticated
  using ((select auth.uid()) = owner_user_id);

create policy documents_select on public.documents
  for select to authenticated
  using (public.is_case_accessible(case_id));

create policy documents_insert on public.documents
  for insert to authenticated
  with check (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = uploaded_by
  );

create policy documents_update on public.documents
  for update to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

create policy documents_delete on public.documents
  for delete to authenticated
  using (public.is_case_owner(case_id));

create policy ingestions_select on public.ingestions
  for select to authenticated
  using (public.is_case_accessible(case_id));

create policy ingestions_insert on public.ingestions
  for insert to authenticated
  with check (public.is_case_accessible(case_id));

create policy ingestions_update on public.ingestions
  for update to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

create policy ingestions_delete on public.ingestions
  for delete to authenticated
  using (public.is_case_owner(case_id));

create policy policies_all on public.policies
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

create policy policy_facts_all on public.policy_facts
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

create policy policy_ledgers_all on public.policy_ledgers
  for all to authenticated
  using (
    exists (
      select 1 from public.policies p
      where p.id = policy_id and public.is_case_accessible(p.case_id)
    )
  )
  with check (
    exists (
      select 1 from public.policies p
      where p.id = policy_id and public.is_case_accessible(p.case_id)
    )
  );

create policy policy_analyses_all on public.policy_analyses
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

create policy opportunities_all on public.opportunities
  for all to authenticated
  using (public.is_case_accessible(case_id))
  with check (public.is_case_accessible(case_id));

create policy conversations_select on public.conversations
  for select to authenticated
  using (public.is_case_accessible(case_id));

create policy conversations_insert on public.conversations
  for insert to authenticated
  with check (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  );

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

create policy conversations_delete on public.conversations
  for delete to authenticated
  using (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  );

create policy feedback_select on public.feedback
  for select to authenticated
  using (public.is_case_accessible(case_id));

create policy feedback_insert on public.feedback
  for insert to authenticated
  with check (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  );

create policy feedback_update on public.feedback
  for update to authenticated
  using (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  )
  with check (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  );

create policy audit_events_select on public.audit_events
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy audit_events_insert on public.audit_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.insurance_cases to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.ingestions to authenticated;
grant select, insert, update, delete on public.policies to authenticated;
grant select, insert, update, delete on public.policy_facts to authenticated;
grant select, insert, update, delete on public.policy_ledgers to authenticated;
grant select, insert, update, delete on public.policy_analyses to authenticated;
grant select, insert, update, delete on public.opportunities to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, update on public.feedback to authenticated;
grant select, insert on public.audit_events to authenticated;
