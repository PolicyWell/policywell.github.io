-- Allow privileged server-side aggregate reads for public ingestion stats.
-- Does not weaken RLS for anon/authenticated Data API clients.

grant select on table public.documents to service_role;
grant select on table public.ingestions to service_role;
