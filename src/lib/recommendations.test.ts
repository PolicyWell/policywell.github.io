import { describe, expect, it } from "vitest";
import {
  appendSnapshot,
  HISTORY_LIMIT,
  takeSnapshot,
  trendDelta,
} from "@/lib/history";
import {
  approvedForReport,
  decideRecommendation,
  generateRecommendations,
} from "@/lib/recommendations";
import { buildDemoSeed } from "@/lib/seed";
import { buildImoSeed } from "@/lib/imo";

describe("recommendation engine + human approval", () => {
  it("generates deterministic rule-based recommendations with rationale and confidence", () => {
    const { profile, documents } = buildDemoSeed();
    const recs = generateRecommendations(profile, documents);

    // Demo seed is underfunded ($5,400 vs $6,200 target)
    expect(recs.some((r) => r.id === "rec_fund_to_target")).toBe(true);
    for (const r of recs) {
      expect(r.status).toBe("pending");
      expect(r.rationale.length).toBeGreaterThan(0);
      expect(r.inputs.length).toBeGreaterThan(0);
      expect(r.confidence).toBeGreaterThan(0);
    }

    const ids = recs.map((r) => r.id);
    expect(generateRecommendations(profile, documents).map((r) => r.id)).toEqual(ids);
  });

  it("flags unverified documents and loans for the right client", () => {
    const rosters = buildImoSeed();
    const eva = rosters[1].clients.find((c) => c.id === "client_eva")!;
    const recs = generateRecommendations(eva.profile, eva.documents);
    expect(recs.some((r) => r.id === "rec_verify_docs")).toBe(true);
    expect(recs.some((r) => r.id === "rec_loan_review")).toBe(true);
    // Severely underfunded with lapse concern → elevated review priority
    expect(recs.some((r) => r.id === "rec_schedule_review")).toBe(true);
  });

  it("only approved recommendations reach client-facing output", () => {
    const { profile, documents } = buildDemoSeed();
    let recs = generateRecommendations(profile, documents);
    expect(approvedForReport(recs)).toHaveLength(0);

    const first = recs[0].id;
    const second = recs[1].id;
    recs = decideRecommendation(recs, first, "approved");
    recs = decideRecommendation(recs, second, "rejected");

    const approved = approvedForReport(recs);
    expect(approved).toHaveLength(1);
    expect(approved[0].id).toBe(first);
    expect(recs.find((r) => r.id === second)!.status).toBe("rejected");
    expect(recs.find((r) => r.id === first)!.decidedAt).toBeTruthy();
  });
});

describe("score history", () => {
  it("snapshots scores and reports trend delta", () => {
    const { profile, documents } = buildDemoSeed();
    const s1 = takeSnapshot(profile, documents, "2026-01-01T00:00:00Z");
    expect(s1.overallIntelligenceScore).toBeGreaterThan(0);

    let history = appendSnapshot([], s1);
    expect(trendDelta(history)).toBeNull();

    const improved = { ...s1, at: "2026-06-01T00:00:00Z", overallIntelligenceScore: s1.overallIntelligenceScore + 7 };
    history = appendSnapshot(history, improved);
    expect(trendDelta(history)).toBe(7);
  });

  it("caps history at the documented limit", () => {
    const { profile, documents } = buildDemoSeed();
    const base = takeSnapshot(profile, documents);
    let history: ReturnType<typeof appendSnapshot> = [];
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) {
      history = appendSnapshot(history, { ...base, at: `2026-01-01T00:00:${String(i).padStart(2, "0")}Z` });
    }
    expect(history).toHaveLength(HISTORY_LIMIT);
  });
});
