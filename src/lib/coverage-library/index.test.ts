import { describe, expect, it } from "vitest";
import {
  getCoverageProfile,
  getCoverageProfileSlugs,
  libraryStats,
  listCoverageProfiles,
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
});
