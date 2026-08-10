-- feedback: human feedback on recommendations/analyses (does not auto-mutate scores).

create table public.feedback (
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
