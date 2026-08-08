import { provenanced } from "./commercial-fields";
import type {
  CommercialDocClassification,
  CommercialDocument,
  ProvenancedField,
} from "./commercial-types";

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".eml",
] as const;

export function isAcceptedCommercialUpload(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function mimeForFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".xlsx"))
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".eml")) return "message/rfc822";
  return "application/octet-stream";
}

/** Classify commercial uploads — never invents content, only labels. */
export function classifyCommercialDocument(
  filename: string,
  ocrText = "",
): CommercialDocClassification {
  const blob = `${filename} ${ocrText}`.toLowerCase();
  if (blob.includes("loss run") || blob.includes("loss_run") || blob.includes("lossrun")) {
    return "loss_run";
  }
  if (
    blob.includes("statement of values") ||
    blob.includes("schedule of values") ||
    blob.includes("statement_of_values") ||
    blob.includes("schedule_of_values") ||
    /(^|[^a-z])sov([^a-z]|$)/.test(blob)
  ) {
    return "statement_of_values";
  }
  if (
    blob.includes("financial statement") ||
    blob.includes("financial_statement") ||
    blob.includes("balance sheet") ||
    blob.includes("income statement") ||
    blob.includes("p&l")
  ) {
    return "financial_statement";
  }
  if (
    blob.includes("vehicle schedule") ||
    blob.includes("vehicle_schedule") ||
    blob.includes("auto schedule")
  ) {
    return "vehicle_schedule";
  }
  if (
    blob.includes("property schedule") ||
    blob.includes("property_schedule") ||
    blob.includes("location schedule")
  ) {
    return "property_schedule";
  }
  if (
    blob.includes("environmental questionnaire") ||
    blob.includes("environmental_questionnaire") ||
    blob.includes("pollution questionnaire")
  ) {
    return "environmental_questionnaire";
  }
  if (
    blob.includes("cyber questionnaire") ||
    blob.includes("cyber_questionnaire") ||
    blob.includes("cyber security questionnaire")
  ) {
    return "cyber_questionnaire";
  }
  if (
    blob.includes("claim") &&
    (blob.includes("notice") || blob.includes("loss") || blob.includes("fnol"))
  ) {
    return "claims_document";
  }
  if (
    blob.includes("contract") ||
    blob.includes("msa") ||
    blob.includes("hold harmless") ||
    blob.includes("additional insured")
  ) {
    return "contract";
  }
  if (
    blob.includes("application") ||
    blob.includes("acord 125") ||
    blob.includes("acord 126")
  ) {
    return "application";
  }
  if (
    blob.includes("policy") ||
    blob.includes("declarations") ||
    blob.includes("dec page") ||
    blob.includes("general liability") ||
    blob.includes("workers comp") ||
    blob.includes("workers' compensation")
  ) {
    return "policy";
  }
  return "other";
}

function findExcerpt(
  text: string,
  pattern: RegExp,
): { excerpt: string; pageNumber: number | null } | null {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      const pageMarker = text.slice(0, text.indexOf(lines[i])).match(/---\s*page\s*(\d+)/gi);
      const pageNumber = pageMarker
        ? parseInt(pageMarker[pageMarker.length - 1].replace(/\D/g, ""), 10) || null
        : null;
      return { excerpt: lines[i].trim().slice(0, 240), pageNumber };
    }
  }
  const m = text.match(pattern);
  if (!m) return null;
  const idx = m.index ?? 0;
  const start = Math.max(0, idx - 40);
  const excerpt = text.slice(start, start + 200).replace(/\s+/g, " ").trim();
  return { excerpt, pageNumber: null };
}

function parseMoney(text: string, label: RegExp): number | null {
  // Wrap label in (?:...) so alternation cannot steal the money capture group.
  const m = text.match(
    new RegExp(`(?:${label.source})[:\\s]*\\$?([\\d,]+(?:\\.\\d+)?)`, "i"),
  );
  if (!m?.[1]) return null;
  return parseFloat(m[1].replace(/,/g, ""));
}

function parseIntField(text: string, label: RegExp): number | null {
  const m = text.match(new RegExp(`(?:${label.source})[:\\s]*(\\d+)`, "i"));
  if (!m?.[1]) return null;
  return parseInt(m[1], 10);
}

export type CommercialExtractedAccountFields = {
  companyName: ProvenancedField<string>;
  industry: ProvenancedField<string>;
  headquarters: ProvenancedField<string>;
  annualRevenue: ProvenancedField<number>;
  employeeCount: ProvenancedField<number>;
  currentPremium: ProvenancedField<number>;
  renewalDate: ProvenancedField<string>;
  carrier: ProvenancedField<string>;
  policyNumber: ProvenancedField<string>;
  limit: ProvenancedField<number>;
  deductible: ProvenancedField<number>;
  effectiveDate: ProvenancedField<string>;
  expirationDate: ProvenancedField<string>;
};

