-- Public hero counter: one-row site_stats mirror of analyzed feed volume.
-- Private document rows stay RLS-locked; anon may only read the aggregate.

create table if not exists public.site_stats (
  id smallint primary key default 1 check (id = 1),
  analyzed_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.site_stats is
  'PUBLIC aggregate counters for marketing surfaces. Never store PII here.';

comment on column public.site_stats.analyzed_count is
  'Running total of fed policy/illustration documents (uploaded, processing, or ready).';

insert into public.site_stats (id, analyzed_count)
values (1, 0)
on conflict (id) do nothing;

alter table public.site_stats enable row level security;

drop policy if exists site_stats_select_public on public.site_stats;
create policy site_stats_select_public
  on public.site_stats
  for select
  to anon, authenticated
  using (true);

grant select on table public.site_stats to anon, authenticated;
revoke insert, update, delete on table public.site_stats from anon, authenticated;

create or replace function public.refresh_site_analyzed_count()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.site_stats
  set
    analyzed_count = (
      select count(*)::bigint
      from public.documents d
      where d.status in ('uploaded', 'processing', 'ready')
    ),
    updated_at = now()
  where id = 1;
end;
$$;

comment on function public.refresh_site_analyzed_count() is
  'Internal: recompute site_stats.analyzed_count from documents. Trigger-only.';

revoke all on function public.refresh_site_analyzed_count() from public;
revoke all on function public.refresh_site_analyzed_count() from anon, authenticated;

create or replace function public.trg_refresh_site_analyzed_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_site_analyzed_count();
  return null;
end;
$$;

revoke all on function public.trg_refresh_site_analyzed_count() from public;
revoke all on function public.trg_refresh_site_analyzed_count() from anon, authenticated;

drop trigger if exists documents_refresh_site_stats on public.documents;
create trigger documents_refresh_site_stats
  after insert or delete or update of status
  on public.documents
  for each statement
  execute function public.trg_refresh_site_analyzed_count();

-- Seed from current documents.
select public.refresh_site_analyzed_count();

-- Realtime so the hero counter updates without a full page reload.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_stats'
  ) then
    alter publication supabase_realtime add table public.site_stats;
  end if;
end;
$$;
