import { createEmptyProfile, field, refreshProfileMeta } from "./profile";
import type {
  OnboardingMessage,
  OnboardingState,
  UserProfile,
  UserRole,
} from "./types";

const STATE_CODES = new Set(
  "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(
    " ",
  ),
);

function extractState(text: string): string | null {
  const liveIn = text.match(
    /\b(?:live|reside|based|from)\s+in\s+([A-Za-z]{2})\b/i,
  );
  if (liveIn) {
    const code = liveIn[1].toUpperCase();
    if (STATE_CODES.has(code)) return code;
  }
  // Only accept explicit uppercase postal codes to avoid matching "in", "or", "me"
  const upper = text.match(/\b([A-Z]{2})\b/g);
  if (upper) {
    for (const code of upper) {
      if (STATE_CODES.has(code)) return code;
    }
  }
  return null;
}

const CARRIERS = [
  "Mutual of Omaha",
  "Pacific Life",
  "Nationwide",
  "Lincoln",
  "Prudential",
  "John Hancock",
  "North American",
  "Allianz",
  "Athene",
  "Securian",
];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function extractMoney(text: string): number | null {
  const match = text.match(/\$?\s*([\d,]+(?:\.\d+)?)\s*(k|m)?/i);
  if (!match) return null;
  let n = parseFloat(match[1].replace(/,/g, ""));
  const suffix = (match[2] || "").toLowerCase();
  if (suffix === "k") n *= 1000;
  if (suffix === "m") n *= 1_000_000;
  return Number.isFinite(n) ? n : null;
}

function extractCount(text: string, patterns: RegExp[]): number | null {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return parseInt(m[1], 10);
  }
  const words: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
  };
  for (const [word, n] of Object.entries(words)) {
    if (new RegExp(`\\b${word}\\b`, "i").test(text)) {
      if (/kid|child|dependent|polic/i.test(text)) return n;
    }
  }
  return null;
}

