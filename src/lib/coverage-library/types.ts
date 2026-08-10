export type RequirementGroup = "General" | "Property" | "Liability";
export type RequirementKind = "Limit" | "Deductible" | "Carrier Rating" | "Other";
export type Applicability = "All" | "Blanket" | "Scheduled" | "Multilocation";

export type CoverageRequirement = {
  id: string;
  group: RequirementGroup;
  coverage: string;
  name: string;
  peril: string;
  kind: RequirementKind;
  applicability: Applicability;
  text: string;
};

export type TowerPeril = {
  peril: string;
  limit: string;
};

export type CoverageTowerLine = {
  coverage: string;
  group: RequirementGroup;
  perils: TowerPeril[];
};

export type ProfileFaq = {
  question: string;
  answer: string;
};

export type CoverageProfile = {
  slug: string;
  name: string;
  industry: string;
  assetTypes: string[];
  /** 0–100 completeness of applicable coverage×peril pairs. */
  completionScore: number;
  pairCount: number;
  requiredPairs: number;
  summary: string;
  takeaways: string[];
  tower: CoverageTowerLine[];
  requirements: CoverageRequirement[];
  whoRequires: string[];
  carrierStandard: string;
  exclusions: string[];
  advisoryTitle: string;
  advisoryLead: string;
  advisoryPoints: string[];
  faqs: ProfileFaq[];
  relatedSlugs: string[];
};

export type LibraryStats = {
  profileCount: number;
  industryCount: number;
  filterCount: number;
};
