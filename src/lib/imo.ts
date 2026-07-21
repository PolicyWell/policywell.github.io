import {
  buildAdvisorRoster,
  seedClientFromUtterances,
  type ClientRecord,
} from "./clients";
import { ingestDocument, verifyDocument } from "./extraction";
import { computePolicyWellScores } from "./scoring";

export interface AdvisorRoster {
  advisorName: string;
  clients: ClientRecord[];
}

export interface AdvisorActivity {
  advisorName: string;
  clientCount: number;
  documentsIngested: number;
  verifiedRate: number; // 0–1
  avgPolicyHealth: number;
  avgReviewPriority: number;
  highPriorityClients: number;
}

export interface CarrierSlice {
  carrier: string;
  policies: number;
}

export type ReviewStatus = "overdue" | "due" | "current";

export interface ReviewPipelineItem {
  clientLabel: string;
  advisorName: string;
  reviewPriorityScore: number;
  status: ReviewStatus;
}

export interface ImoAnalytics {
  advisors: AdvisorActivity[];
  carrierDistribution: CarrierSlice[];
  reviewPipeline: ReviewPipelineItem[];
  totals: {
    advisors: number;
    clients: number;
    documents: number;
    verifiedDocuments: number;
  };
  assumptions: string[];
}

const HIGH_PRIORITY_THRESHOLD = 60;
const DUE_THRESHOLD = 45;

function reviewStatus(priority: number): ReviewStatus {
  if (priority >= HIGH_PRIORITY_THRESHOLD) return "overdue";
  if (priority >= DUE_THRESHOLD) return "due";
  return "current";
}

/** Deterministic IMO-level aggregation across advisor rosters. */
export function buildImoAnalytics(rosters: AdvisorRoster[]): ImoAnalytics {
  const advisors: AdvisorActivity[] = [];
  const carrierCounts = new Map<string, number>();
  const pipeline: ReviewPipelineItem[] = [];
  let totalDocs = 0;
  let totalVerified = 0;
  let totalClients = 0;

  for (const roster of rosters) {
    let docs = 0;
    let verified = 0;
    let healthSum = 0;
    let prioritySum = 0;
    let highPriority = 0;

    for (const client of roster.clients) {
      totalClients++;
      docs += client.documents.length;
      verified += client.documents.filter((d) => d.verified).length;

      const scores = computePolicyWellScores(client.profile, client.documents);
      healthSum += scores.policyHealthScore;
      prioritySum += scores.reviewPriorityScore;
      if (scores.reviewPriorityScore >= HIGH_PRIORITY_THRESHOLD) highPriority++;

      pipeline.push({
        clientLabel: client.label,
        advisorName: roster.advisorName,
        reviewPriorityScore: scores.reviewPriorityScore,
        status: reviewStatus(scores.reviewPriorityScore),
      });

      for (const doc of client.documents) {
        const carrier = doc.extraction.carrier.value;
        if (carrier) {
          carrierCounts.set(carrier, (carrierCounts.get(carrier) ?? 0) + 1);
        }
      }
    }

    totalDocs += docs;
    totalVerified += verified;
    const n = roster.clients.length || 1;
    advisors.push({
      advisorName: roster.advisorName,
      clientCount: roster.clients.length,
      documentsIngested: docs,
      verifiedRate: docs ? Math.round((verified / docs) * 100) / 100 : 0,
      avgPolicyHealth: Math.round(healthSum / n),
      avgReviewPriority: Math.round(prioritySum / n),
      highPriorityClients: highPriority,
    });
  }

  return {
    advisors,
    carrierDistribution: [...carrierCounts.entries()]
      .map(([carrier, policies]) => ({ carrier, policies }))
      .sort((a, b) => b.policies - a.policies),
    reviewPipeline: pipeline.sort(
      (a, b) => b.reviewPriorityScore - a.reviewPriorityScore,
    ),
    totals: {
      advisors: rosters.length,
      clients: totalClients,
      documents: totalDocs,
      verifiedDocuments: totalVerified,
    },
    assumptions: [
      `Review status: overdue ≥ ${HIGH_PRIORITY_THRESHOLD} priority, due ≥ ${DUE_THRESHOLD}, else current.`,
      "All metrics derive from the deterministic PolicyWell score engine — no LLM output.",
    ],
  };
}

export interface ChecklistItem {
  label: string;
  done: boolean;
  detail: string;
}

