-- PolicyWell Commercial V1 schema
-- Imperative migration (schema_paths empty). Demo app remains localStorage-first;
-- this prepares Postgres + private Storage when Auth is enabled.

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.commercial_account_status as enum (
    'prospect',
    'diligence',
    'submission_ready',
    'in_market',
    'quoted',
    'bound',
    'renewal',
    'inactive'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.commercial_doc_classification as enum (
    'policy',
    'loss_run',
    'financial_statement',
    'statement_of_values',
    'application',
    'vehicle_schedule',
    'property_schedule',
    'claims_document',
    'contract',
    'cyber_questionnaire',
    'environmental_questionnaire',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.diligence_severity as enum (
    'critical',
    'high',
    'medium',
    'low'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.diligence_status as enum (
    'open',
    'in_progress',
    'resolved',
    'waived',
    'blocked'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.diligence_category as enum (
    'loss_runs',
    'statement_of_values',
    'questionnaire',
    'schedule',
    'financials',
    'policy',
    'application',
    'other'
  );
exception when duplicate_object then null;
end $$;

-- Commercial accounts
create table if not exists public.commercial_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users (id) on delete set null,
  company_name text not null,
  industry text,
  headquarters text,
  annual_revenue numeric,
  employee_count integer,
  current_premium numeric,
  renewal_date date,
  assigned_producer text,
  account_manager text,
  account_status public.commercial_account_status not null default 'prospect',
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  locations jsonb not null default '[]'::jsonb,
  extracted jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commercial_accounts_owner_idx
  on public.commercial_accounts (owner_user_id);
create index if not exists commercial_accounts_renewal_idx
  on public.commercial_accounts (renewal_date);

-- Private commercial documents (metadata; bytes in Storage bucket)
create table if not exists public.commercial_documents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.commercial_accounts (id) on delete cascade,
  uploaded_by uuid references auth.users (id) on delete set null,
  filename text not null,
  classification public.commercial_doc_classification not null default 'other',
  mime_type text not null,
  storage_path text not null,
  storage_visibility text not null default 'private' check (storage_visibility = 'private'),
  ocr_text text,
  page_count integer,
  overall_confidence numeric,
  verified boolean not null default false,
  source_channel text not null default 'upload',
  extracted_fields jsonb not null default '{}'::jsonb,
  searchable_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commercial_documents_account_idx
  on public.commercial_documents (account_id);
create index if not exists commercial_documents_class_idx
  on public.commercial_documents (classification);

-- Provenanced extracted field rows (material fields)
create table if not exists public.commercial_extracted_fields (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.commercial_accounts (id) on delete cascade,
  document_id uuid references public.commercial_documents (id) on delete set null,
  field_key text not null,
  field_value text,
  confidence numeric not null default 0,
  page_number integer,
  source_excerpt text,
  created_at timestamptz not null default now()
);

create index if not exists commercial_extracted_fields_account_idx
  on public.commercial_extracted_fields (account_id, field_key);

-- Normalized program coverages
create table if not exists public.commercial_coverages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.commercial_accounts (id) on delete cascade,
  line text not null,
  carrier text,
  policy_number text,
  product_name text,
  occurrence_limit numeric,
  aggregate_limit numeric,
  deductible numeric,
  annual_premium numeric,
  effective_date date,
  expiration_date date,
  status text not null default 'not_on_file',
  document_id uuid references public.commercial_documents (id) on delete set null,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, line)
);

create index if not exists commercial_coverages_account_idx
  on public.commercial_coverages (account_id);

-- Diligence checklist
create table if not exists public.commercial_diligence_items (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.commercial_accounts (id) on delete cascade,
  title text not null,
  description text,
  severity public.diligence_severity not null default 'medium',
  category public.diligence_category not null default 'other',
  status public.diligence_status not null default 'open',
  assigned_user_id uuid references auth.users (id) on delete set null,
  assigned_user_name text,
  due_date date,
  source text not null default 'diligence_engine',
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commercial_diligence_account_status_idx
  on public.commercial_diligence_items (account_id, status);

-- Loss events + discrepancies
create table if not exists public.commercial_loss_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.commercial_accounts (id) on delete cascade,
  loss_date date,
  line text,
  description text,
  amount numeric,
  status text not null default 'closed',
  source_document_id uuid references public.commercial_documents (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.commercial_loss_run_discrepancies (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.commercial_accounts (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'unresolved',
  source_document_id uuid references public.commercial_documents (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists commercial_accounts_updated_at on public.commercial_accounts;
create trigger commercial_accounts_updated_at
  before update on public.commercial_accounts
  for each row execute function public.set_updated_at();

drop trigger if exists commercial_documents_updated_at on public.commercial_documents;
create trigger commercial_documents_updated_at
  before update on public.commercial_documents
  for each row execute function public.set_updated_at();

drop trigger if exists commercial_coverages_updated_at on public.commercial_coverages;
create trigger commercial_coverages_updated_at
  before update on public.commercial_coverages
  for each row execute function public.set_updated_at();

drop trigger if exists commercial_diligence_updated_at on public.commercial_diligence_items;
create trigger commercial_diligence_updated_at
  before update on public.commercial_diligence_items
  for each row execute function public.set_updated_at();

-- RLS: owner-scoped. TO authenticated + ownership predicate (not role-only).
alter table public.commercial_accounts enable row level security;
alter table public.commercial_documents enable row level security;
alter table public.commercial_extracted_fields enable row level security;
alter table public.commercial_coverages enable row level security;
alter table public.commercial_diligence_items enable row level security;
alter table public.commercial_loss_events enable row level security;
alter table public.commercial_loss_run_discrepancies enable row level security;

create or replace function public.is_commercial_account_owner(account uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.commercial_accounts a
    where a.id = account
      and a.owner_user_id = (select auth.uid())
  );
$$;

drop policy if exists commercial_accounts_select on public.commercial_accounts;
create policy commercial_accounts_select on public.commercial_accounts
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists commercial_accounts_insert on public.commercial_accounts;
create policy commercial_accounts_insert on public.commercial_accounts
  for insert to authenticated
  with check ((select auth.uid()) = owner_user_id);

drop policy if exists commercial_accounts_update on public.commercial_accounts;
create policy commercial_accounts_update on public.commercial_accounts
  for update to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

drop policy if exists commercial_accounts_delete on public.commercial_accounts;
create policy commercial_accounts_delete on public.commercial_accounts
  for delete to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists commercial_documents_all on public.commercial_documents;
create policy commercial_documents_all on public.commercial_documents
  for all to authenticated
  using (public.is_commercial_account_owner(account_id))
  with check (public.is_commercial_account_owner(account_id));

drop policy if exists commercial_extracted_fields_all on public.commercial_extracted_fields;
create policy commercial_extracted_fields_all on public.commercial_extracted_fields
  for all to authenticated
  using (public.is_commercial_account_owner(account_id))
  with check (public.is_commercial_account_owner(account_id));

drop policy if exists commercial_coverages_all on public.commercial_coverages;
create policy commercial_coverages_all on public.commercial_coverages
  for all to authenticated
  using (public.is_commercial_account_owner(account_id))
  with check (public.is_commercial_account_owner(account_id));

drop policy if exists commercial_diligence_all on public.commercial_diligence_items;
create policy commercial_diligence_all on public.commercial_diligence_items
  for all to authenticated
  using (public.is_commercial_account_owner(account_id))
  with check (public.is_commercial_account_owner(account_id));

drop policy if exists commercial_loss_events_all on public.commercial_loss_events;
create policy commercial_loss_events_all on public.commercial_loss_events
  for all to authenticated
  using (public.is_commercial_account_owner(account_id))
  with check (public.is_commercial_account_owner(account_id));

drop policy if exists commercial_loss_disc_all on public.commercial_loss_run_discrepancies;
create policy commercial_loss_disc_all on public.commercial_loss_run_discrepancies
  for all to authenticated
  using (public.is_commercial_account_owner(account_id))
  with check (public.is_commercial_account_owner(account_id));

-- Grants for Data API exposure
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.commercial_accounts to authenticated;
grant select, insert, update, delete on public.commercial_documents to authenticated;
grant select, insert, update, delete on public.commercial_extracted_fields to authenticated;
grant select, insert, update, delete on public.commercial_coverages to authenticated;
grant select, insert, update, delete on public.commercial_diligence_items to authenticated;
grant select, insert, update, delete on public.commercial_loss_events to authenticated;
grant select, insert, update, delete on public.commercial_loss_run_discrepancies to authenticated;

-- Private storage bucket for commercial documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'commercial-documents',
  'commercial-documents',
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

-- Storage policies: path convention commercial/{account_id}/...
drop policy if exists commercial_docs_storage_select on storage.objects;
create policy commercial_docs_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'commercial-documents'
    and public.is_commercial_account_owner((storage.foldername(name))[1]::uuid)
  );

drop policy if exists commercial_docs_storage_insert on storage.objects;
create policy commercial_docs_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'commercial-documents'
    and public.is_commercial_account_owner((storage.foldername(name))[1]::uuid)
  );

drop policy if exists commercial_docs_storage_update on storage.objects;
create policy commercial_docs_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'commercial-documents'
    and public.is_commercial_account_owner((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'commercial-documents'
    and public.is_commercial_account_owner((storage.foldername(name))[1]::uuid)
  );

drop policy if exists commercial_docs_storage_delete on storage.objects;
create policy commercial_docs_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'commercial-documents'
    and public.is_commercial_account_owner((storage.foldername(name))[1]::uuid)
  );