/**
 * Structured commercial extraction with full provenance.
 * Missing values stay null — never invented.
 */
export function extractCommercialFields(input: {
  documentId: string;
  filename: string;
  ocrText: string;
}): CommercialExtractedAccountFields {
  const { documentId, filename, ocrText } = input;
  const src = { sourceDocumentId: documentId, sourceDocumentName: filename };

  const companyHit =
    findExcerpt(ocrText, /(?:Named Insured|Insured|Company|Legal Name)\s*[:\-]\s*(.+)/i) ??
    findExcerpt(ocrText, /Harbor Fabrication LLC/i);
  const industryHit = findExcerpt(
    ocrText,
    /(?:Industry|NAICS Description|Business Description)\s*[:\-]\s*(.+)/i,
  );
  const hqHit = findExcerpt(
    ocrText,
    /(?:Headquarters|Mailing Address|Primary Location)\s*[:\-]\s*(.+)/i,
  );
  const revenue = parseMoney(ocrText, /Annual Revenue|Gross Sales|Revenue/i);
  const revenueHit =
    revenue != null
      ? findExcerpt(ocrText, /Annual Revenue|Gross Sales|Revenue/i)
      : null;
  const employees = parseIntField(ocrText, /Employee(?:s)? Count|Number of Employees|Employees/i);
  const employeesHit =
    employees != null
      ? findExcerpt(ocrText, /Employee(?:s)? Count|Number of Employees|Employees/i)
      : null;
  const premium = parseMoney(ocrText, /Annual Premium|Total Premium|Premium/i);
  const premiumHit =
    premium != null
      ? findExcerpt(ocrText, /Annual Premium|Total Premium|Premium/i)
      : null;
  const renewalMatch = ocrText.match(
    /(?:Expiration|Renewal|Policy Period End)\s*Date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  );
  const renewalHit = renewalMatch
    ? findExcerpt(
        ocrText,
        /(?:Expiration|Renewal|Policy Period End)\s*Date/i,
      )
    : null;

  const carrierHit = findExcerpt(
    ocrText,
    /(?:Carrier|Insurer|Insurance Company)\s*[:\-]\s*(.+)/i,
  );
  const policyNumHit = findExcerpt(
    ocrText,
    /(?:Policy Number|Policy No\.?)\s*[:\-]\s*([A-Z0-9\-]+)/i,
  );
  const limit = parseMoney(ocrText, /(?:Occurrence )?Limit|Each Occurrence/i);
  const limitHit =
    limit != null
      ? findExcerpt(ocrText, /(?:Occurrence )?Limit|Each Occurrence/i)
      : null;
  const deductible = parseMoney(ocrText, /Deductible/i);
  const dedHit =
    deductible != null ? findExcerpt(ocrText, /Deductible/i) : null;
  const effMatch = ocrText.match(
    /(?:Effective)\s*Date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  );
  const expMatch = ocrText.match(
    /(?:Expiration)\s*Date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  );

  const companyValue = companyHit
    ? (ocrText.match(
        /(?:Named Insured|Insured|Company|Legal Name)\s*[:\-]\s*(.+)/i,
      )?.[1]?.trim() ??
      (/Harbor Fabrication LLC/i.test(ocrText) ? "Harbor Fabrication LLC" : null))
    : null;

  return {
    companyName: provenanced(companyValue, {
      ...src,
      confidence: companyValue ? 0.9 : 0,
      pageNumber: companyHit?.pageNumber ?? null,
      sourceExcerpt: companyHit?.excerpt ?? null,
    }),
    industry: provenanced(
      industryHit
        ? ocrText.match(
            /(?:Industry|NAICS Description|Business Description)\s*[:\-]\s*(.+)/i,
          )?.[1]?.trim() ?? null
        : null,
      {
        ...src,
        confidence: industryHit ? 0.85 : 0,
        pageNumber: industryHit?.pageNumber ?? null,
        sourceExcerpt: industryHit?.excerpt ?? null,
      },
    ),
    headquarters: provenanced(
      hqHit
        ? ocrText.match(
            /(?:Headquarters|Mailing Address|Primary Location)\s*[:\-]\s*(.+)/i,
          )?.[1]?.trim() ?? null
        : null,
      {
        ...src,
        confidence: hqHit ? 0.85 : 0,
        pageNumber: hqHit?.pageNumber ?? null,
        sourceExcerpt: hqHit?.excerpt ?? null,
      },
    ),
    annualRevenue: provenanced(revenue, {
      ...src,
      confidence: revenue != null ? 0.88 : 0,
      pageNumber: revenueHit?.pageNumber ?? null,
      sourceExcerpt: revenueHit?.excerpt ?? null,
    }),
    employeeCount: provenanced(employees, {
      ...src,
      confidence: employees != null ? 0.9 : 0,
      pageNumber: employeesHit?.pageNumber ?? null,
      sourceExcerpt: employeesHit?.excerpt ?? null,
    }),
    currentPremium: provenanced(premium, {
      ...src,
      confidence: premium != null ? 0.86 : 0,
      pageNumber: premiumHit?.pageNumber ?? null,
      sourceExcerpt: premiumHit?.excerpt ?? null,
    }),
    renewalDate: provenanced(renewalMatch?.[1] ?? null, {
      ...src,
      confidence: renewalMatch ? 0.9 : 0,
      pageNumber: renewalHit?.pageNumber ?? null,
      sourceExcerpt: renewalHit?.excerpt ?? null,
    }),
    carrier: provenanced(
      carrierHit
        ? ocrText.match(
            /(?:Carrier|Insurer|Insurance Company)\s*[:\-]\s*(.+)/i,
          )?.[1]?.trim() ?? null
        : null,
      {
        ...src,
        confidence: carrierHit ? 0.92 : 0,
        pageNumber: carrierHit?.pageNumber ?? null,
        sourceExcerpt: carrierHit?.excerpt ?? null,
      },
    ),
    policyNumber: provenanced(
      policyNumHit
        ? ocrText.match(
            /(?:Policy Number|Policy No\.?)\s*[:\-]\s*([A-Z0-9\-]+)/i,
          )?.[1]?.trim() ?? null
        : null,
      {
        ...src,
        confidence: policyNumHit ? 0.93 : 0,
        pageNumber: policyNumHit?.pageNumber ?? null,
        sourceExcerpt: policyNumHit?.excerpt ?? null,
      },
    ),
    limit: provenanced(limit, {
      ...src,
      confidence: limit != null ? 0.9 : 0,
      pageNumber: limitHit?.pageNumber ?? null,
      sourceExcerpt: limitHit?.excerpt ?? null,
    }),
    deductible: provenanced(deductible, {
      ...src,
      confidence: deductible != null ? 0.88 : 0,
      pageNumber: dedHit?.pageNumber ?? null,
      sourceExcerpt: dedHit?.excerpt ?? null,
    }),
    effectiveDate: provenanced(effMatch?.[1] ?? null, {
      ...src,
      confidence: effMatch ? 0.9 : 0,
      pageNumber: null,
      sourceExcerpt: effMatch ? effMatch[0] : null,
    }),
    expirationDate: provenanced(expMatch?.[1] ?? null, {
      ...src,
      confidence: expMatch ? 0.9 : 0,
      pageNumber: null,
      sourceExcerpt: expMatch ? expMatch[0] : null,
    }),
  };
}

