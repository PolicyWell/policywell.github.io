-- policies: canonical best-known policy state for a case (not raw evidence).

create table public.policies (
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
  'SENSITIVE: canonical best-known policy state derived from verified facts. Not a dump of raw extraction.';

comment on column public.policies.policy_number_masked is
  'Prefer masked identifiers. Avoid full policy numbers.';
