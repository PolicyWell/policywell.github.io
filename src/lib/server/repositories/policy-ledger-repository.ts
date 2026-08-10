import type {
  PolicyLedger,
  PolicyLedgerInsert,
  RepositoryResult,
} from "./types";

/**
 * Persistence boundary for policy_ledgers (illustration / in-force time series).
 * Connects to insurance_cases via policies.case_id.
 */
export interface PolicyLedgerRepository {
  listByPolicy(policyId: string): Promise<RepositoryResult<PolicyLedger[]>>;
  listByDocument(documentId: string): Promise<RepositoryResult<PolicyLedger[]>>;
  createMany(
    rows: PolicyLedgerInsert[],
  ): Promise<RepositoryResult<PolicyLedger[]>>;
}
