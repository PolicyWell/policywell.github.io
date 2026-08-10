-- PolicyWell data foundation
-- Identity: Supabase Auth owns credentials (auth.users). Never store passwords here.
-- Imperative migration (schema_paths empty). Apply via Supabase CLI / MCP only.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.profile_role as enum (
    'consumer',
    'producer',
    'agency_admin',
    'policywell_admin'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.insurance_case_type as enum (
    'life',
    'annuity',
    'commercial'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.insurance_case_status as enum (
    'created',
    'uploading',
    'ingesting',
    'needs_information',
    'ready_for_analysis',
    'analyzing',
    'analyzed',
    'review_required',
    'archived'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.document_type as enum (
    'application',
    'original_illustration',
    'inforce_illustration',
    'annual_statement',
    'policy_contract',
    'amendment',
    'underwriting_document',
    'commercial_policy',
    'loss_run',
    'unknown'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.document_status as enum (
    'uploaded',
    'processing',
    'ready',
    'failed',
    'archived'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.ingestion_status as enum (
    'queued',
    'processing',
    'completed',
    'failed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.fact_type as enum (
    'fact',
    'calculation',
    'inference'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.fact_verification_status as enum (
    'document_extracted',
    'user_verified',
    'producer_verified',
    'superseded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.opportunity_priority as enum (
    'low',
    'medium',
    'high',
    'critical'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.opportunity_status as enum (
    'open',
    'in_review',
    'accepted',
    'dismissed',
    'completed'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- updated_at helper (shared)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users — no password columns)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  role public.profile_role not null default 'consumer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'SENSITIVE: user PII (name, phone) linked 1:1 to auth.users. Credentials live only in Supabase Auth — never store passwords or password hashes here.';

comment on column public.profiles.id is
  'Same UUID as auth.users.id. Supabase Auth is the identity provider.';

comment on column public.profiles.role is
  'Authorization role stored in Postgres (not JWT user_metadata). Values: consumer, producer, agency_admin, policywell_admin.';

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision profile row when Auth creates a user (no credentials copied).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'consumer')
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- insurance_cases
-- ---------------------------------------------------------------------------

create table if not exists public.insurance_cases (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  assigned_producer_id uuid references auth.users (id) on delete set null,
  case_type public.insurance_case_type not null,
  status public.insurance_case_status not null default 'created',
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.insurance_cases is
  'SENSITIVE: insurance case intelligence container (life / annuity / commercial). Access is owner, assigned producer, or policywell_admin.';

drop trigger if exists insurance_cases_updated_at on public.insurance_cases;
create trigger insurance_cases_updated_at
  before update on public.insurance_cases
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete restrict,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text not null,
  mime_type text,
  document_type public.document_type not null default 'unknown',
  document_date date,
  page_count integer,
  sha256 text,
  status public.document_status not null default 'uploaded',
  created_at timestamptz not null default now(),
  constraint documents_page_count_nonnegative check (page_count is null or page_count >= 0),
  constraint documents_storage_path_nonempty check (char_length(storage_path) > 0)
);

comment on table public.documents is
  'SENSITIVE: private policy document metadata and Storage object pointers. File bytes live in private buckets; never expose storage_path without authorization.';

comment on column public.documents.sha256 is
  'Optional content hash for dedupe / integrity. Not a credential.';

-- ---------------------------------------------------------------------------
-- ingestions
-- ---------------------------------------------------------------------------

create table if not exists public.ingestions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  status public.ingestion_status not null default 'queued',
  parser_version text,
  model_name text,
  started_at timestamptz,
  completed_at timestamptz,
  processing_ms integer,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  constraint ingestions_processing_ms_nonnegative check (
    processing_ms is null or processing_ms >= 0
  )
);

comment on table public.ingestions is
  'SENSITIVE: live ingestion job records for private documents (status, model, errors). May include operational diagnostics.';

-- ---------------------------------------------------------------------------
-- policies
-- ---------------------------------------------------------------------------

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  insured_name text,
  carrier text,
  product text,
  product_type text,
  policy_number_masked text,
  state text,
  policy_status text,
  issue_date date,
  issue_age integer,
  risk_class text,
  tobacco_status text,
  death_benefit numeric,
  death_benefit_option text,
  premium_mode text,
  modal_premium numeric,
  annualized_premium numeric,
  no_lapse_annual_premium numeric,
  mec_status boolean,
  current_data_as_of date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.policies is
  'SENSITIVE: in-force / illustrated policy identity and premium/benefit fields. Store only masked policy numbers when possible.';

comment on column public.policies.policy_number_masked is
  'Prefer masked identifiers (e.g. ****1234). Avoid full policy numbers in this column.';

drop trigger if exists policies_updated_at on public.policies;
create trigger policies_updated_at
  before update on public.policies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- policy_facts
-- ---------------------------------------------------------------------------

create table if not exists public.policy_facts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  policy_id uuid references public.policies (id) on delete set null,
  field_path text not null,
  value_json jsonb not null,
  source_page integer,
  source_excerpt text,
  confidence numeric,
  fact_type public.fact_type not null default 'fact',
  verification_status public.fact_verification_status not null default 'document_extracted',
  created_at timestamptz not null default now(),
  constraint policy_facts_confidence_range check (
    confidence is null or (confidence >= 0 and confidence <= 1)
  ),
  constraint policy_facts_source_page_positive check (
    source_page is null or source_page > 0
  )
);

comment on table public.policy_facts is
  'SENSITIVE: provenanced extraction / calculation / inference facts from private policy documents. Includes excerpts that may contain PII.';

-- ---------------------------------------------------------------------------
-- policy_ledgers
-- ---------------------------------------------------------------------------

create table if not exists public.policy_ledgers (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  policy_year integer not null,
  attained_age integer,
  annual_premium_outlay numeric,
  guaranteed_accumulation_value numeric,
  guaranteed_surrender_value numeric,
  guaranteed_death_benefit numeric,
  alternate_accumulation_value numeric,
  alternate_surrender_value numeric,
  alternate_death_benefit numeric,
  illustrated_accumulation_value numeric,
  illustrated_surrender_value numeric,
  illustrated_death_benefit numeric,
  created_at timestamptz not null default now(),
  constraint policy_ledgers_policy_year_nonnegative check (policy_year >= 0)
);

comment on table public.policy_ledgers is
  'SENSITIVE: year-by-year illustration / in-force ledger values (guaranteed, alternate, illustrated).';

-- ---------------------------------------------------------------------------
-- policy_analyses
-- ---------------------------------------------------------------------------

create table if not exists public.policy_analyses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  policy_id uuid not null references public.policies (id) on delete cascade,
  analysis_type text not null,
  result_json jsonb not null default '{}'::jsonb,
  requires_current_inforce_illustration boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.policy_analyses is
  'SENSITIVE: case intelligence analysis outputs (JSON). May include recommendations pending human approval.';

drop trigger if exists policy_analyses_updated_at on public.policy_analyses;
create trigger policy_analyses_updated_at
  before update on public.policy_analyses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- opportunities
-- ---------------------------------------------------------------------------

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  policy_id uuid not null references public.policies (id) on delete cascade,
  producer_id uuid references auth.users (id) on delete set null,
  type text not null,
  priority public.opportunity_priority not null default 'medium',
  title text not null,
  client_insight text,
  producer_reason text,
  recommended_action text,
  supporting_fact_ids uuid[] not null default '{}'::uuid[],
  status public.opportunity_status not null default 'open',
  created_at timestamptz not null default now()
);

comment on table public.opportunities is
  'SENSITIVE: producer/client opportunity insights derived from case intelligence. Not for public marketing surfaces.';

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.conversations is
  'SENSITIVE: case-scoped Q&A transcripts (questions + structured answers). May contain personal financial details.';

-- ---------------------------------------------------------------------------
-- audit_events
-- ---------------------------------------------------------------------------

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid references public.insurance_cases (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_events is
  'SENSITIVE: append-oriented audit trail of authenticated actions on insurance resources. Retain for compliance review.';

-- ---------------------------------------------------------------------------
-- Indexes (requested + essential FK helpers)
-- ---------------------------------------------------------------------------

create index if not exists insurance_cases_owner_user_id_idx
  on public.insurance_cases (owner_user_id);

create index if not exists insurance_cases_assigned_producer_id_idx
  on public.insurance_cases (assigned_producer_id);

create index if not exists documents_case_id_idx
  on public.documents (case_id);

create index if not exists ingestions_case_id_idx
  on public.ingestions (case_id);

create index if not exists ingestions_status_idx
  on public.ingestions (status);

create index if not exists policies_case_id_idx
  on public.policies (case_id);

create index if not exists policy_facts_case_id_idx
  on public.policy_facts (case_id);

create index if not exists policy_facts_policy_id_idx
  on public.policy_facts (policy_id);

create index if not exists policy_ledgers_policy_id_idx
  on public.policy_ledgers (policy_id);

create index if not exists opportunities_case_id_idx
  on public.opportunities (case_id);

create index if not exists conversations_case_id_idx
  on public.conversations (case_id);

create index if not exists audit_events_user_id_idx
  on public.audit_events (user_id);

create index if not exists audit_events_case_id_idx
  on public.audit_events (case_id);

-- ---------------------------------------------------------------------------
-- RLS helpers (SECURITY DEFINER + fixed search_path; not for arbitrary RPC abuse)
-- ---------------------------------------------------------------------------

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
grant execute on function public.is_policywell_admin() to authenticated;

create or replace function public.is_case_accessible(p_case_id uuid)
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
      and (
        c.owner_user_id = (select auth.uid())
        or c.assigned_producer_id = (select auth.uid())
        or public.is_policywell_admin()
      )
  );
$$;

revoke all on function public.is_case_accessible(uuid) from public;
revoke all on function public.is_case_accessible(uuid) from anon;
grant execute on function public.is_case_accessible(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

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
alter table public.audit_events enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    (select auth.uid()) = id
    or public.is_policywell_admin()
  );

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (
    (select auth.uid()) = id
    or public.is_policywell_admin()
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (
    (select auth.uid()) = id
    or public.is_policywell_admin()
  )
  with check (
    (select auth.uid()) = id
    or public.is_policywell_admin()
  );

-- Non-admins cannot self-escalate role (Auth still owns credentials).
create or replace function public.profiles_prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and not public.is_policywell_admin() then
    raise exception 'Only policywell_admin can change profiles.role';
  end if;
  return new;
end;
$$;

revoke all on function public.profiles_prevent_role_escalation() from public;
revoke all on function public.profiles_prevent_role_escalation() from anon;
revoke all on function public.profiles_prevent_role_escalation() from authenticated;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.profiles_prevent_role_escalation();

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated
  using (public.is_policywell_admin());

-- insurance_cases
drop policy if exists insurance_cases_select on public.insurance_cases;
create policy insurance_cases_select on public.insurance_cases
  for select to authenticated
  using (
    (select auth.uid()) = owner_user_id
    or (select auth.uid()) = assigned_producer_id
    or public.is_policywell_admin()
  );

drop policy if exists insurance_cases_insert on public.insurance_cases;
create policy insurance_cases_insert on public.insurance_cases
  for insert to authenticated
  with check (
    (select auth.uid()) = owner_user_id
    or public.is_policywell_admin()
  );

drop policy if exists insurance_cases_update on public.insurance_cases;
create policy insurance_cases_update on public.insurance_cases
  for update to authenticated
  using (
    (select auth.uid()) = owner_user_id
    or (select auth.uid()) = assigned_producer_id
    or public.is_policywell_admin()
  )
  with check (
    (select auth.uid()) = owner_user_id
    or (select auth.uid()) = assigned_producer_id
    or public.is_policywell_admin()
  );

drop policy if exists insurance_cases_delete on public.insurance_cases;
create policy insurance_cases_delete on public.insurance_cases
  for delete to authenticated
  using (
    (select auth.uid()) = owner_user_id
    or public.is_policywell_admin()
  );

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

-- policy_ledgers (via policy → case)
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

-- conversations
drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select to authenticated
  using (
    public.is_case_accessible(case_id)
    and (
      (select auth.uid()) = user_id
      or public.is_policywell_admin()
      or public.current_profile_role() in (
        'producer'::public.profile_role,
        'agency_admin'::public.profile_role
      )
    )
  );

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
    and (
      (select auth.uid()) = user_id
      or public.is_policywell_admin()
    )
  )
  with check (
    public.is_case_accessible(case_id)
    and (
      (select auth.uid()) = user_id
      or public.is_policywell_admin()
    )
  );

drop policy if exists conversations_delete on public.conversations;
create policy conversations_delete on public.conversations
  for delete to authenticated
  using (
    (select auth.uid()) = user_id
    or public.is_policywell_admin()
  );

-- audit_events: users insert/select own; admins read all; no client updates/deletes
drop policy if exists audit_events_select on public.audit_events;
create policy audit_events_select on public.audit_events
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or public.is_policywell_admin()
  );

drop policy if exists audit_events_insert on public.audit_events;
create policy audit_events_insert on public.audit_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Data API grants (RLS still enforces row access)
-- ---------------------------------------------------------------------------

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
grant select, insert on public.audit_events to authenticated;
