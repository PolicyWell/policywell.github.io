import { buildProfileFromSeed } from "./build-profile";
import { PROFILE_SEEDS } from "./seeds";
import type { CoverageProfile, LibraryStats } from "./types";

export type {
  CoverageProfile,
  CoverageRequirement,
  CoverageTowerLine,
  LibraryStats,
  ProfileFaq,
  RequirementGroup,
  RequirementKind,
} from "./types";

const PROFILES: CoverageProfile[] = PROFILE_SEEDS.map(buildProfileFromSeed);

const BY_SLUG = new Map(PROFILES.map((p) => [p.slug, p]));

export function listCoverageProfiles(): CoverageProfile[] {
  return [...PROFILES].sort((a, b) => b.completionScore - a.completionScore);
}

export function getCoverageProfile(slug: string): CoverageProfile | undefined {
  return BY_SLUG.get(slug);
}

export function getCoverageProfileSlugs(): string[] {
  return PROFILES.map((p) => p.slug);
}

export function listIndustries(): string[] {
  return [...new Set(PROFILES.map((p) => p.industry))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function libraryStats(): LibraryStats {
  const industries = listIndustries();
  const coverages = new Set<string>();
  const perils = new Set<string>();
  for (const profile of PROFILES) {
    for (const line of profile.tower) {
      coverages.add(line.coverage);
      for (const peril of line.perils) perils.add(peril.peril);
    }
  }
  return {
    profileCount: PROFILES.length,
    industryCount: industries.length,
    filterCount: coverages.size + perils.size + industries.length,
  };
}

export function relatedProfiles(profile: CoverageProfile): CoverageProfile[] {
  const fromLinks = profile.relatedSlugs
    .map((slug) => BY_SLUG.get(slug))
    .filter((p): p is CoverageProfile => Boolean(p));
  if (fromLinks.length >= 4) return fromLinks.slice(0, 6);
  const sameIndustry = PROFILES.filter(
    (p) => p.industry === profile.industry && p.slug !== profile.slug,
  );
  const merged = [...fromLinks];
  for (const p of sameIndustry) {
    if (!merged.some((m) => m.slug === p.slug)) merged.push(p);
    if (merged.length >= 6) break;
  }
  return merged.slice(0, 6);
}
