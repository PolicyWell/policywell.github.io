import type {
  Policy,
  PolicyInsert,
  PolicyUpdate,
  RepositoryResult,
} from "./types";

/**
 * Persistence boundary for policies (canonical best-known policy state).
 * Not a dump of raw extraction — prefer verified facts when updating.
 */
export interface PolicyRepository {
  getById(policyId: string): Promise<RepositoryResult<Policy | null>>;
  listByCase(caseId: string): Promise<RepositoryResult<Policy[]>>;
  create(input: PolicyInsert): Promise<RepositoryResult<Policy>>;
  update(
    policyId: string,
    patch: PolicyUpdate,
  ): Promise<RepositoryResult<Policy>>;
}
