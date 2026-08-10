-- Indexes for expected access patterns.

create index insurance_cases_owner_user_id_idx
  on public.insurance_cases (owner_user_id);

create index insurance_cases_assigned_producer_id_idx
  on public.insurance_cases (assigned_producer_id);

create index insurance_cases_status_idx
  on public.insurance_cases (status);

create index documents_case_id_idx
  on public.documents (case_id);

create index documents_uploaded_by_idx
  on public.documents (uploaded_by);

create index documents_document_type_idx
  on public.documents (document_type);

create index ingestions_case_id_idx
  on public.ingestions (case_id);

create index ingestions_document_id_idx
  on public.ingestions (document_id);

create index ingestions_status_idx
  on public.ingestions (status);

create index policies_case_id_idx
  on public.policies (case_id);

create index policy_facts_case_id_idx
  on public.policy_facts (case_id);

create index policy_facts_policy_id_idx
  on public.policy_facts (policy_id);

create index policy_facts_document_id_idx
  on public.policy_facts (document_id);

create index policy_facts_case_field_path_idx
  on public.policy_facts (case_id, field_path);

create index policy_facts_verification_status_idx
  on public.policy_facts (verification_status);

create index policy_ledgers_policy_id_idx
  on public.policy_ledgers (policy_id);

create index policy_ledgers_document_id_idx
  on public.policy_ledgers (document_id);

create index policy_analyses_case_id_idx
  on public.policy_analyses (case_id);

create index policy_analyses_policy_id_idx
  on public.policy_analyses (policy_id);

create index opportunities_case_id_idx
  on public.opportunities (case_id);

create index opportunities_policy_id_idx
  on public.opportunities (policy_id);

create index conversations_case_id_idx
  on public.conversations (case_id);

create index conversations_user_id_idx
  on public.conversations (user_id);

create index feedback_case_id_idx
  on public.feedback (case_id);

create index feedback_user_id_idx
  on public.feedback (user_id);

create index audit_events_user_id_idx
  on public.audit_events (user_id);

create index audit_events_case_id_idx
  on public.audit_events (case_id);
