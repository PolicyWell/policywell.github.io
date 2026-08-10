-- policy_facts: evidence extracted from documents. Never delete when superseded — mark status.

create table public.policy_facts (
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
  'SENSITIVE: provenanced evidence. When newer docs arrive, mark older facts superseded — do not delete history.';
