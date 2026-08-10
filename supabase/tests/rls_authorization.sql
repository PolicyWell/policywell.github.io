-- PolicyWell strict RLS authorization tests.
-- Run as a privileged DB role (supabase_admin / postgres via MCP execute_sql).
-- Creates disposable auth users + case fixtures, asserts isolation, then cleans up.

create extension if not exists pgcrypto;

do $$
declare
  user_a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  user_b uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';
  producer_assigned uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3';
  producer_unassigned uuid := 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4';
  case_b uuid := 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5';
  policy_b uuid := 'ffffffff-ffff-4fff-8fff-fffffffffff6';
  doc_b uuid := '12121212-1212-4121-8121-121212121212';
  instance uuid;
  cases_seen int;
  policies_seen int;
  docs_seen int;
begin
  select id into instance from auth.instances limit 1;
  if instance is null then
    instance := '00000000-0000-0000-0000-000000000000';
  end if;

  -- Cleanup any prior fixture residue
  delete from public.documents where id = doc_b;
  delete from public.policies where id = policy_b;
  delete from public.insurance_cases where id = case_b;
  delete from auth.users where id in (user_a, user_b, producer_assigned, producer_unassigned);

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    is_sso_user, is_anonymous
  ) values
    (instance, user_a, 'authenticated', 'authenticated', 'rls-a@example.com', crypt('x', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), false, false),
    (instance, user_b, 'authenticated', 'authenticated', 'rls-b@example.com', crypt('x', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), false, false),
    (instance, producer_assigned, 'authenticated', 'authenticated', 'rls-prod-a@example.com', crypt('x', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), false, false),
    (instance, producer_unassigned, 'authenticated', 'authenticated', 'rls-prod-u@example.com', crypt('x', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), false, false);

  update public.profiles set role = 'producer' where id in (producer_assigned, producer_unassigned);
  update public.profiles set role = 'consumer' where id in (user_a, user_b);

  insert into public.insurance_cases (
    id, owner_user_id, assigned_producer_id, case_type, status, display_name
  ) values (
    case_b, user_b, producer_assigned, 'life', 'created', 'User B Case'
  );

  insert into public.policies (id, case_id, insured_name, carrier)
  values (policy_b, case_b, 'User B Insured', 'Example Carrier');

  insert into public.documents (
    id, case_id, uploaded_by, storage_bucket, storage_path, original_filename, document_type, status
  ) values (
    doc_b, case_b, user_b, 'policy-documents', case_b::text || '/policy.pdf', 'policy.pdf', 'policy_contract', 'uploaded'
  );

  -- Helper to impersonate JWT subject
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_a::text, 'role', 'authenticated', 'aud', 'authenticated')::text,
    true
  );
  execute 'set local role authenticated';

  select count(*) into cases_seen from public.insurance_cases where id = case_b;
  select count(*) into policies_seen from public.policies where id = policy_b;
  select count(*) into docs_seen from public.documents where id = doc_b;

  if cases_seen <> 0 then
    raise exception 'FAIL: user A can see user B case';
  end if;
  if policies_seen <> 0 then
    raise exception 'FAIL: user A can see user B policy';
  end if;
  if docs_seen <> 0 then
    raise exception 'FAIL: user A can see user B document';
  end if;

  execute 'set local role postgres';
  perform set_config('request.jwt.claim.sub', producer_assigned::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', producer_assigned::text, 'role', 'authenticated', 'aud', 'authenticated')::text,
    true
  );
  execute 'set local role authenticated';

  select count(*) into cases_seen from public.insurance_cases where id = case_b;
  if cases_seen <> 1 then
    raise exception 'FAIL: assigned producer cannot see assigned case (seen=%)', cases_seen;
  end if;

  execute 'set local role postgres';
  perform set_config('request.jwt.claim.sub', producer_unassigned::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', producer_unassigned::text, 'role', 'authenticated', 'aud', 'authenticated')::text,
    true
  );
  execute 'set local role authenticated';

  select count(*) into cases_seen from public.insurance_cases where id = case_b;
  if cases_seen <> 0 then
    raise exception 'FAIL: unassigned producer can see case';
  end if;

  execute 'set local role postgres';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);

  -- Cleanup
  delete from public.documents where id = doc_b;
  delete from public.policies where id = policy_b;
  delete from public.insurance_cases where id = case_b;
  delete from auth.users where id in (user_a, user_b, producer_assigned, producer_unassigned);

  raise notice 'PASS: all RLS authorization assertions succeeded';
end $$;

select 'PASS' as rls_authorization_tests;
