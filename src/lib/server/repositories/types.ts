import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

export type Profile = Tables<"profiles">;
export type InsuranceCase = Tables<"insurance_cases">;
export type Document = Tables<"documents">;
export type Ingestion = Tables<"ingestions">;
export type Policy = Tables<"policies">;
export type PolicyFact = Tables<"policy_facts">;
export type PolicyLedger = Tables<"policy_ledgers">;
export type PolicyAnalysis = Tables<"policy_analyses">;
export type Opportunity = Tables<"opportunities">;
export type Feedback = Tables<"feedback">;
export type AuditEvent = Tables<"audit_events">;
export type Conversation = Tables<"conversations">;

export type InsuranceCaseInsert = TablesInsert<"insurance_cases">;
export type InsuranceCaseUpdate = TablesUpdate<"insurance_cases">;
export type DocumentInsert = TablesInsert<"documents">;
export type DocumentUpdate = TablesUpdate<"documents">;
export type IngestionInsert = TablesInsert<"ingestions">;
export type IngestionUpdate = TablesUpdate<"ingestions">;
export type PolicyInsert = TablesInsert<"policies">;
export type PolicyUpdate = TablesUpdate<"policies">;
export type PolicyFactInsert = TablesInsert<"policy_facts">;
export type PolicyFactUpdate = TablesUpdate<"policy_facts">;
export type PolicyLedgerInsert = TablesInsert<"policy_ledgers">;
export type PolicyAnalysisInsert = TablesInsert<"policy_analyses">;
export type OpportunityInsert = TablesInsert<"opportunities">;

export type DocumentType = Database["public"]["Enums"]["document_type"];
export type IngestionStatus = Database["public"]["Enums"]["ingestion_status"];
export type FactVerificationStatus = Database["public"]["Enums"]["fact_verification_status"];

export type RepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
