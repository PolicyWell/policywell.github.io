-- Access requests, quote requests, and issued one-time access codes.
-- Codes are emailed to requesters via Edge Functions (Resend). Never store plaintext.

create extension if not exists "pgcrypto" with schema extensions;

do $$
begin
  create type public.access_request_status as enum (
    'received',
    'code_emailed',
    'email_failed',
    'manual_review'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.quote_request_status as enum (
    'received',
    'confirmation_emailed',
    'email_failed'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.issued_access_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  code_hint text not null,
  surfaces text[] not null default array[
    'demo',
    'product',
    'deck',
    'agent',
    'platform',
    'docs'
  ]::text[],
  source text not null default 'access_request',
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeem_count integer not null default 0,
  created_at timestamptz not null default now(),
  constraint issued_access_codes_email_lower check (email = lower(email)),
  constraint issued_access_codes_code_hash_unique unique (code_hash)
);

create index if not exists issued_access_codes_email_idx
  on public.issued_access_codes (email);

create index if not exists issued_access_codes_expires_at_idx
  on public.issued_access_codes (expires_at);

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  role text,
  surface text not null,
  notes text,
  page_path text,
  status public.access_request_status not null default 'received',
  issued_code_id uuid references public.issued_access_codes (id) on delete set null,
  error_message text,
  created_at timestamptz not null default now(),
  constraint access_requests_email_lower check (email = lower(email))
);

create index if not exists access_requests_email_idx
  on public.access_requests (email);

create index if not exists access_requests_created_at_idx
  on public.access_requests (created_at desc);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  line text not null,
  state text,
  payload jsonb not null default '{}'::jsonb,
  status public.quote_request_status not null default 'received',
  issued_code_id uuid references public.issued_access_codes (id) on delete set null,
  error_message text,
  created_at timestamptz not null default now(),
  constraint quote_requests_email_lower check (email is null or email = lower(email)),
  constraint quote_requests_contact_present check (
    (email is not null and char_length(email) > 0)
    or (phone is not null and char_length(phone) > 0)
  )
);

create index if not exists quote_requests_email_idx
  on public.quote_requests (email);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

comment on table public.issued_access_codes is
  'SENSITIVE: hashed product/docs unlock codes emailed to requesters. Service-role only.';

comment on table public.access_requests is
  'SENSITIVE: inbound product access requests. Service-role write from Edge Functions.';

comment on table public.quote_requests is
  'SENSITIVE: inbound quote / coverage review requests. Service-role write from Edge Functions.';

alter table public.issued_access_codes enable row level security;
alter table public.access_requests enable row level security;
alter table public.quote_requests enable row level security;

-- No anon/authenticated policies: only service_role (Edge Functions) may access.
revoke all on public.issued_access_codes from anon, authenticated, public;
revoke all on public.access_requests from anon, authenticated, public;
revoke all on public.quote_requests from anon, authenticated, public;
