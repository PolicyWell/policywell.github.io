-- policy_analyses: derived intelligence outputs (not raw facts).

create table public.policy_analyses (
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
  'SENSITIVE: derived analysis results. Separate from opportunities and policy_facts.';
