import { describe, expect, it } from "vitest";
import { ingestEmail, parseEmail } from "@/lib/email-import";
import {
  buildImoAnalytics,
  buildImoSeed,
  generateAnnualReviewChecklist,
} from "@/lib/imo";

describe("IMO analytics", () => {
  it("aggregates advisor activity, carrier distribution, and review pipeline", () => {
    const rosters = buildImoSeed();
    const analytics = buildImoAnalytics(rosters);

    expect(analytics.totals.advisors).toBe(2);
    expect(analytics.totals.clients).toBe(5);
    expect(analytics.totals.documents).toBeGreaterThanOrEqual(5);
    // Eva's statement is intentionally unverified
    expect(analytics.totals.verifiedDocuments).toBeLessThan(
      analytics.totals.documents,
    );

    const jordan = analytics.advisors.find((a) => a.advisorName === "Jordan Lee")!;
    expect(jordan.clientCount).toBe(3);
    expect(jordan.verifiedRate).toBe(1);

    expect(analytics.carrierDistribution.length).toBeGreaterThanOrEqual(3);
    expect(
      analytics.carrierDistribution.some((c) => c.carrier === "Mutual of Omaha"),
    ).toBe(true);

    // Pipeline sorted by priority descending
    const priorities = analytics.reviewPipeline.map((p) => p.reviewPriorityScore);
    expect([...priorities].sort((a, b) => b - a)).toEqual(priorities);

    // Deterministic
    expect(buildImoAnalytics(rosters)).toEqual(analytics);
  });

  it("flags underfunded lapse-concern client as overdue for review", () => {
    const analytics = buildImoAnalytics(buildImoSeed());
    const eva = analytics.reviewPipeline.find((p) => p.clientLabel === "Eva Martins")!;
    expect(eva.status).toBe("overdue");
  });

  it("generates a standardized annual review checklist from client data", () => {
    const rosters = buildImoSeed();
    const alex = rosters[0].clients[0];
    const checklist = generateAnnualReviewChecklist(alex);
    expect(checklist).toHaveLength(6);
    const verified = checklist.find((i) => i.label === "Policy documents verified")!;
    expect(verified.done).toBe(true);
    for (const item of checklist) {
      expect(item.detail.length).toBeGreaterThan(0);
    }
  });
});

describe("email import channel", () => {
  it("parses headers and body from a pasted email", () => {
    const parsed = parseEmail(
      [
        "From: statements@mutualofomaha.example",
        "To: alex@example.com",
        "Subject: Your IUL Annual Statement",
        "",
        "Product: Life Protection Advantage IUL",
        "Face Amount: $500,000",
      ].join("\n"),
    );
    expect(parsed.from).toBe("statements@mutualofomaha.example");
    expect(parsed.subject).toBe("Your IUL Annual Statement");
    expect(parsed.body).toContain("Face Amount: $500,000");
    expect(parsed.body).not.toMatch(/^Subject:/m);
  });

  it("ingests an email like any document, with extraction and search", () => {
    const doc = ingestEmail(
      "u1",
      [
        "From: statements@carrier.example",
        "Subject: Annual Statement - Mutual of Omaha",
        "",
        "Mutual of Omaha",
        "Product: Life Protection Advantage IUL",
        "Face Amount: $500,000",
        "Cash Surrender Value: $48,250",
      ].join("\n"),
    );
    expect(doc.filename).toMatch(/\.eml$/);
    expect(doc.mimeType).toBe("message/rfc822");
    expect(doc.extraction.carrier.value).toBe("Mutual of Omaha");
    expect(doc.extraction.faceAmount.value).toBe(500000);
    expect(doc.searchableText).toContain("statements@carrier.example");
  });

  it("handles emails without headers", () => {
    const doc = ingestEmail("u1", "Face Amount: $100,000\nMutual of Omaha policy info");
    expect(doc.filename).toBe("Email_Import.eml");
    expect(doc.extraction.faceAmount.value).toBe(100000);
  });
});
