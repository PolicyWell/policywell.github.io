import type {
  PolicyFact,
  PolicyFactInsert,
  PolicyFactUpdate,
  RepositoryResult,
} from "./types";

/**
 * Persistence boundary for policy_facts (provenanced evidence).
 * Never delete historical facts when newer documents arrive — mark superseded.
 */
export interface PolicyFactRepository {
  getById(factId: string): Promise<RepositoryResult<PolicyFact | null>>;
  listByCase(caseId: string): Promise<RepositoryResult<PolicyFact[]>>;
  listActiveByCaseField(
    caseId: string,
    fieldPath: string,
  ): Promise<RepositoryResult<PolicyFact[]>>;
  create(input: PolicyFactInsert): Promise<RepositoryResult<PolicyFact>>;
  update(
    factId: string,
    patch: PolicyFactUpdate,
  ): Promise<RepositoryResult<PolicyFact>>;
  /**
   * Marks prior facts for the same case+field_path as superseded.
   * Prefer calling public.supersede_policy_facts(...) under RLS/service_role.
   */
  supersedeForField(
    caseId: string,
    fieldPath: string,
    exceptFactId?: string,
  ): Promise<RepositoryResult<number>>;
}
