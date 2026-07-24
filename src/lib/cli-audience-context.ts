import type { CliAudience, TerminalLine } from "./cli-showcase-data";
import { ingestDocument } from "./extraction";
import { applyProfileEdits, extractFromUtterance } from "./onboarding";
import { createEmptyProfile, refreshProfileMeta } from "./profile";
import type { IngestedDocument, SessionUser, UserProfile, UserRole } from "./types";

export type ParsedAudienceContext = {
  audienceId: string;
  role: UserRole;
  user: SessionUser;
  profile: UserProfile;
  documents: IngestedDocument[];
  /** One-line status for the terminal after a tab switch. */
  statusLine: string;
};

function money(blob: string, label: RegExp): number | null {
  const m = blob.match(
    new RegExp(`${label.source}\\s*\\$?([\\d,]+(?:\\.\\d+)?)`, "i"),
  );
  if (!m) return null;
  return Number(m[1].replace(/,/g, ""));
}

function fieldValue(blob: string, label: RegExp): string | null {
  const m = blob.match(new RegExp(`${label.source}\\s+(.+)$`, "im"));
  return m?.[1]?.trim() || null;
}

function linesBlob(lines: TerminalLine[]): string {
  return lines.map((l) => l.text).join("\n");
}

function roleForAudience(id: string): UserRole {
  if (id === "carriers") return "carrier";
  if (id === "imos") return "imo";
  return "policyholder";
}

function userForAudience(id: string): SessionUser {
  if (id === "carriers") {
    return {
      id: "user_morgan",
      email: "morgan@carrier.example",
      name: "Morgan Chen",
      role: "carrier",
    };
  }
  if (id === "imos") {
    return {
      id: "user_casey",
      email: "casey@imo.example",
      name: "Casey Nguyen",
      role: "imo",
    };
  }
  return {
    id: "user_alex",
    email: "alex@example.com",
    name: "Alex Morgan",
    role: "policyholder",
  };
}

/**
 * Parse the scripted homepage demo for an audience tab into live agent workspace
 * data, so interactive prompts stay grounded after Policyholder / Carrier / IMO switches.
 */
