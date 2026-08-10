-- conversations: case-scoped Q&A transcripts.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.conversations is
  'SENSITIVE: case-scoped Q&A. May contain personal financial details.';
