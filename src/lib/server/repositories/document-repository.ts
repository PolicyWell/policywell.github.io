import type {
  Document,
  DocumentInsert,
  DocumentUpdate,
  RepositoryResult,
} from "./types";

/**
 * Persistence boundary for documents (raw source metadata + Storage pointers).
 * Does not own bytes; Storage path convention is defined in schemas/16_storage.sql.
 */
export interface DocumentRepository {
  getById(documentId: string): Promise<RepositoryResult<Document | null>>;
  listByCase(caseId: string): Promise<RepositoryResult<Document[]>>;
  create(input: DocumentInsert): Promise<RepositoryResult<Document>>;
  update(
    documentId: string,
    patch: DocumentUpdate,
  ): Promise<RepositoryResult<Document>>;
}
