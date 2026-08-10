-- opportunities: actionable producer-facing output.

create table public.opportunities (
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
  'SENSITIVE: actionable producer output grounded in supporting_fact_ids.';
