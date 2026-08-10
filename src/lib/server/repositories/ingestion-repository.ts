import type {
  Ingestion,
  IngestionInsert,
  IngestionStatus,
  IngestionUpdate,
  RepositoryResult,
} from "./types";

/**
 * Persistence boundary for ingestions (processing lifecycle).
 * Separate from documents and policy_facts — do not collapse concepts.
 */
export interface IngestionRepository {
  getById(ingestionId: string): Promise<RepositoryResult<Ingestion | null>>;
  listByDocument(documentId: string): Promise<RepositoryResult<Ingestion[]>>;
  listByCase(
    caseId: string,
    status?: IngestionStatus,
  ): Promise<RepositoryResult<Ingestion[]>>;
  create(input: IngestionInsert): Promise<RepositoryResult<Ingestion>>;
  update(
    ingestionId: string,
    patch: IngestionUpdate,
  ): Promise<RepositoryResult<Ingestion>>;
}
