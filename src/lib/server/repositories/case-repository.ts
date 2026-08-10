import type {
  InsuranceCase,
  InsuranceCaseInsert,
  InsuranceCaseUpdate,
  RepositoryResult,
} from "./types";

/**
 * Persistence boundary for insurance_cases (root aggregate).
 * Implementations must use generated Database types and respect RLS / service_role.
 */
export interface CaseRepository {
  getById(caseId: string): Promise<RepositoryResult<InsuranceCase | null>>;
  listForUser(userId: string): Promise<RepositoryResult<InsuranceCase[]>>;
  create(input: InsuranceCaseInsert): Promise<RepositoryResult<InsuranceCase>>;
  update(
    caseId: string,
    patch: InsuranceCaseUpdate,
  ): Promise<RepositoryResult<InsuranceCase>>;
}
