-- documents: raw source metadata + private Storage pointers (not extracted facts).

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.insurance_cases (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete restrict,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text not null,
  mime_type text,
  document_type public.document_type not null default 'unknown',
  document_date date,
  page_count integer,
  sha256 text,
  status public.document_status not null default 'uploaded',
  created_at timestamptz not null default now(),
  constraint documents_page_count_nonnegative check (page_count is null or page_count >= 0),
  constraint documents_storage_path_nonempty check (char_length(storage_path) > 0)
);

comment on table public.documents is
  'SENSITIVE: raw source document metadata. Bytes live in private Storage; never public URLs.';

comment on column public.documents.document_type is
  'Used with document_precedence_rank() for source precedence. Historical rows are retained.';