/** Simulated OCR for commercial templates — template match only, else placeholder. */
export function runCommercialOcr(filename: string, rawText?: string): string {
  const base = rawText?.trim() || "";
  if (base) return base;

  const lower = filename.toLowerCase();
  if (lower.includes("loss") && lower.includes("run")) {
    return [
      "--- page 1 ---",
      "LOSS RUN REPORT",
      "Named Insured: Harbor Fabrication LLC",
      "Carrier: Harbor Mutual",
      "Policy Number: HM-GL-2025-8841",
      "Claim Date: 2024-03-12 · Closed · $18,500 · GL property damage",
      "Claim Date: 2025-11-02 · Closed · $9,200 · Commercial auto",
    ].join("\n");
  }
  if (lower.includes("sov") || lower.includes("statement_of_values") || lower.includes("values")) {
    return [
      "--- page 1 ---",
      "STATEMENT OF VALUES",
      "Named Insured: Harbor Fabrication LLC",
      "Primary Location: 1400 Industrial Blvd, Houston, TX 77001",
      "Building: $2,800,000 · Contents: $700,000 · TIV: $3,500,000",
    ].join("\n");
  }
  if (lower.includes("gl") || lower.includes("liability") || lower.includes("policy")) {
    return [
      "--- page 1 ---",
      "COMMERCIAL POLICY DECLARATIONS",
      "Named Insured: Harbor Fabrication LLC",
      "Industry: Machine shop / metal fabrication",
      "Headquarters: 1400 Industrial Blvd, Houston, TX 77001",
      "Carrier: Harbor Mutual",
      "Insurance Company: Harbor Mutual",
      "Policy Number: HM-GL-2025-8841",
      "Product: Commercial GL",
      "Each Occurrence Limit: $1,000,000",
      "General Aggregate Limit: $2,000,000",
      "Deductible: $2,500",
      "Annual Premium: $18,400",
      "Effective Date: 2025-09-01",
      "Expiration Date: 2026-09-01",
      "Employees: 28",
      "Annual Revenue: $2,400,000",
    ].join("\n");
  }

  return `Document: ${filename}\nOCR placeholder - no known commercial template matched. Manual review required.`;
}

