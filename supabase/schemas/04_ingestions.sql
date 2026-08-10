-- ingestions: processing lifecycle for a document (queued → …). No AI payload here.

create table public.ingestions (
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
  'SENSITIVE: document processing lifecycle records. Separate from documents and policy_facts.';
