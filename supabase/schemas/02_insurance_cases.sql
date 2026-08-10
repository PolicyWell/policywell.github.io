-- insurance_cases: root aggregate for case intelligence.

create table public.insurance_cases (
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
  'SENSITIVE: case container (life / annuity / commercial). Root FK for domain records.';
