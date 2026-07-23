import { field } from "./profile";
import type {
  DocumentKind,
  ExtractedPolicyData,
  IngestedDocument,
} from "./types";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Simulated OCR - turns filename + optional text into searchable content. */
export function runOcr(filename: string, rawText?: string): string {
  const base = rawText?.trim() || "";
  if (base) return base;

  const lower = filename.toLowerCase();
  if (lower.includes("mutual") || lower.includes("omaha") || lower.includes("iul")) {
    return [
      "MUTUAL OF OMAHA INSURANCE COMPANY",
      "Indexed Universal Life Policy Illustration / In-Force Summary",
      "Product: Life Protection Advantage IUL",
      "Issue Age: 42",
      "Face Amount: $500,000",
      "Death Benefit: $500,000",
      "Cash Surrender Value: $48,250",
      "Target Premium: $6,200",
      "Current Planned Premium: $5,400",
      "Cost of Insurance (COI) Annual: $1,850",
      "Outstanding Loans: $0",
      "Riders: Accelerated Death Benefit, Waiver of Premium",
      "Assumptions: 6.0% illustrated crediting rate; non-guaranteed elements may change.",
    ].join("\n");
  }

  if (lower.includes("fia") || lower.includes("annuity")) {
    return [
      "FIXED INDEXED ANNUITY ILLUSTRATION",
      "Carrier: Athene",
      "Product: Performance Elite FIA",
      "Premium: $150,000",
      "Surrender Value: $152,400",
      "Cap Rate: 9.5%",
    ].join("\n");
  }

  return `Document: ${filename}\nOCR placeholder - no known template matched. Manual review required.`;
}

export function detectDocumentKind(filename: string, ocrText: string): DocumentKind {
  const blob = `${filename} ${ocrText}`.toLowerCase();
  if (blob.includes("1035")) return "1035_form";
  if (blob.includes("illustration")) return "illustration";
  if (blob.includes("annual statement") || blob.includes("annual_statement")) return "annual_statement";
  if (blob.includes("in-force") || blob.includes("ledger")) return "in_force_ledger";
  if (blob.includes("quote")) return "carrier_quote";
  if (blob.includes("policy") || blob.includes("iul") || blob.includes("life")) return "policy";
  return "other";
}

function parseMoney(text: string, label: RegExp): number | null {
  const m = text.match(new RegExp(`${label.source}[:\\s]*\\$?([\\d,]+(?:\\.\\d+)?)`, "i"));
  if (!m) return null;
  return parseFloat(m[1].replace(/,/g, ""));
}

function parseIntField(text: string, label: RegExp): number | null {
  const m = text.match(new RegExp(`${label.source}[:\\s]*(\\d+)`, "i"));
  if (!m) return null;
  return parseInt(m[1], 10);
}

