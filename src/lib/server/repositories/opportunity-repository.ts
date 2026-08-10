import type {
  Opportunity,
  OpportunityInsert,
  RepositoryResult,
} from "./types";

/**
 * Persistence boundary for opportunities (actionable producer output).
 */
export interface OpportunityRepository {
  getById(
    opportunityId: string,
  ): Promise<RepositoryResult<Opportunity | null>>;
  listByCase(caseId: string): Promise<RepositoryResult<Opportunity[]>>;
  create(input: OpportunityInsert): Promise<RepositoryResult<Opportunity>>;
}
