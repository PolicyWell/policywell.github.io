import { describe, expect, it } from "vitest";
import {
  ingestDocument,
  searchDocuments,
  verifyDocument,
  extractPolicyData,
  runOcr,
} from "@/lib/extraction";

describe("insurance ingestion engine", () => {
  it("uploads, OCRs, extracts structured JSON with confidence", () => {
    const doc = ingestDocument({
      userId: "u1",
      filename: "Mutual_of_Omaha_IUL_InForce.pdf",
    });
    expect(doc.ocrText).toMatch(/Mutual of Omaha/i);
    expect(doc.extraction.carrier.value).toBe("Mutual of Omaha");
    expect(doc.extraction.productType.value).toBe("Indexed Universal Life");
    expect(doc.extraction.faceAmount.value).toBe(500000);
    expect(doc.extraction.cashValue.value).toBe(48250);
    expect(doc.extraction.targetPremium.value).toBe(6200);
    expect(doc.extraction.currentPremium.value).toBe(5400);
    expect(doc.overallConfidence).toBeGreaterThan(0.8);
    expect(doc.verified).toBe(false);
  });

  it("supports human verification and search", () => {
    let doc = ingestDocument({
      userId: "u1",
      filename: "Mutual_Omaha_policy.pdf",
    });
    doc = verifyDocument(doc);
    expect(doc.verified).toBe(true);

    const found = searchDocuments([doc], "indexed universal");
    expect(found).toHaveLength(1);
    expect(searchDocuments([doc], "zzzz-nope")).toHaveLength(0);
  });

  it("extracts from raw OCR text", () => {
    const text = runOcr("statement.pdf", "Product: Demo IUL\nFace Amount: $250,000\nMutual of Omaha");
    const data = extractPolicyData(text);
    expect(data.faceAmount.value).toBe(250000);
    expect(data.carrier.value).toBe("Mutual of Omaha");
  });
});
