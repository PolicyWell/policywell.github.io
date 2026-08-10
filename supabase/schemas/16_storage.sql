-- Private policy-documents bucket.
-- Path: {owner_user_id}/{case_id}/{document_id}/{safe_filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'policy-documents',
  'policy-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/tiff'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_policy_document_path_accessible(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    object_name is not null
    and (storage.foldername(object_name))[1] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(object_name))[2] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(object_name))[3] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and exists (
      select 1
      from public.insurance_cases c
      where c.id = ((storage.foldername(object_name))[2])::uuid
        and c.owner_user_id = ((storage.foldername(object_name))[1])::uuid
        and public.is_case_accessible(c.id)
    );
$$;

revoke all on function public.is_policy_document_path_accessible(text) from public;
revoke all on function public.is_policy_document_path_accessible(text) from anon;
grant execute on function public.is_policy_document_path_accessible(text) to authenticated;

create or replace function public.is_policy_document_path_owner(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    object_name is not null
    and (storage.foldername(object_name))[1] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(object_name))[2] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and ((storage.foldername(object_name))[1])::uuid = (select auth.uid())
    and public.is_case_owner(((storage.foldername(object_name))[2])::uuid);
$$;

revoke all on function public.is_policy_document_path_owner(text) from public;
revoke all on function public.is_policy_document_path_owner(text) from anon;
grant execute on function public.is_policy_document_path_owner(text) to authenticated;

drop policy if exists policy_docs_storage_select on storage.objects;
create policy policy_docs_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  );

drop policy if exists policy_docs_storage_insert on storage.objects;
create policy policy_docs_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  );

drop policy if exists policy_docs_storage_update on storage.objects;
create policy policy_docs_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  )
  with check (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_accessible(name)
  );

drop policy if exists policy_docs_storage_delete on storage.objects;
create policy policy_docs_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'policy-documents'
    and public.is_policy_document_path_owner(name)
  );