/** Extract structured profile updates from free-form conversational input. */
export function extractFromUtterance(
  profile: UserProfile,
  utterance: string,
): UserProfile {
  const text = utterance.trim();
  const lower = text.toLowerCase();
  const next: UserProfile = structuredClone(profile);

  if (/\bmarried\b/i.test(text)) {
    next.household.maritalStatus = field("married", 0.95, "utterance");
    if (!next.household.members.some((m) => m.relationship === "spouse")) {
      next.household.members.push({
        id: uid("member"),
        name: "Spouse",
        relationship: "spouse",
      });
    }
  } else if (/\bsingle\b/i.test(text)) {
    next.household.maritalStatus = field("single", 0.9, "utterance");
  } else if (/\bpartner(ed)?\b/i.test(text)) {
    next.household.maritalStatus = field("partnered", 0.85, "utterance");
  }

  const kids = extractCount(text, [
    /(\d+)\s*(kids|children|dependents)/i,
    /have\s+(\d+)\s+(kids|children)/i,
  ]);
  if (kids !== null) {
    next.household.dependentsCount = field(kids, 0.92, "utterance");
    const existingKids = next.household.members.filter((m) => m.relationship === "child").length;
    for (let i = existingKids; i < kids; i++) {
      next.household.members.push({
        id: uid("member"),
        name: `Child ${i + 1}`,
        relationship: "child",
      });
    }
  }

  if (/\b(own|have)\s+(a\s+)?business\b/i.test(text) || /\bbusiness owner\b/i.test(text)) {
    next.household.ownsBusiness = field(true, 0.9, "utterance");
  }

  if (/\bmortgage\b/i.test(text)) {
    next.household.hasMortgage = field(true, 0.92, "utterance");
    const bal = extractMoney(text);
    if (bal !== null && /mortgage|owe|balance|left/i.test(text)) {
      next.household.mortgageBalance = field(bal, 0.8, "utterance");
    }
  } else if (/\bno mortgage|rent(ing)?\b/i.test(text)) {
    next.household.hasMortgage = field(false, 0.9, "utterance");
  }

  const stateCode = extractState(text);
  if (stateCode) {
    next.household.state = field(stateCode, 0.95, "utterance");
  }

  const ageMatch = text.match(/\b(?:i(?:'m| am)\s+)?(\d{2})\s*(?:years?\s*old|yo)?\b/i);
  if (ageMatch && /age|years?\s*old|i(?:'m| am)\s+\d/i.test(lower)) {
    next.retirement.currentAge = field(parseInt(ageMatch[1], 10), 0.9, "utterance");
  }

  const incomeMatch = text.match(/(?:make|earn|income|salary).{0,20}?(\$?[\d,]+(?:\.\d+)?\s*[km]?)/i)
    || text.match(/(\$?[\d,]+(?:\.\d+)?\s*[km]?)\s+(?:a year|per year|annually|income)/i);
  if (incomeMatch) {
    const income = extractMoney(incomeMatch[1]);
    if (income !== null) {
      next.financial.annualIncome = field(income, 0.85, "utterance");
    }
  }

  const policyCount = extractCount(text, [
    /(\d+)\s+(life\s+)?(insurance\s+)?polic(?:y|ies)/i,
    /own\s+(\d+)\s+polic/i,
  ]);
  if (policyCount !== null) {
    next.insurance.policyCount = field(policyCount, 0.9, "utterance");
  } else if (/\blife insurance policy\b/i.test(text) || /\biul\b/i.test(text)) {
    next.insurance.policyCount = field(
      Math.max(next.insurance.policyCount.value ?? 1, 1),
      0.75,
      "utterance",
    );
  }

  for (const carrier of CARRIERS) {
    if (new RegExp(carrier.replace(/\s+/g, "\\s+"), "i").test(text)) {
      next.carrier.primaryCarrier = field(carrier, 0.95, "utterance");
      if (!next.carrier.carriers.includes(carrier)) {
        next.carrier.carriers.push(carrier);
      }
      const productType = /\biul\b|indexed universal/i.test(text)
        ? "Indexed Universal Life"
        : /\bfia\b|fixed index(?:ed)? annuity/i.test(text)
          ? "Fixed Indexed Annuity"
          : /\bwhole life\b/i.test(text)
            ? "Whole Life"
            : /\bterm\b/i.test(text)
              ? "Term Life"
              : null;
      if (productType || carrier) {
        const existing = next.insurance.policies[0];
        const policy = existing ?? {
          id: uid("policy"),
          carrier: field(carrier, 0.95, "utterance"),
          productName: field(null, 0),
          productType: field(null, 0),
          faceAmount: field(null, 0),
          cashValue: field(null, 0),
          targetPremium: field(null, 0),
          currentPremium: field(null, 0),
          deathBenefit: field(null, 0),
          issueAge: field(null, 0),
          loans: field(null, 0),
          riders: field([], 0),
        };
        policy.carrier = field(carrier, 0.95, "utterance");
        if (productType) policy.productType = field(productType, 0.9, "utterance");
        if (!existing) next.insurance.policies.push(policy);
        if (!next.insurance.policyCount.value) {
          next.insurance.policyCount = field(1, 0.8, "utterance");
        }
      }
    }
  }

  if (/retir(e|ement)/i.test(text)) {
    next.goals.retirementPlanning = field(true, 0.9, "utterance");
    next.goals.notes.push(text);
  }
  if (/estate/i.test(text)) {
    next.goals.estatePlanning = field(true, 0.9, "utterance");
  }
  if (/cash value|accumulate|grow/i.test(text)) {
    next.goals.maximizeCashValue = field(true, 0.85, "utterance");
  }
  if (/laps(e|ing)|worried about.*polic/i.test(text)) {
    next.goals.preventLapse = field(true, 0.95, "utterance");
    next.insurance.worriedAboutLapse = field(true, 0.95, "utterance");
    next.risk.primaryConcerns.push("Policy lapse risk");
  }
  if (/income replacement|replace.*income|protect.*family/i.test(text)) {
    next.goals.incomeReplacement = field(true, 0.85, "utterance");
  }

  const retireAge = text.match(/retir(?:e|ement).{0,20}?(\d{2})/i);
  if (retireAge) {
    next.retirement.targetRetirementAge = field(parseInt(retireAge[1], 10), 0.85, "utterance");
  }

  return refreshProfileMeta(next);
}

export function nextAssistantPrompt(profile: UserProfile): string {
  const missing = profile.missingFields;
  if (missing.includes("Marital status")) {
    return "Thanks - tell me a bit about your household. Are you married, partnered, or single?";
  }
  if (missing.includes("Dependents")) {
    return "Do you have children or other dependents? If so, how many?";
  }
  if (missing.includes("State of residence")) {
    return "Which state do you live in? (e.g. TX, CA, FL)";
  }
  if (missing.includes("Mortgage status")) {
    return "Do you currently have a mortgage on your home?";
  }
  if (missing.includes("Mortgage balance")) {
    return "Roughly what is left on the mortgage?";
  }
  if (missing.includes("Annual income")) {
    return "What is your approximate annual household income?";
  }
  if (missing.includes("Current age")) {
    return "How old are you currently?";
  }
  if (missing.includes("Number of policies")) {
    return "Tell me about your insurance. How many life insurance policies do you own, and with which carriers?";
  }
  if (missing.includes("Primary goals")) {
    return "What matters most right now - retirement planning, preventing a lapse, maximizing cash value, estate planning, or protecting income?";
  }
  if (profile.overallConfidence >= 0.7) {
    return "I have a solid picture of your situation. You can review and edit anything I extracted, then we'll save your PolicyWell profile.";
  }
  return "Is there anything else about your household, policies, or goals I should know?";
}

export function createOnboardingState(
  userId: string,
  role: UserRole,
  name: string,
  email: string,
): OnboardingState {
  const profile = createEmptyProfile(userId, role, name, email);
  const welcome: OnboardingMessage = {
    id: uid("msg"),
    role: "assistant",
    content:
      `Hi ${name.split(" ")[0] || "there"} - I'm your PolicyWell intelligence agent. ` +
      `Rather than a form, I'll interview you so we can build your household, financial, and insurance context. ` +
      `Start anywhere: family, policies, goals, or what's keeping you up at night.`,
    at: new Date().toISOString(),
  };
  return { messages: [welcome], profile, complete: false };
}

export function processOnboardingTurn(
  state: OnboardingState,
  userText: string,
): OnboardingState {
  const userMsg: OnboardingMessage = {
    id: uid("msg"),
    role: "user",
    content: userText,
    at: new Date().toISOString(),
  };
  const profile = extractFromUtterance(state.profile, userText);
  const assistantMsg: OnboardingMessage = {
    id: uid("msg"),
    role: "assistant",
    content: nextAssistantPrompt(profile),
    at: new Date().toISOString(),
  };
  const complete =
    profile.overallConfidence >= 0.65 && profile.missingFields.length <= 2;
  return {
    messages: [...state.messages, userMsg, assistantMsg],
    profile: { ...profile, onboardingComplete: complete },
    complete,
  };
}

export function applyProfileEdits(
  profile: UserProfile,
  edits: Partial<{
    maritalStatus: UserProfile["household"]["maritalStatus"]["value"];
    dependentsCount: number | null;
    state: string | null;
    hasMortgage: boolean | null;
    mortgageBalance: number | null;
    annualIncome: number | null;
    currentAge: number | null;
    policyCount: number | null;
    primaryCarrier: string | null;
  }>,
): UserProfile {
  const next = structuredClone(profile);
  if (edits.maritalStatus !== undefined) {
    next.household.maritalStatus = field(edits.maritalStatus, 1, "user_edit");
  }
  if (edits.dependentsCount !== undefined) {
    next.household.dependentsCount = field(edits.dependentsCount, 1, "user_edit");
  }
  if (edits.state !== undefined) {
    next.household.state = field(edits.state, 1, "user_edit");
  }
  if (edits.hasMortgage !== undefined) {
    next.household.hasMortgage = field(edits.hasMortgage, 1, "user_edit");
  }
  if (edits.mortgageBalance !== undefined) {
    next.household.mortgageBalance = field(edits.mortgageBalance, 1, "user_edit");
  }
  if (edits.annualIncome !== undefined) {
    next.financial.annualIncome = field(edits.annualIncome, 1, "user_edit");
  }
  if (edits.currentAge !== undefined) {
    next.retirement.currentAge = field(edits.currentAge, 1, "user_edit");
  }
  if (edits.policyCount !== undefined) {
    next.insurance.policyCount = field(edits.policyCount, 1, "user_edit");
  }
  if (edits.primaryCarrier !== undefined) {
    next.carrier.primaryCarrier = field(edits.primaryCarrier, 1, "user_edit");
  }
  return refreshProfileMeta(next);
}
