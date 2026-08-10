-- profiles: 1:1 with auth.users. Auth owns credentials — never store passwords here.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  role public.profile_role not null default 'consumer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'SENSITIVE: user PII linked 1:1 to auth.users. Credentials live only in Supabase Auth.';

comment on column public.profiles.id is
  'Same UUID as auth.users.id.';

comment on column public.profiles.role is
  'Authorization role in Postgres (not JWT user_metadata).';
