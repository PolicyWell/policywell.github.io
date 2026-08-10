import type {
  PolicyAnalysis,
  PolicyAnalysisInsert,
  RepositoryResult,
} from "./types";

/**
 * Persistence boundary for policy_analyses (derived intelligence).
 * Separate from opportunities and policy_facts.
 */
export interface PolicyAnalysisRepository {
  getById(analysisId: string): Promise<RepositoryResult<PolicyAnalysis | null>>;
  listByCase(caseId: string): Promise<RepositoryResult<PolicyAnalysis[]>>;
  create(input: PolicyAnalysisInsert): Promise<RepositoryResult<PolicyAnalysis>>;
}