export function parseAudienceDemo(audience: CliAudience): ParsedAudienceContext {
  const role = roleForAudience(audience.id);
  const user = userForAudience(audience.id);
  const blob = linesBlob(audience.lines);
  let profile = createEmptyProfile(user.id, role, user.name, user.email);
  const documents: IngestedDocument[] = [];

  if (audience.id === "policyholders") {
    const carrier =
      /mutual-of-omaha/i.test(blob) || /mutual of omaha/i.test(blob)
        ? "Mutual of Omaha"
        : fieldValue(blob, /Carrier/) || "Mutual of Omaha";
    const productType =
      fieldValue(blob, /Policy type/) || "Indexed Universal Life";
    const deathBenefit = money(blob, /Death benefit/);
    const monthlyPremium = money(blob, /Monthly premium/);
    const cashValue = money(blob, /Cash value/);
    const policyId = blob.match(/Policy\s+(\d+)/i)?.[1] ?? "7842";
    const household =
      blob.match(/--household\s+([a-z0-9-]+)/i)?.[1]?.replace(/-/g, " ") ||
      "Alex Morgan";

    for (const u of [
      `I'm ${household}.`,
      `I have a ${carrier} ${productType} policy.`,
      "I'm worried about my policy lapsing and planning for retirement.",
    ]) {
      profile = extractFromUtterance(profile, u);
    }
    profile = applyProfileEdits(profile, {
      currentAge: 42,
    });
    profile.onboardingComplete = true;
    profile = refreshProfileMeta(profile);

    const annualPremium =
      monthlyPremium != null ? Math.round(monthlyPremium * 12) : null;
    const rawText = [
      `${carrier.toUpperCase()}`,
      `Indexed Universal Life Policy Illustration / In-Force Summary`,
      `Policy Number: ${policyId}`,
      `Product: ${productType}`,
      `Issue Age: 42`,
      deathBenefit != null ? `Face Amount: $${deathBenefit.toLocaleString()}` : null,
      deathBenefit != null
        ? `Death Benefit: $${deathBenefit.toLocaleString()}`
        : null,
      cashValue != null
        ? `Cash Surrender Value: $${cashValue.toLocaleString()}`
        : null,
      annualPremium != null
        ? `Target Premium: $${annualPremium.toLocaleString()}`
        : null,
      annualPremium != null
        ? `Current Planned Premium: $${annualPremium.toLocaleString()}`
        : null,
      "Cost of Insurance (COI) Annual: $1,850",
      "Outstanding Loans: $0",
      "Assumptions: illustrated values from homepage Policyholder demo; non-guaranteed elements may change.",
    ]
      .filter(Boolean)
      .join("\n");

    documents.push(
      ingestDocument({
        userId: user.id,
        filename: `${carrier.replace(/\s+/g, "_")}_IUL_${policyId}.pdf`,
        mimeType: "application/pdf",
        rawText,
      }),
    );

    return {
      audienceId: audience.id,
      role,
      user,
      profile,
      documents,
      statusLine: `Parsed Policyholder demo · ${carrier} IUL #${policyId} · ${household}`,
    };
  }

  if (audience.id === "carriers") {
    const batch = blob.match(/([\d,]+)\s+policy records/i)?.[1]?.replace(/,/g, "") ?? "10000";
    const lapse = blob.match(/([\d,]+)\s+lapse-risk/i)?.[1]?.replace(/,/g, "") ?? "327";
    for (const u of [
      "I work at a life insurance carrier on retention and policy administration.",
      "We sync IUL policies from a legacy mainframe into PolicyWell.",
      `We normalized ${batch} policy records and detected ${lapse} lapse-risk opportunities.`,
    ]) {
      profile = extractFromUtterance(profile, u);
    }
    profile.onboardingComplete = true;
    profile = refreshProfileMeta(profile);

    documents.push(
      ingestDocument({
        userId: user.id,
        filename: "Carrier_IUL_Batch_Retention_Pack.pdf",
        mimeType: "application/pdf",
        rawText: [
          "CARRIER RETENTION WORKFLOW",
          "Product: Indexed Universal Life",
          `Batch size: ${batch}`,
          `Lapse-risk opportunities: ${lapse}`,
          "Connectors: Guidewire, Salesforce, Mainframe, SFTP batch",
          "Workflow: policy-review API deployed",
        ].join("\n"),
      }),
    );

    return {
      audienceId: audience.id,
      role,
      user,
      profile,
      documents,
      statusLine: `Parsed Carrier demo · ${Number(batch).toLocaleString()} policies · ${Number(lapse).toLocaleString()} lapse-risk flags`,
    };
  }

  // IMOs
  const household =
    fieldValue(blob, /Household/) || "Morgan Family";
  const policyType = fieldValue(blob, /Current policy/) || "IUL";
  const premiumBump = fieldValue(blob, /Estimated premium/) || "+$188/month";
  const book =
    blob.match(/--book\s+([a-z0-9-]+)/i)?.[1]?.replace(/-/g, " ") ||
    "national advisors";
  const policies =
    blob.match(/([\d,]+)\s+policies imported/i)?.[1]?.replace(/,/g, "") ?? "4826";

  for (const u of [
    `I run an IMO book for ${book}.`,
    `Top opportunity is the ${household} household with a ${policyType} policy.`,
    `Recommendation is to increase coverage about ${premiumBump}.`,
  ]) {
    profile = extractFromUtterance(profile, u);
  }
  profile.onboardingComplete = true;
  profile = refreshProfileMeta(profile);

  documents.push(
    ingestDocument({
      userId: user.id,
      filename: `${household.replace(/\s+/g, "_")}_${policyType}_Opportunity.pdf`,
      mimeType: "application/pdf",
      rawText: [
        "IMO OPPORTUNITY PIPELINE",
        `Book: ${book}`,
        `Policies imported: ${policies}`,
        `Household: ${household}`,
        `Current policy: ${policyType}`,
        `Recommendation: Increase coverage`,
        `Estimated premium: ${premiumBump}`,
        "Status: Awaiting approval",
        "Assigned broker: J. Smith",
      ].join("\n"),
    }),
  );

  return {
    audienceId: audience.id,
    role,
    user,
    profile,
    documents,
    statusLine: `Parsed IMO demo · ${household} · ${policyType} · ${premiumBump}`,
  };
}
