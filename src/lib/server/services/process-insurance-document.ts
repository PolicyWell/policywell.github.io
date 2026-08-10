import type {
  DocumentRepository,
  IngestionRepository,
  PolicyFactRepository,
  PolicyLedgerRepository,
  PolicyRepository,
} from "@/lib/server/repositories";
import type { Document, Ingestion, RepositoryResult } from "@/lib/server/repositories/types";

/**
 * Future application service: process an uploaded insurance document.
 *
 * Architectural stages (interfaces only — no AI call sites yet):
 * 1. Validate document + case access
 * 2. Create / advance ingestion lifecycle (queued → processing → completed|failed)
 * 3. Extract policy_facts with provenance (document_id, page, excerpt, confidence)
 * 4. Apply document precedence; supersede conflicting prior facts (never delete history)
 * 5. Optionally refresh canonical policies / policy_ledgers from verified facts
 *
 * Implementations must NOT invoke LLM/OCR providers until a dedicated ingestion epic.
 */
export interface ProcessInsuranceDocumentDeps {
  documents: DocumentRepository;
  ingestions: IngestionRepository;
  policies: PolicyRepository;
  policyFacts: PolicyFactRepository;
  policyLedgers: PolicyLedgerRepository;
}

export type ProcessInsuranceDocumentInput = {
  caseId: string;
  documentId: string;
  /** Optional: resume an existing queued ingestion */
  ingestionId?: string;
};

export type ProcessInsuranceDocumentOutput = {
  document: Document;
  ingestion: Ingestion;
  /** Reserved for future fact/ledger write counts — keep zero until AI lands */
  factsWritten: number;
  factsSuperseded: number;
  ledgerRowsWritten: number;
};

export interface ProcessInsuranceDocument {
  execute(
    input: ProcessInsuranceDocumentInput,
  ): Promise<RepositoryResult<ProcessInsuranceDocumentOutput>>;
}
