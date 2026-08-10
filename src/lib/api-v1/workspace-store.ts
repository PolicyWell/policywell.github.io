import { randomUUID } from "node:crypto";
import { ingestDocument } from "@/lib/extraction";
import { buildDemoSeed } from "@/lib/seed";
import { modelFundingScenarios, runScenario } from "@/lib/scenarios";
import { computePolicyWellScores } from "@/lib/scoring";
import type {
  ExtractedPolicyData,
  IngestedDocument,
  UserProfile,
} from "@/lib/types";

export type ApiWorkspace = {
  id: string;
  createdAt: string;
  profile: UserProfile;
  documents: IngestedDocument[];
};

const workspaces = new Map<string, ApiWorkspace>();

function cloneDemoWorkspace(id: string): ApiWorkspace {
  const seed = buildDemoSeed();
  return {
    id,
    createdAt: new Date().toISOString(),
    profile: structuredClone(seed.profile),
    documents: structuredClone(seed.documents),
  };
}

export function createWorkspace(): ApiWorkspace {
  const id = `ws_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const ws = cloneDemoWorkspace(id);
  workspaces.set(id, ws);
  return ws;
}

export function getWorkspace(id: string | null | undefined): ApiWorkspace | null {
  if (!id) return null;
  return workspaces.get(id) ?? null;
}

export function requireWorkspace(id: string | null | undefined): ApiWorkspace {
  const existing = getWorkspace(id);
  if (existing) return existing;
  const ws = createWorkspace();
  if (id) {
    workspaces.delete(ws.id);
    ws.id = id;
    workspaces.set(id, ws);
  }
  return ws;
}

export function workspaceFromRequest(req: Request): ApiWorkspace {
  const id = req.headers.get("x-policywell-workspace");
  return requireWorkspace(id);
}

function missingField<T>(): { value: T | null; confidence: number; missing: true } {
  return { value: null, confidence: 0, missing: true };
}

function primaryExtraction(ws: ApiWorkspace): ExtractedPolicyData {
  if (ws.documents[0]?.extraction) return ws.documents[0].extraction;
  const policy = ws.profile.insurance.policies[0];
  return {
    carrier: policy?.carrier ?? missingField(),
    productName: policy?.productName ?? missingField(),
    productType: policy?.productType ?? missingField(),
    issueAge: policy?.issueAge ?? missingField(),
    faceAmount: policy?.faceAmount ?? missingField(),
    cashValue: policy?.cashValue ?? missingField(),
    targetPremium: policy?.targetPremium ?? missingField(),
    currentPremium: policy?.currentPremium ?? missingField(),
    deathBenefit: policy?.deathBenefit ?? missingField(),
    coi: missingField(),
    loans: policy?.loans ?? missingField(),
    riders: policy?.riders ?? missingField(),
    assumptions: [],
  };
}

export function ingestFileIntoWorkspace(
  ws: ApiWorkspace,
  filename: string,
  text: string,
  mimeType?: string,
): IngestedDocument {
  const doc = ingestDocument({
    userId: ws.profile.userId,
    filename,
    mimeType,
    rawText: text,
  });
  ws.documents = [doc, ...ws.documents];
  return doc;
}

export function buildSummary(ws: ApiWorkspace) {
  const scores = computePolicyWellScores(ws.profile, ws.documents);
  const extraction = primaryExtraction(ws);
  return {
    workspaceId: ws.id,
    household: {
      name: ws.profile.displayName,
      email: ws.profile.email,
      state: ws.profile.household.state.value,
      age: ws.profile.retirement.currentAge.value,
      dependents: ws.profile.household.dependentsCount.value,
    },
    policy: {
      carrier: extraction.carrier.value,
      product: extraction.productName.value,
      deathBenefit: extraction.deathBenefit.value,
      cashValue: extraction.cashValue.value,
      currentPremium: extraction.currentPremium.value,
      targetPremium: extraction.targetPremium.value,
    },
    scores,
    documents: ws.documents.map((d) => ({
      id: d.id,
      filename: d.filename,
      kind: d.kind,
      verified: d.verified,
      confidence: d.overallConfidence,
    })),
  };
}

export function buildFunding(ws: ApiWorkspace) {
  const scores = computePolicyWellScores(ws.profile, ws.documents);
  const extraction = primaryExtraction(ws);
  const current = extraction.currentPremium.value ?? 0;
  const target = extraction.targetPremium.value ?? 0;
  const fundingRatio = target > 0 ? current / target : null;
  return {
    workspaceId: ws.id,
    currentPremium: current,
    targetPremium: target,
    fundingRatio,
    policyHealthScore: scores.policyHealthScore,
    scenarios: modelFundingScenarios(extraction),
    explanations: scores.explanations.filter((e) =>
      /fund|premium|health|policy/i.test(`${e.scoreKey} ${e.label} ${e.rationale}`),
    ),
  };
}

export function buildLapse(ws: ApiWorkspace) {
  const scores = computePolicyWellScores(ws.profile, ws.documents);
  const extraction = primaryExtraction(ws);
  const worried = ws.profile.insurance.worriedAboutLapse.value === true;
  return {
    workspaceId: ws.id,
    lapseConcern: worried,
    reviewPriorityScore: scores.reviewPriorityScore,
    policyHealthScore: scores.policyHealthScore,
    currentPremium: extraction.currentPremium.value,
    targetPremium: extraction.targetPremium.value,
    loans: extraction.loans.value,
    explanations: scores.explanations.filter((e) =>
      /lapse|fund|loan|health|review/i.test(
        `${e.scoreKey} ${e.label} ${e.rationale}`,
      ),
    ),
  };
}

export function buildCashValue(ws: ApiWorkspace, age: number) {
  const extraction = primaryExtraction(ws);
  const currentCash = extraction.cashValue.value ?? 0;
  const issueAge =
    extraction.issueAge.value ?? ws.profile.retirement.currentAge.value ?? 45;
  const years = Math.max(0, age - issueAge);
  const projected = Math.round(currentCash * Math.pow(1.045, years));
  return {
    workspaceId: ws.id,
    age,
    issueAge,
    currentCashValue: currentCash,
    projectedCashValue: projected,
    assumptions: [
      "Illustrative 4.5% annual growth heuristic for CLI demos.",
      "Not a carrier illustration or guarantee.",
    ],
  };
}

export function buildScenario(ws: ApiWorkspace, premium: number) {
  const extraction = primaryExtraction(ws);
  const result = runScenario(`Premium $${premium}`, {
    startingCashValue: extraction.cashValue.value ?? 0,
    annualPremium: premium,
    annualCoi: extraction.coi.value ?? 0,
  });
  return {
    workspaceId: ws.id,
    premium,
    result,
  };
}

export function buildStats(ws: ApiWorkspace) {
  const scores = computePolicyWellScores(ws.profile, ws.documents);
  return {
    workspaceId: ws.id,
    documentCount: ws.documents.length,
    policyCount: ws.profile.insurance.policies.length,
    scores,
    createdAt: ws.createdAt,
  };
}
