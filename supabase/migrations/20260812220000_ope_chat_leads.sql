-- Meet Ope live chat leads + message transcript (service-role writes only).

create table if not exists public.ope_chat_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  session_key text not null,
  name text not null,
  email text,
  company text,
  role text,
  page_path text,
  user_agent text,
  status text not null default 'active'
    check (status in ('active', 'closed', 'spam')),
  constraint ope_chat_leads_email_lower check (email is null or email = lower(email))
);

create unique index if not exists ope_chat_leads_session_key_uidx
  on public.ope_chat_leads (session_key);

create index if not exists ope_chat_leads_email_idx
  on public.ope_chat_leads (email);

create index if not exists ope_chat_leads_created_at_idx
  on public.ope_chat_leads (created_at desc);

create table if not exists public.ope_chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.ope_chat_leads (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  seq integer not null default 0
);

create index if not exists ope_chat_messages_lead_id_idx
  on public.ope_chat_messages (lead_id, seq);

comment on table public.ope_chat_leads is
  'SENSITIVE: Meet Ope visitor identity captured in live chat. Service-role writes only.';

comment on table public.ope_chat_messages is
  'SENSITIVE: Meet Ope chat transcript lines linked to ope_chat_leads. Service-role writes only.';

alter table public.ope_chat_leads enable row level security;
alter table public.ope_chat_messages enable row level security;

revoke all on public.ope_chat_leads from anon, authenticated, public;
revoke all on public.ope_chat_messages from anon, authenticated, public;

grant all on public.ope_chat_leads to service_role;
grant all on public.ope_chat_messages to service_role;
