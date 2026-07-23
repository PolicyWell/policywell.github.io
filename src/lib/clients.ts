import { ingestDocument, verifyDocument } from "./extraction";
import { extractFromUtterance, applyProfileEdits } from "./onboarding";
import { createEmptyProfile, refreshProfileMeta } from "./profile";
import { buildDemoSeed } from "./seed";
import type { IngestedDocument, UserProfile } from "./types";

export interface ClientRecord {
  id: string;
  label: string;
  summary: string;
  profile: UserProfile;
  documents: IngestedDocument[];
}

export function seedClientFromUtterances(
  id: string,
  name: string,
  email: string,
  utterances: string[],
  edits: Parameters<typeof applyProfileEdits>[1],
): UserProfile {
  let profile = createEmptyProfile(id, "policyholder", name, email);
  for (const u of utterances) {
    profile = extractFromUtterance(profile, u);
  }
  profile = applyProfileEdits(profile, edits);
  profile.onboardingComplete = true;
  return refreshProfileMeta(profile);
}

/** Advisor demo roster: three households in different situations. */
export function buildAdvisorRoster(): ClientRecord[] {
  // Client 1: demo household + a proposed FIA quote for comparison
  const alex = buildDemoSeed();
  let fiaQuote = ingestDocument({
    userId: alex.profile.userId,
    filename: "Athene_Performance_Elite_FIA_Quote.pdf",
  });
  fiaQuote = verifyDocument(fiaQuote);

  // Client 2: underinsured young family with term coverage
  const taylorProfile = seedClientFromUtterances(
    "client_taylor",
    "Taylor Brooks",
    "taylor@example.com",
    [
      "I'm married and have two kids.",
      "I live in FL and I have a mortgage of about $410,000.",
      "I make about $95k a year.",
      "I'm 34 years old.",
      "I'm worried about income replacement and protecting my family.",
    ],
    { mortgageBalance: 410000, annualIncome: 95000, currentAge: 34 },
  );
  let taylorDoc = ingestDocument({
    userId: "client_taylor",
    filename: "Term_Policy_Statement.pdf",
    rawText: [
      "BANNER LIFE INSURANCE COMPANY",
      "Term Life Policy Annual Statement",
      "Product: OPTerm 20",
      "Issue Age: 30",
      "Face Amount: $250,000",
      "Death Benefit: $250,000",
      "Premium: $420",
    ].join("\n"),
  });
  taylorDoc = verifyDocument(taylorDoc);

  // Client 3: pre-retiree with whole life, estate focus
  const rukaProfile = seedClientFromUtterances(
    "client_ruka",
    "Ruka Tanaka",
    "ruka@example.com",
    [
      "I'm married, no kids at home.",
      "I live in WA, no mortgage.",
      "I make about $220k a year.",
      "I'm 58 years old and planning for retirement at 65.",
      "Estate planning matters to me.",
    ],
    { annualIncome: 220000, currentAge: 58 },
  );
  let rukaDoc = ingestDocument({
    userId: "client_ruka",
    filename: "Whole_Life_InForce_Ledger.pdf",
    rawText: [
      "PACIFIC LIFE INSURANCE COMPANY",
      "Whole Life In-Force Ledger",
      "Product: Legacy Whole Life",
      "Issue Age: 45",
      "Face Amount: $1,000,000",
      "Death Benefit: $1,000,000",
      "Cash Surrender Value: $310,000",
      "Target Premium: $22,000",
      "Current Planned Premium: $22,000",
      "Cost of Insurance (COI) Annual: $6,400",
      "Outstanding Loans: $40,000",
      "Riders: Paid-Up Additions",
    ].join("\n"),
  });
  rukaDoc = verifyDocument(rukaDoc);

  return [
    {
      id: "client_alex",
      label: "Alex Rivera",
      summary: "TX · married, 3 kids · Mutual of Omaha IUL + proposed Athene FIA (1035 review)",
      profile: alex.profile,
      documents: [...alex.documents, fiaQuote],
    },
    {
      id: "client_taylor",
      label: "Taylor Brooks",
      summary: "FL · married, 2 kids · $250k term vs $410k mortgage - coverage gap review",
      profile: taylorProfile,
      documents: [taylorDoc],
    },
    {
      id: "client_ruka",
      label: "Ruka Tanaka",
      summary: "WA · pre-retiree · $1M whole life with $40k loan - estate/annual review",
      profile: rukaProfile,
      documents: [rukaDoc],
    },
  ];
}
