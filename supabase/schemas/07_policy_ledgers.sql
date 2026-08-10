-- policy_ledgers: structured illustration / in-force time series (via policy → case).

create table public.policy_ledgers (
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
  'SENSITIVE: year-by-year ledger values. Connects to insurance_cases via policies.case_id.';
