-- Private policy-documents storage policies for authenticated owners.
-- Path convention: {userId}/{caseId}/{documentId}/{filename}
-- Guarded when storage schema is unavailable (minimal DB resets).

do $storage$
begin
  if to_regclass('storage.buckets') is not null
     and to_regclass('storage.objects') is not null then

    insert into storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types
    )
    values (
      'policy-documents',
      'policy-documents',
      false,
      52428800,
      array[
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/tiff',
        'text/plain',
        'application/json'
      ]
    )
    on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

    execute 'drop policy if exists policy_docs_storage_select on storage.objects';
    execute $p$
      create policy policy_docs_storage_select on storage.objects
      for select to authenticated
      using (
        bucket_id = 'policy-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
    $p$;

    execute 'drop policy if exists policy_docs_storage_insert on storage.objects';
    execute $p$
      create policy policy_docs_storage_insert on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'policy-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
    $p$;

    execute 'drop policy if exists policy_docs_storage_update on storage.objects';
    execute $p$
      create policy policy_docs_storage_update on storage.objects
      for update to authenticated
      using (
        bucket_id = 'policy-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
      with check (
        bucket_id = 'policy-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
    $p$;

    execute 'drop policy if exists policy_docs_storage_delete on storage.objects';
    execute $p$
      create policy policy_docs_storage_delete on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'policy-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
    $p$;

  else
    raise notice 'Supabase Storage schema unavailable; skipping policy-documents storage policies.';
  end if;
end
$storage$;