export function overallCommercialConfidence(
  fields: Record<string, ProvenancedField<unknown>>,
): number {
  const values = Object.values(fields).filter((f) => !f.missing && f.value != null);
  if (!values.length) return 0.15;
  const avg =
    values.reduce((sum, f) => sum + f.confidence, 0) / values.length;
  return Math.round(avg * 100) / 100;
}

export function ingestCommercialDocument(input: {
  accountId: string;
  userId: string;
  filename: string;
  mimeType?: string;
  rawText?: string;
  classification?: CommercialDocClassification;
  sourceChannel?: CommercialDocument["sourceChannel"];
}): CommercialDocument {
  const id = `cdoc_${Math.random().toString(36).slice(2, 10)}`;
  const ocrText = runCommercialOcr(input.filename, input.rawText);
  const classification =
    input.classification ?? classifyCommercialDocument(input.filename, ocrText);
  const extracted = extractCommercialFields({
    documentId: id,
    filename: input.filename,
    ocrText,
  });
  const extractedFields: CommercialDocument["extractedFields"] = {
    companyName: extracted.companyName,
    industry: extracted.industry,
    headquarters: extracted.headquarters,
    annualRevenue: extracted.annualRevenue,
    employeeCount: extracted.employeeCount,
    currentPremium: extracted.currentPremium,
    renewalDate: extracted.renewalDate,
    carrier: extracted.carrier,
    policyNumber: extracted.policyNumber,
    limit: extracted.limit,
    deductible: extracted.deductible,
    effectiveDate: extracted.effectiveDate,
    expirationDate: extracted.expirationDate,
  };

  return {
    id,
    accountId: input.accountId,
    userId: input.userId,
    filename: input.filename,
    classification,
    mimeType: input.mimeType || mimeForFilename(input.filename),
    uploadedAt: new Date().toISOString(),
    storageVisibility: "private",
    // Private bucket path: {account_id}/{doc_id}/{filename}
    storagePath: `${input.accountId}/${id}/${input.filename}`,
    ocrText,
    overallConfidence: overallCommercialConfidence(extractedFields),
    verified: false,
    pageCount: (ocrText.match(/---\s*page\s*\d+/gi) || []).length || null,
    extractedFields,
    searchableText:
      `${input.filename}\n${ocrText}\n${classification}\n${JSON.stringify(extractedFields)}`.toLowerCase(),
    sourceChannel: input.sourceChannel ?? "upload",
  };
}

export function mergeExtractedIntoAccountFields(
  current: CommercialDocument["extractedFields"] extends infer _
    ? {
        companyName: ProvenancedField<string>;
        industry: ProvenancedField<string>;
        headquarters: ProvenancedField<string>;
        annualRevenue: ProvenancedField<number>;
        employeeCount: ProvenancedField<number>;
        currentPremium: ProvenancedField<number>;
        renewalDate: ProvenancedField<string>;
      }
    : never,
  doc: CommercialDocument,
) {
  const pick = <T,>(
    key: keyof typeof current,
    asNumber = false,
  ): ProvenancedField<T> => {
    const incoming = doc.extractedFields[key as string] as
      | ProvenancedField<T>
      | undefined;
    const existing = current[key] as ProvenancedField<T>;
    if (!incoming || incoming.missing || incoming.value == null) return existing;
    if (!existing.missing && (existing.confidence ?? 0) >= (incoming.confidence ?? 0)) {
      return existing;
    }
    if (asNumber && typeof incoming.value === "string") {
      const n = Number(String(incoming.value).replace(/[$,]/g, ""));
      if (Number.isNaN(n)) return existing;
      return { ...incoming, value: n as T };
    }
    return incoming;
  };

  return {
    companyName: pick<string>("companyName"),
    industry: pick<string>("industry"),
    headquarters: pick<string>("headquarters"),
    annualRevenue: pick<number>("annualRevenue", true),
    employeeCount: pick<number>("employeeCount", true),
    currentPremium: pick<number>("currentPremium", true),
    renewalDate: pick<string>("renewalDate"),
  };
}
