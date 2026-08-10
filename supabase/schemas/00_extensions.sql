-- PolicyWell canonical schema: extensions + shared enums
-- Source of truth for declarative schema workflow (see docs/architecture/database.md).

create extension if not exists "pgcrypto" with schema extensions;

create type public.profile_role as enum (
  'consumer',
  'producer',
  'agency_admin',
  'policywell_admin'
);

create type public.insurance_case_type as enum (
  'life',
  'annuity',
  'commercial'
);

create type public.insurance_case_status as enum (
  'created',
  'uploading',
  'ingesting',
  'needs_information',
  'ready_for_analysis',
  'analyzing',
  'analyzed',
  'review_required',
  'archived'
);

create type public.document_type as enum (
  'application',
  'original_illustration',
  'inforce_illustration',
  'annual_statement',
  'policy_contract',
  'amendment',
  'underwriting_document',
  'commercial_policy',
  'loss_run',
  'unknown'
);

create type public.document_status as enum (
  'uploaded',
  'processing',
  'ready',
  'failed',
  'archived'
);

create type public.ingestion_status as enum (
  'queued',
  'processing',
  'completed',
  'failed'
);

create type public.fact_type as enum (
  'fact',
  'calculation',
  'inference'
);

create type public.fact_verification_status as enum (
  'document_extracted',
  'user_verified',
  'producer_verified',
  'superseded'
);

create type public.opportunity_priority as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.opportunity_status as enum (
  'open',
  'in_review',
  'accepted',
  'dismissed',
  'completed'
);

create type public.feedback_kind as enum (
  'accurate',
  'needs_correction',
  'not_helpful'
);
