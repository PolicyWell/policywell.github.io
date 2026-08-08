import { provenanced } from "./commercial-fields";
import { field } from "./profile";
import type {
  AggregatedCoverage,
  CommercialLine,
  CommercialPolicySummary,
} from "./commercial-types";
import { COMMERCIAL_LINES, LOB_LABELS } from "./commercial-types";

/** Program LOBs shown in V1 aggregation (excludes legacy epli alias as primary). */
export const PROGRAM_LINES: CommercialLine[] = [
  "commercial_property",
  "general_liability",
  "workers_compensation",
  "commercial_auto",
  "umbrella",
  "excess",
  "cyber",
  "d_and_o",
  "e_and_o",
  "crime",
  "fiduciary",
  "environmental",
  "marine",
  "builders_risk",
  "professional_liability",
  "specialty",
];

function inferStatus(
  expirationDate: string | null | undefined,
): AggregatedCoverage["status"] {
  if (!expirationDate) return "pending";
  const exp = new Date(expirationDate);
  if (Number.isNaN(exp.getTime())) return "pending";
  return exp.getTime() < Date.now() ? "expired" : "in_force";
}

/** Normalize existing insurance program into one row per coverage line. */
export function aggregateInsuranceProgram(
  policies: CommercialPolicySummary[],
): AggregatedCoverage[] {
  const byLine = new Map<CommercialLine, CommercialPolicySummary>();
  for (const p of policies) {
    const existing = byLine.get(p.line);
    if (!existing) {
      byLine.set(p.line, p);
      continue;
    }
    const existingPrem = existing.premium.value ?? 0;
    const nextPrem = p.premium.value ?? 0;
    if (nextPrem >= existingPrem) byLine.set(p.line, p);
  }

  return PROGRAM_LINES.map((line) => {
    const p = byLine.get(line);
    if (!p) {
      return {
        id: `cov_missing_${line}`,
        line,
        label: LOB_LABELS[line],
        carrier: provenanced<string>(null),
        policyNumber: provenanced<string>(null),
        productName: provenanced<string>(null),
        occurrenceLimit: provenanced<number>(null),
        aggregateLimit: provenanced<number>(null),
        deductible: provenanced<number>(null),
        annualPremium: provenanced<number>(null),
        effectiveDate: provenanced<string>(null),
        expirationDate: provenanced<string>(null),
        status: "not_on_file",
        documentId: null,
      };
    }

    const docId = p.documentId ?? null;
    const toProv = <T,>(fc: { value: T | null; confidence: number; source?: string }, excerpt: string | null) =>
      provenanced(fc.value, {
        confidence: fc.confidence,
        sourceDocumentId: docId,
        sourceDocumentName: fc.source ?? null,
        pageNumber: null,
        sourceExcerpt: fc.value != null ? excerpt : null,
      });

    return {
      id: `cov_${p.id}`,
      line,
      label: LOB_LABELS[line],
      carrier: toProv(p.carrier, p.carrier.value ? `Carrier: ${p.carrier.value}` : null),
      policyNumber: toProv(
        p.policyNumber ?? field(null, 0),
        p.policyNumber?.value ? `Policy Number: ${p.policyNumber.value}` : null,
      ),
      productName: toProv(
        p.productName,
        p.productName.value ? `Product: ${p.productName.value}` : null,
      ),
      occurrenceLimit: toProv(
        p.limit,
        p.limit.value != null ? `Limit: $${p.limit.value}` : null,
      ),
      aggregateLimit: toProv(
        p.aggregateLimit ?? field(null, 0),
        p.aggregateLimit?.value != null
          ? `Aggregate: $${p.aggregateLimit.value}`
          : null,
      ),
      deductible: toProv(
        p.deductible,
        p.deductible.value != null ? `Deductible: $${p.deductible.value}` : null,
      ),
      annualPremium: toProv(
        p.premium,
        p.premium.value != null ? `Premium: $${p.premium.value}` : null,
      ),
      effectiveDate: toProv(
        p.effectiveDate,
        p.effectiveDate.value ? `Effective: ${p.effectiveDate.value}` : null,
      ),
      expirationDate: toProv(
        p.expirationDate,
        p.expirationDate.value ? `Expiration: ${p.expirationDate.value}` : null,
      ),
      status: p.status ?? inferStatus(p.expirationDate.value),
      documentId: docId,
    };
  });
}

export function sumProgramPremium(coverages: AggregatedCoverage[]): number | null {
  const premiums = coverages
    .filter((c) => c.status !== "not_on_file")
    .map((c) => c.annualPremium.value)
    .filter((v): v is number => v != null);
  if (!premiums.length) return null;
  return premiums.reduce((a, b) => a + b, 0);
}

export function countPoliciesOnFile(coverages: AggregatedCoverage[]): number {
  return coverages.filter((c) => c.status !== "not_on_file").length;
}

export function isCommercialLine(value: string): value is CommercialLine {
  return (COMMERCIAL_LINES as readonly string[]).includes(value);
}
