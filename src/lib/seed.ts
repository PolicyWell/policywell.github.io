import { ingestDocument, verifyDocument } from "./extraction";
import { applyProfileEdits, extractFromUtterance } from "./onboarding";
import { createEmptyProfile, field, refreshProfileMeta } from "./profile";
import type { IngestedDocument, SessionUser, UserProfile } from "./types";

export const DEMO_USERS: SessionUser[] = [
  {
    id: "user_alex",
    email: "alex@example.com",
    name: "Alex Rivera",
    role: "policyholder",
  },
  {
    id: "user_jordan",
    email: "jordan@advisors.example",
    name: "Jordan Lee",
    role: "advisor",
  },
  {
    id: "user_morgan",
    email: "morgan@carrier.example",
    name: "Morgan Chen",
    role: "carrier",
  },
  {
    id: "user_casey",
    email: "casey@imo.example",
    name: "Casey Nguyen",
    role: "imo",
  },
  {
    id: "user_riley",
    email: "riley@firm.example",
    name: "Riley Quinn",
    role: "broker_dealer",
  },
];

export function authenticateDemo(email: string): SessionUser | null {
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

/** Investor demo: Mutual of Omaha IUL household ready for walkthrough. */
export function buildDemoSeed(user: SessionUser = DEMO_USERS[0]): {
  profile: UserProfile;
  documents: IngestedDocument[];
} {
  let profile = createEmptyProfile(user.id, user.role, user.name, user.email);
  const utterances = [
    "I'm married and have three kids.",
    "I live in TX and I have a mortgage of about $320,000.",
    "I own a business and make about $180k a year.",
    "I'm 42 years old.",
    "I have a Mutual of Omaha Indexed Universal Life policy.",
    "I'm planning for retirement and I'm worried about my policy lapsing.",
  ];
  for (const u of utterances) {
    profile = extractFromUtterance(profile, u);
  }
  profile = applyProfileEdits(profile, {
    mortgageBalance: 320000,
    annualIncome: 180000,
    currentAge: 42,
  });
  profile.household.members = [
    { id: "m_self", name: user.name, relationship: "self", age: 42 },
    { id: "m_spouse", name: "Sam Rivera", relationship: "spouse", age: 40 },
    { id: "m_c1", name: "Child 1", relationship: "child", age: 12 },
    { id: "m_c2", name: "Child 2", relationship: "child", age: 9 },
    { id: "m_c3", name: "Child 3", relationship: "child", age: 6 },
  ];
  profile.onboardingComplete = true;
  profile = refreshProfileMeta(profile);

  let doc = ingestDocument({
    userId: user.id,
    filename: "Mutual_of_Omaha_IUL_InForce.pdf",
    mimeType: "application/pdf",
  });
  doc = verifyDocument(doc);

  profile.insurance.policies = [
    {
      id: "policy_demo_iul",
      carrier: field("Mutual of Omaha", 1, "seed"),
      productName: field("Life Protection Advantage IUL", 1, "seed"),
      productType: field("Indexed Universal Life", 1, "seed"),
      faceAmount: field(500000, 1, "seed"),
      cashValue: field(48250, 1, "seed"),
      targetPremium: field(6200, 1, "seed"),
      currentPremium: field(5400, 1, "seed"),
      deathBenefit: field(500000, 1, "seed"),
      issueAge: field(42, 1, "seed"),
      loans: field(0, 1, "seed"),
      riders: field(["Accelerated Death Benefit", "Waiver of Premium"], 1, "seed"),
      documentId: doc.id,
    },
  ];
  profile.insurance.policyCount = field(1, 1, "seed");
  profile = refreshProfileMeta(profile);

  return { profile, documents: [doc] };
}