/** Standardized annual review checklist, derived from client data. */
export function generateAnnualReviewChecklist(client: ClientRecord): ChecklistItem[] {
  const scores = computePolicyWellScores(client.profile, client.documents);
  const profile = client.profile;
  const fundedToTarget = client.documents.some((d) => {
    const cur = d.extraction.currentPremium.value;
    const tgt = d.extraction.targetPremium.value;
    return cur != null && tgt != null && cur >= tgt;
  });

  return [
    {
      label: "Household profile complete",
      done: profile.missingFields.length === 0,
      detail: profile.missingFields.length
        ? `Missing: ${profile.missingFields.join(", ")}`
        : "All core fields captured.",
    },
    {
      label: "Policy documents verified",
      done:
        client.documents.length > 0 &&
        client.documents.every((d) => d.verified),
      detail: `${client.documents.filter((d) => d.verified).length}/${client.documents.length} documents human-verified.`,
    },
    {
      label: "Beneficiary context documented",
      done: scores.beneficiaryScore >= 70,
      detail: `Beneficiary score ${scores.beneficiaryScore}/100.`,
    },
    {
      label: "Funding at or above target premium",
      done: fundedToTarget,
      detail: fundedToTarget
        ? "At least one policy funded to target."
        : "No policy confirmed at target funding — review with client.",
    },
    {
      label: "Coverage gap reviewed",
      done: scores.protectionScore >= 60,
      detail: `Protection score ${scores.protectionScore}/100.`,
    },
    {
      label: "Review scheduled per priority",
      done: scores.reviewPriorityScore < HIGH_PRIORITY_THRESHOLD,
      detail: `Review priority ${scores.reviewPriorityScore}/100 (${reviewStatus(scores.reviewPriorityScore)}).`,
    },
  ];
}

/** IMO demo seed: two advisors sharing the same intelligence engine. */
export function buildImoSeed(): AdvisorRoster[] {
  const jordan: AdvisorRoster = {
    advisorName: "Jordan Lee",
    clients: buildAdvisorRoster(),
  };

  const samProfile = seedClientFromUtterances(
    "client_sam",
    "Sam Okafor",
    "sam@example.com",
    [
      "I'm single, no kids.",
      "I live in NY, renting.",
      "I make about $130k a year.",
      "I'm 29 years old.",
      "I want to maximize cash value and grow long-term.",
    ],
    { annualIncome: 130000, currentAge: 29 },
  );
  let samDoc = ingestDocument({
    userId: "client_sam",
    filename: "Mutual_Omaha_IUL_Illustration.pdf",
  });
  samDoc = verifyDocument(samDoc);

  const evaProfile = seedClientFromUtterances(
    "client_eva",
    "Eva Martins",
    "eva@example.com",
    [
      "I'm married with one kid.",
      "I live in AZ and I have a mortgage of about $280,000.",
      "I make about $88k a year.",
      "I'm 41 years old.",
      "I'm worried about my policy lapsing.",
    ],
    { mortgageBalance: 280000, annualIncome: 88000, currentAge: 41 },
  );
  const evaDoc = ingestDocument({
    userId: "client_eva",
    filename: "Annual_Statement_IUL.pdf",
    rawText: [
      "NORTH AMERICAN COMPANY",
      "Indexed Universal Life Annual Statement",
      "Product: Builder Plus IUL",
      "Issue Age: 38",
      "Face Amount: $300,000",
      "Death Benefit: $300,000",
      "Cash Surrender Value: $9,800",
      "Target Premium: $4,100",
      "Current Planned Premium: $2,400",
      "Cost of Insurance (COI) Annual: $1,300",
      "Outstanding Loans: $2,500",
    ].join("\n"),
  });
  // Intentionally left unverified — shows up in IMO verification metrics.

  const priya: AdvisorRoster = {
    advisorName: "Priya Shah",
    clients: [
      {
        id: "client_sam",
        label: "Sam Okafor",
        summary: "NY · single, 29 · accumulation-focused IUL",
        profile: samProfile,
        documents: [samDoc],
      },
      {
        id: "client_eva",
        label: "Eva Martins",
        summary: "AZ · married, 1 kid · underfunded IUL with loan — lapse concern",
        profile: evaProfile,
        documents: [evaDoc],
      },
    ],
  };

  return [jordan, priya];
}
