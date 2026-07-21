import { computePolicyWellScores } from "./scoring";
import type {
  AgentReport,
  AnalysisEvent,
  IngestedDocument,
  PolicyWellScores,
  UserProfile,
} from "./types";

export interface HybridContext {
  who: string;
  role: string;
  policies: string[];
  financial: string;
  goals: string[];
  documents: string[];
  household: string;
  carrier: string;
  state: string;
  products: string[];
  scores: PolicyWellScores;
  assumptions: string[];
  missing: string[];
}

/** Every AI interaction first updates/reads context before generating an answer. */
export function buildHybridContext(
  profile: UserProfile,
  documents: IngestedDocument[],
): HybridContext {
  const scores = computePolicyWellScores(profile, documents);
  const goals: string[] = [];
  if (profile.goals.retirementPlanning.value) goals.push("Retirement planning");
  if (profile.goals.preventLapse.value) goals.push("Prevent lapse");
  if (profile.goals.maximizeCashValue.value) goals.push("Maximize cash value");
  if (profile.goals.estatePlanning.value) goals.push("Estate planning");
  if (profile.goals.incomeReplacement.value) goals.push("Income replacement");

  const products = [
    ...profile.insurance.policies
      .map((p) => p.productType.value)
      .filter(Boolean) as string[],
    ...documents
      .map((d) => d.extraction.productType.value)
      .filter(Boolean) as string[],
  ];

  return {
    who: profile.displayName,
    role: profile.role,
    policies: profile.insurance.policies.map(
      (p) =>
        `${p.carrier.value ?? "Unknown"} ${p.productType.value ?? "policy"}`,
    ),
    financial: profile.financial.annualIncome.value
      ? `Income $${profile.financial.annualIncome.value.toLocaleString()}`
      : "Income unknown",
    goals,
    documents: documents.map((d) => d.filename),
    household: [
      profile.household.maritalStatus.value,
      profile.household.dependentsCount.value != null
        ? `${profile.household.dependentsCount.value} dependents`
        : null,
    ]
      .filter(Boolean)
      .join(", ") || "Household incomplete",
    carrier:
      profile.carrier.primaryCarrier.value ||
      documents[0]?.extraction.carrier.value ||
      "Unknown",
    state: profile.household.state.value || "Unknown",
    products: [...new Set(products)],
    scores,
    assumptions: [
      ...scores.assumptions,
      ...(documents[0]?.extraction.assumptions ?? []),
    ],
    missing: profile.missingFields,
  };
}

export interface GroundedAnswer {
  answer: string;
  references: {
    document?: string;
    extractedValues: string[];
    assumptions: string[];
    confidence: number;
  };
  context: HybridContext;
}

export function answerPolicyQuestion(
  question: string,
  profile: UserProfile,
  documents: IngestedDocument[],
): GroundedAnswer {
  const context = buildHybridContext(profile, documents);
  const doc = documents[0];
  const ext = doc?.extraction;
  const q = question.toLowerCase();

  const extractedValues: string[] = [];
  if (ext) {
    if (ext.carrier.value) extractedValues.push(`carrier=${ext.carrier.value}`);
    if (ext.faceAmount.value != null) extractedValues.push(`faceAmount=${ext.faceAmount.value}`);
    if (ext.cashValue.value != null) extractedValues.push(`cashValue=${ext.cashValue.value}`);
    if (ext.targetPremium.value != null) extractedValues.push(`targetPremium=${ext.targetPremium.value}`);
    if (ext.currentPremium.value != null) extractedValues.push(`currentPremium=${ext.currentPremium.value}`);
    if (ext.deathBenefit.value != null) extractedValues.push(`deathBenefit=${ext.deathBenefit.value}`);
    if (ext.loans.value != null) extractedValues.push(`loans=${ext.loans.value}`);
    if (ext.coi.value != null) extractedValues.push(`coi=${ext.coi.value}`);
  }

  let answer: string;
  let confidence = doc?.overallConfidence ?? 0.4;

  if (/lapse/i.test(q)) {
    const current = ext?.currentPremium.value ?? 0;
    const target = ext?.targetPremium.value ?? 0;
    const cash = ext?.cashValue.value ?? 0;
    if (current > 0 && target > 0 && current < target * 0.85) {
      answer =
        `Based on the uploaded ${doc?.filename ?? "policy document"}, current planned premium ($${current.toLocaleString()}) is below target ($${target.toLocaleString()}). ` +
        `With cash value around $${cash.toLocaleString()}, underfunding elevates lapse risk if crediting or COI worsens. ` +
        `Policy Health Score is ${context.scores.policyHealthScore}/100. This is not a guarantee — confirm with an in-force illustration.`;
      confidence = Math.min(confidence, 0.82);
    } else if (current >= target && target > 0) {
      answer =
        `Funding appears at or above target premium ($${target.toLocaleString()}). Near-term lapse risk looks lower, but COI increases and non-guaranteed crediting still matter. Policy Health Score: ${context.scores.policyHealthScore}/100.`;
    } else {
      answer =
        "I need a verified premium schedule and cash value from an in-force ledger to assess lapse risk with higher confidence.";
      confidence = 0.35;
    }
  } else if (/fund|premium|annually|pay/i.test(q)) {
    const target = ext?.targetPremium.value;
    answer = target
      ? `Extracted target premium is $${target.toLocaleString()} annually. Funding at or above target generally improves policy durability for IULs, subject to illustrated assumptions (${context.assumptions[0] ?? "see document"}).`
      : "Target premium was not confidently extracted — please verify on the review screen.";
  } else if (/borrow|loan/i.test(q)) {
    const cash = ext?.cashValue.value ?? 0;
    const loans = ext?.loans.value ?? 0;
    const available = Math.max(cash - loans, 0);
    answer =
      `Approximate borrowable capacity heuristic: cash value $${cash.toLocaleString()} minus loans $${loans.toLocaleString()} ≈ $${available.toLocaleString()}. ` +
      `Actual loan provisions, interest, and carrier rules control the real limit.`;
  } else if (/stop paying|stop premium/i.test(q)) {
    const cash = ext?.cashValue.value ?? 0;
    answer =
      `If premiums stop, the policy may rely on cash value (≈$${cash.toLocaleString()}) to cover COI and expenses until depleted — increasing lapse risk. Request an in-force illustration for a timed projection.`;
  } else if (/cash value|increase/i.test(q)) {
    answer =
      `Cash value growth depends on funding above expenses/COI and index crediting. Current extracted cash value: $${(ext?.cashValue.value ?? 0).toLocaleString()}. Increasing planned premium toward/above target is the primary controllable lever.`;
  } else {
    answer =
      `Using your PolicyWell context (${context.who}, ${context.role}, ${context.carrier}, ${context.state}): ` +
      `Overall Intelligence Score ${context.scores.overallIntelligenceScore}/100. ` +
      `Ask about lapse risk, funding, borrowing, or cash value for grounded answers.`;
  }

  return {
    answer,
    references: {
      document: doc?.filename,
      extractedValues,
      assumptions: context.assumptions.slice(0, 4),
      confidence,
    },
    context,
  };
}

