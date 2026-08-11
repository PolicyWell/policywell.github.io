import { describe, expect, it } from "vitest";
import {
  getCoverageProfile,
  getCoverageProfileSlugs,
  libraryStats,
  listCoverageProfiles,
  listCoverageShowcaseProfiles,
  relatedProfiles,
} from "./index";

describe("coverage library catalog", () => {
  it("exposes a browsable catalog with unique slugs", () => {
    const profiles = listCoverageProfiles();
    const slugs = getCoverageProfileSlugs();
    expect(profiles.length).toBeGreaterThanOrEqual(30);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(profiles[0]!.completionScore).toBeGreaterThanOrEqual(
      profiles[profiles.length - 1]!.completionScore,
    );
  });

  it("builds detail payload for architecture & engineering", () => {
    const profile = getCoverageProfile("architecture-engineering-firms");
    expect(profile).toBeTruthy();
    expect(profile!.tower.length).toBeGreaterThan(0);
    expect(profile!.requirements.length).toBeGreaterThan(10);
    expect(profile!.faqs.length).toBeGreaterThan(0);
    expect(relatedProfiles(profile!).length).toBeGreaterThan(0);
  });

  it("reports library stats", () => {
    const stats = libraryStats();
    expect(stats.profileCount).toBe(listCoverageProfiles().length);
    expect(stats.industryCount).toBeGreaterThan(5);
    expect(stats.filterCount).toBeGreaterThan(10);
  });

  it("builds slim showcase rows for the homepage window", () => {
    const rows = listCoverageShowcaseProfiles();
    expect(rows.length).toBe(listCoverageProfiles().length);
    expect(rows[0]).toMatchObject({
      slug: expect.any(String),
      name: expect.any(String),
      industry: expect.any(String),
      completionScore: expect.any(Number),
      requirementCount: expect.any(Number),
      coverageCount: expect.any(Number),
      perilCount: expect.any(Number),
    });
    expect(rows[0]!.takeaways.length).toBeGreaterThan(0);
    expect(rows[0]!.assetTypes.length).toBeGreaterThan(0);
  });
});