/** AI extraction layer over OCR text → structured JSON with confidence. */
export function extractPolicyData(ocrText: string): ExtractedPolicyData {
  const assumptions: string[] = [];
  const assumptionLine = ocrText.match(/Assumptions?:?\s*(.+)/i);
  if (assumptionLine) assumptions.push(assumptionLine[1].trim());

  let carrier: string | null = null;
  let carrierConf = 0;
  if (/mutual of omaha/i.test(ocrText)) {
    carrier = "Mutual of Omaha";
    carrierConf = 0.98;
  } else if (/athene/i.test(ocrText)) {
    carrier = "Athene";
    carrierConf = 0.95;
  } else if (/pacific life/i.test(ocrText)) {
    carrier = "Pacific Life";
    carrierConf = 0.95;
  } else {
    carrierConf = 0.2;
  }

  let productName: string | null = null;
  const productMatch = ocrText.match(/Product:\s*(.+)/i);
  if (productMatch) productName = productMatch[1].trim();

  let productType: string | null = null;
  let productTypeConf = 0;
  if (/indexed universal|iul/i.test(ocrText)) {
    productType = "Indexed Universal Life";
    productTypeConf = 0.95;
  } else if (/fixed index(?:ed)? annuity|fia/i.test(ocrText)) {
    productType = "Fixed Indexed Annuity";
    productTypeConf = 0.95;
  } else if (/whole life/i.test(ocrText)) {
    productType = "Whole Life";
    productTypeConf = 0.9;
  }

  const riders: string[] = [];
  const ridersMatch = ocrText.match(/Riders?:\s*(.+)/i);
  if (ridersMatch) {
    riders.push(
      ...ridersMatch[1]
        .split(/,|;/)
        .map((r) => r.trim())
        .filter(Boolean),
    );
  }

  const faceAmount = parseMoney(ocrText, /Face Amount/i);
  const cashValue =
    parseMoney(ocrText, /Cash Surrender Value/i) ??
    parseMoney(ocrText, /Cash Value/i) ??
    parseMoney(ocrText, /Surrender Value/i);
  const targetPremium = parseMoney(ocrText, /Target Premium/i);
  const currentPremium =
    parseMoney(ocrText, /Current Planned Premium/i) ??
    parseMoney(ocrText, /Planned Premium/i) ??
    parseMoney(ocrText, /Premium/i);
  const deathBenefit = parseMoney(ocrText, /Death Benefit/i);
  const coi = parseMoney(ocrText, /Cost of Insurance \(COI\) Annual/i) ??
    parseMoney(ocrText, /COI/i);
  const loans = parseMoney(ocrText, /Outstanding Loans/i) ?? parseMoney(ocrText, /Loans/i);
  const issueAge = parseIntField(ocrText, /Issue Age/i);

  if (!assumptions.length) {
    assumptions.push("Extraction used OCR heuristics; non-guaranteed illustration values may differ from in-force.");
  }

  return {
    carrier: field(carrier, carrierConf, "ocr"),
    productName: field(productName, productName ? 0.9 : 0.1, "ocr"),
    productType: field(productType, productTypeConf, "ocr"),
    issueAge: field(issueAge, issueAge != null ? 0.92 : 0.1, "ocr"),
    faceAmount: field(faceAmount, faceAmount != null ? 0.95 : 0.1, "ocr"),
    cashValue: field(cashValue, cashValue != null ? 0.9 : 0.1, "ocr"),
    targetPremium: field(targetPremium, targetPremium != null ? 0.88 : 0.1, "ocr"),
    currentPremium: field(currentPremium, currentPremium != null ? 0.88 : 0.1, "ocr"),
    deathBenefit: field(deathBenefit, deathBenefit != null ? 0.93 : 0.1, "ocr"),
    coi: field(coi, coi != null ? 0.85 : 0.1, "ocr"),
    loans: field(loans, loans != null ? 0.9 : 0.2, "ocr"),
    riders: field(riders, riders.length ? 0.85 : 0.2, "ocr"),
    assumptions,
  };
}

export function overallExtractionConfidence(data: ExtractedPolicyData): number {
  const scores = [
    data.carrier.confidence,
    data.productType.confidence,
    data.faceAmount.confidence,
    data.cashValue.confidence,
    data.currentPremium.confidence,
    data.deathBenefit.confidence,
  ];
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
}

export function ingestDocument(input: {
  userId: string;
  filename: string;
  mimeType?: string;
  rawText?: string;
}): IngestedDocument {
  const ocrText = runOcr(input.filename, input.rawText);
  const kind = detectDocumentKind(input.filename, ocrText);
  const extraction = extractPolicyData(ocrText);
  const overallConfidence = overallExtractionConfidence(extraction);
  return {
    id: uid("doc"),
    userId: input.userId,
    filename: input.filename,
    kind,
    mimeType: input.mimeType || "application/pdf",
    uploadedAt: new Date().toISOString(),
    ocrText,
    extraction,
    overallConfidence,
    verified: false,
    searchableText: `${input.filename}\n${ocrText}\n${JSON.stringify(extraction)}`.toLowerCase(),
  };
}

export function searchDocuments(docs: IngestedDocument[], query: string): IngestedDocument[] {
  const q = query.trim().toLowerCase();
  if (!q) return docs;
  return docs.filter((d) => d.searchableText.includes(q));
}

export function verifyDocument(
  doc: IngestedDocument,
  updates?: Partial<ExtractedPolicyData>,
): IngestedDocument {
  const extraction = { ...doc.extraction, ...updates };
  return {
    ...doc,
    extraction,
    verified: true,
    overallConfidence: overallExtractionConfidence(extraction),
    searchableText: `${doc.filename}\n${doc.ocrText}\n${JSON.stringify(extraction)}`.toLowerCase(),
  };
}