export function buildAnalysisTimeline(
  profile: UserProfile,
  documents: IngestedDocument[],
): AnalysisEvent[] {
  const events: AnalysisEvent[] = [
    {
      id: "evt_context",
      at: profile.updatedAt,
      title: "Context assembled",
      detail: `Household, goals, and role (${profile.role}) loaded into the hybrid engine.`,
      confidence: profile.overallConfidence,
    },
  ];
  for (const doc of documents) {
    events.push({
      id: `evt_${doc.id}`,
      at: doc.uploadedAt,
      title: `Document ingested: ${doc.filename}`,
      detail: `${doc.kind} · OCR + extraction · confidence ${Math.round(doc.overallConfidence * 100)}%${doc.verified ? " · verified" : " · needs review"}`,
      confidence: doc.overallConfidence,
    });
  }
  const scores = computePolicyWellScores(profile, documents);
  events.push({
    id: "evt_scores",
    at: new Date().toISOString(),
    title: "PolicyWell scores computed",
    detail: `Overall ${scores.overallIntelligenceScore} · Policy Health ${scores.policyHealthScore} · Review Priority ${scores.reviewPriorityScore}`,
    confidence: 1,
  });
  return events.sort((a, b) => a.at.localeCompare(b.at));
}

export function generateAgentReport(
  profile: UserProfile,
  documents: IngestedDocument[],
): AgentReport {
  const context = buildHybridContext(profile, documents);
  const scores = context.scores;
  const ext = documents[0]?.extraction;

  const questions: string[] = [];
  if (profile.missingFields.length) {
    questions.push(`Clarify missing profile fields: ${profile.missingFields.join(", ")}.`);
  }
  if (ext && ext.currentPremium.value != null && ext.targetPremium.value != null) {
    if (ext.currentPremium.value < ext.targetPremium.value) {
      questions.push("Is the client able to increase planned premium to target?");
    }
  }
  if (!documents.some((d) => d.verified)) {
    questions.push("Has the client verified extracted policy values against the carrier statement?");
  }

  const warnings: string[] = [];
  if (scores.policyHealthScore < 55) warnings.push("Policy health is below comfort threshold.");
  if (scores.reviewPriorityScore >= 60) warnings.push("Elevated review priority — schedule follow-up.");
  if (profile.insurance.worriedAboutLapse.value) warnings.push("Client expressed lapse concern.");

  return {
    clientSummary:
      `${profile.displayName} is a ${profile.role} in ${context.state} with focus on ${context.goals.join(", ") || "general protection"}. ` +
      `Primary carrier context: ${context.carrier}. Overall Intelligence Score: ${scores.overallIntelligenceScore}/100.`,
    advisorSummary:
      `Protection ${scores.protectionScore}, Policy Health ${scores.policyHealthScore}, Mortgage ${scores.mortgageScore}. ` +
      `Documents: ${documents.map((d) => d.filename).join(", ") || "none"}. ` +
      `Funding vs target should be reviewed${ext?.currentPremium.value != null && ext?.targetPremium.value != null ? ` ($${ext.currentPremium.value.toLocaleString()} vs $${ext.targetPremium.value.toLocaleString()})` : ""}.`,
    questions,
    warnings,
    recommendedFollowUp: [
      "Complete human verification of extracted policy JSON.",
      "Run in-force illustration at current and target premium.",
      "Confirm beneficiary designations match household profile.",
      scores.reviewPriorityScore >= 60
        ? "Book annual review within 30 days."
        : "Schedule standard annual review.",
    ],
    generatedAt: new Date().toISOString(),
  };
}
