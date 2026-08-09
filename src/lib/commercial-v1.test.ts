import { describe, expect, it } from "vitest";
import {
  buildAccountWorkspace,
  uploadCommercialFiles,
} from "@/lib/commercial-account";
import {
  computeAccountReadiness,
  generateDiligenceItems,
} from "@/lib/commercial-diligence";
import {
  classifyCommercialDocument,
  extractCommercialFields,
  ingestCommercialDocument,
  isAcceptedCommercialUpload,
} from "@/lib/commercial-extraction";
import {
  aggregateInsuranceProgram,
  countPoliciesOnFile,
  PROGRAM_LINES,
} from "@/lib/commercial-policies";
import { buildCommercialDemoAccount } from "@/lib/commercial-seed";

describe("PolicyWell Commercial V1", () => {
  it("builds a commercial account workspace with overview metrics", () => {
    const account = buildCommercialDemoAccount("user_1");
    const workspace = buildAccountWorkspace(account);

    expect(workspace.account.companyName).toBe("Harbor Fabrication LLC");
    expect(workspace.overview.existingPolicies).toBeGreaterThanOrEqual(3);
    expect(workspace.overview.annualPremium).toBeGreaterThan(0);
    expect(workspace.overview.renewalDate).toBe("2026-09-01");
    expect(workspace.overview.accountReadiness.score).toBeGreaterThanOrEqual(0);
    expect(workspace.overview.accountReadiness.disclaimer).toMatch(
      /not an underwriting score/i,
    );
    expect(workspace.overview.missingDiligenceItems).toBeGreaterThan(0);
    expect(workspace.overview.unresolvedLossRunDiscrepancies).toBe(1);
    expect(workspace.account.assignedProducer).toBe("Jordan Lee");
    expect(workspace.account.accountManager).toBe("Sam Rivera");
  });

  it("accepts commercial file types and classifies uploads", () => {
    expect(isAcceptedCommercialUpload("a.pdf")).toBe(true);
    expect(isAcceptedCommercialUpload("a.docx")).toBe(true);
    expect(isAcceptedCommercialUpload("a.xlsx")).toBe(true);
    expect(isAcceptedCommercialUpload("a.csv")).toBe(true);
    expect(isAcceptedCommercialUpload("a.png")).toBe(true);
    expect(isAcceptedCommercialUpload("a.jpg")).toBe(true);
    expect(isAcceptedCommercialUpload("a.eml")).toBe(true);
    expect(isAcceptedCommercialUpload("a.exe")).toBe(false);

    expect(classifyCommercialDocument("client_loss_runs.pdf")).toBe("loss_run");
    expect(classifyCommercialDocument("SOV_2026.xlsx")).toBe(
      "statement_of_values",
    );
    expect(classifyCommercialDocument("cyber_questionnaire.pdf")).toBe(
      "cyber_questionnaire",
    );
    expect(classifyCommercialDocument("environmental_questionnaire.pdf")).toBe(
      "environmental_questionnaire",
    );
    expect(classifyCommercialDocument("FY25_financial_statement.pdf")).toBe(
      "financial_statement",
    );
    expect(classifyCommercialDocument("vendor_msa_contract.pdf")).toBe(
      "contract",
    );
  });

  it("extracts provenanced fields and never invents missing values", () => {
    const text = [
      "--- page 1 ---",
      "Named Insured: Acme Metal Works",
      "Industry: Fabrication",
      "Employees: 12",
      "Annual Revenue: $900,000",
      "Carrier: Test Mutual",
      "Policy Number: TM-1",
      "Each Occurrence Limit: $1,000,000",
      "Deductible: $1,000",
      "Expiration Date: 2027-01-15",
    ].join("\n");

    const fields = extractCommercialFields({
      documentId: "doc_1",
      filename: "policy.pdf",
      ocrText: text,
    });

    expect(fields.companyName.value).toBe("Acme Metal Works");
    expect(fields.companyName.sourceDocumentId).toBe("doc_1");
    expect(fields.companyName.sourceExcerpt).toBeTruthy();
    expect(fields.companyName.confidence).toBeGreaterThan(0.5);
    expect(fields.employeeCount.value).toBe(12);
    expect(fields.annualRevenue.value).toBe(900000);
    expect(fields.headquarters.value).toBeNull();
    expect(fields.headquarters.missing).toBe(true);
    expect(fields.headquarters.confidence).toBe(0);
  });

  it("stores commercial documents as private and refreshes diligence", () => {
    let account = buildCommercialDemoAccount("user_1");
    const before = account.diligenceItems.length;

    account = uploadCommercialFiles(
      account,
      [
        {
          filename: "vehicle_schedule.csv",
          rawText: "VIN,Year,Make\n1,2020,Ford",
        },
        {
          filename: "cyber_questionnaire.pdf",
          rawText: "Cyber questionnaire\nMFA: yes",
        },
      ],
      "user_1",
    );

    expect(account.documents[0]?.storageVisibility).toBe("private");
    expect(account.documents.some((d) => d.classification === "vehicle_schedule")).toBe(
      true,
    );
    expect(
      account.documents.some((d) => d.classification === "cyber_questionnaire"),
    ).toBe(true);
    // Resolving schedule/questionnaire gaps should not increase open critical noise unboundedly
    expect(account.diligenceItems.length).toBeGreaterThanOrEqual(before - 2);
    expect(account.readiness.disclaimer).toMatch(/not an underwriting score/i);
  });

  it("aggregates the insurance program across commercial LOBs", () => {
    const account = buildCommercialDemoAccount("user_1");
    const coverages = aggregateInsuranceProgram(account.policies);

    expect(coverages.length).toBe(PROGRAM_LINES.length);
    expect(countPoliciesOnFile(coverages)).toBe(3);

    const gl = coverages.find((c) => c.line === "general_liability");
    expect(gl?.status).toBe("in_force");
    expect(gl?.carrier.value).toBe("Harbor Mutual");
    expect(gl?.occurrenceLimit.value).toBe(1_000_000);
    expect(gl?.carrier.sourceExcerpt).toMatch(/Carrier/);

    const wc = coverages.find((c) => c.line === "workers_compensation");
    expect(wc?.status).toBe("not_on_file");
    expect(wc?.carrier.value).toBeNull();

    const cyber = coverages.find((c) => c.line === "cyber");
    expect(cyber?.label).toBe("Cyber");
  });

  it("computes readiness from diligence severity — not underwriting", () => {
    const account = buildCommercialDemoAccount("user_1");
    const items = generateDiligenceItems(account, []);
    const readiness = computeAccountReadiness(items);

    expect(readiness.maxScore).toBe(100);
    expect(readiness.openItems).toBe(items.length);
    expect(readiness.disclaimer).toMatch(/not an underwriting score/i);
    expect(["not_ready", "needs_work", "nearly_ready", "ready_for_review"]).toContain(
      readiness.label,
    );
  });

  it("ingests commercial OCR templates with page markers", () => {
    const doc = ingestCommercialDocument({
      accountId: "acct_1",
      userId: "u1",
      filename: "Harbor_GL_Policy.pdf",
    });
    expect(doc.classification).toBe("policy");
    expect(doc.storageVisibility).toBe("private");
    expect(doc.extractedFields.companyName.value).toBe("Harbor Fabrication LLC");
    expect(doc.pageCount).toBeGreaterThanOrEqual(1);
  });
});
