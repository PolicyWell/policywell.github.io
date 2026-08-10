-- Schema-first delta: align live DB with supabase/schemas/ desired state.
-- Does not recreate existing domain tables. Adds feedback, precedence helpers,
-- additional indexes, tighter document/ingestion delete RLS, storage path v2.

-- ---------------------------------------------------------------------------
-- Enum + feedback table
-- ---------------------------------------------------------------------------

do $$
begin
  create type public.feedback_kind as enum (
    'accurate',
    'needs_correction',
    'not_helpful'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  recommendation_id text,
  analysis_id uuid references public.policy_analyses (id) on delete set null,
  kind public.feedback_kind not null,
  correction text,
  created_at timestamptz not null default now()
);

comment on table public.feedback is
  'SENSITIVE: human feedback. Logged for audit; must not silently rewrite scoring engines.';

-- ---------------------------------------------------------------------------
-- Document precedence + fact supersession (history retained)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Indexes (access patterns from schemas/14_indexes.sql)
-- ---------------------------------------------------------------------------

create index if not exists insurance_cases_status_idx
  on public.insurance_cases (status);

create index if not exists documents_uploaded_by_idx
  on public.documents (uploaded_by);

create index if not exists documents_document_type_idx
  on public.documents (document_type);

create index if not exists ingestions_document_id_idx
  on public.ingestions (document_id);

create index if not exists policy_facts_document_id_idx
  on public.policy_facts (document_id);

create index if not exists policy_facts_case_field_path_idx
  on public.policy_facts (case_id, field_path);

create index if not exists policy_facts_verification_status_idx
  on public.policy_facts (verification_status);

create index if not exists policy_ledgers_document_id_idx
  on public.policy_ledgers (document_id);

create index if not exists policy_analyses_case_id_idx
  on public.policy_analyses (case_id);

create index if not exists policy_analyses_policy_id_idx
  on public.policy_analyses (policy_id);

create index if not exists opportunities_policy_id_idx
  on public.opportunities (policy_id);

create index if not exists conversations_user_id_idx
  on public.conversations (user_id);

create index if not exists feedback_case_id_idx
  on public.feedback (case_id);

create index if not exists feedback_user_id_idx
  on public.feedback (user_id);

-- ---------------------------------------------------------------------------
-- RLS: feedback + tighten document/ingestion deletes to case owner
-- ---------------------------------------------------------------------------

alter table public.feedback enable row level security;

drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents
  for delete to authenticated
  using (public.is_case_owner(case_id));

drop policy if exists ingestions_all on public.ingestions;
drop policy if exists ingestions_select on public.ingestions;
drop policy if exists ingestions_insert on public.ingestions;
drop policy if exists ingestions_update on public.ingestions;
drop policy if exists ingestions_delete on public.ingestions;

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

drop policy if exists feedback_select on public.feedback;
create policy feedback_select on public.feedback
  for select to authenticated
  using (public.is_case_accessible(case_id));

drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback
  for insert to authenticated
  with check (
    public.is_case_accessible(case_id)
    and (select auth.uid()) = user_id
  );

drop policy if exists feedback_update on public.feedback;
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

grant select, insert, update on public.feedback to authenticated;

-- ---------------------------------------------------------------------------
-- Storage path v2: {owner_user_id}/{case_id}/{document_id}/{safe_filename}
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'policy-documents',
  'policy-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/tiff'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

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
    and (storage.foldername(object_name))[2] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(object_name))[3] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and exists (
      select 1
      from public.insurance_cases c
      where c.id = ((storage.foldername(object_name))[2])::uuid
        and c.owner_user_id = ((storage.foldername(object_name))[1])::uuid
        and public.is_case_accessible(c.id)
    );
$$;

revoke all on function public.is_policy_document_path_accessible(text) from public;
revoke all on function public.is_policy_document_path_accessible(text) from anon;
grant execute on function public.is_policy_document_path_accessible(text) to authenticated;

create or replace function public.is_policy_document_path_owner(object_name text)
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
    and (storage.foldername(object_name))[2] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and ((storage.foldername(object_name))[1])::uuid = (select auth.uid())
    and public.is_case_owner(((storage.foldername(object_name))[2])::uuid);
$$;

revoke all on function public.is_policy_document_path_owner(text) from public;
revoke all on function public.is_policy_document_path_owner(text) from anon;
grant execute on function public.is_policy_document_path_owner(text) to authenticated;

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
    and public.is_policy_document_path_owner(name)
  );
