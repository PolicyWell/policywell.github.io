export type ProductModuleId =
  | "dashboard"
  | "risk"
  | "market"
  | "claims"
  | "cli"
  | "crm"
  | "analyzer"
  | "app"
  | "agents";

export type ProductTopTab = "web" | "cli" | "crm" | "app";

export type ProductDemoStep = {
  /** 0–1 progress within the module when this step becomes active. */
  at: number;
  label: string;
};

export type ProductModule = {
  id: ProductModuleId;
  label: string;
  shortLabel: string;
  topTab: ProductTopTab;
  title: string;
  subtitle: string;
  /** Autoplay dwell time when cycling the central view. */
  durationMs: number;
  /** Step-by-step interactions shown during the 3-minute autoplay. */
  steps: ProductDemoStep[];
};

/** Hard cap for the YC product demo autoplay (3:00). */
export const PRODUCT_DEMO_MAX_MS = 180_000;

/** Modules shown in the left rail of the /product central demo. */
export const PRODUCT_MODULES: ProductModule[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    topTab: "web",
    title: "PolicyWell command center",
    subtitle:
      "One workspace for risk, market, claims, CLI, CRM, and in-force analysis — switch modules from the rail.",
    durationMs: 12_000,
    steps: [
      { at: 0, label: "Open command center" },
      { at: 0.35, label: "Scan available modules" },
      { at: 0.7, label: "Jump into Risk" },
    ],
  },
  {
    id: "risk",
    label: "Risk",
    shortLabel: "Risk",
    topTab: "web",
    title: "Risk assessment",
    subtitle:
      "Every in-force policy scored for gaps and exposure before renewal.",
    durationMs: 20_000,
    steps: [
      { at: 0, label: "Inspect overall score tile" },
      { at: 0.25, label: "Open coverage gaps" },
      { at: 0.5, label: "Click exposure bars" },
      { at: 0.75, label: "Review recent activity" },
    ],
  },
  {
    id: "market",
    label: "Marketplace",
    shortLabel: "Marketplace",
    topTab: "web",
    title: "Market comparison",
    subtitle:
      "Carrier quotes side by side on premium, terms, and coverage match.",
    durationMs: 22_000,
    steps: [
      { at: 0, label: "Toggle Life / P&C / Specialty" },
      { at: 0.3, label: "Select & deselect carriers" },
      { at: 0.6, label: "Click compare rows" },
      { at: 0.85, label: "Read quote summary" },
    ],
  },
  {
    id: "claims",
    label: "Claims",
    shortLabel: "Claims",
    topTab: "web",
    title: "Claims tracker",
    subtitle:
      "Open claims and renewals with adjusters, documents, and timelines.",
    durationMs: 16_000,
    steps: [
      { at: 0, label: "Open active claim hero" },
      { at: 0.35, label: "Step through timeline squares" },
      { at: 0.7, label: "Inspect claim documents" },
    ],
  },
  {
    id: "cli",
    label: "AI Agent",
    shortLabel: "AI Agent",
    topTab: "cli",
    title: "White-label CLI agent",
    subtitle:
      "Embedded terminal agent for policyholders, carriers, IMOs, and commercial teams.",
    durationMs: 22_000,
    steps: [
      { at: 0, label: "Open white-label CLI" },
      { at: 0.35, label: "Switch audience context" },
      { at: 0.7, label: "Run a live command" },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    shortLabel: "CRM",
    topTab: "crm",
    title: "Customer book & follow-up",
    subtitle:
      "Customer rows with policy and protection suitability — click a greeting to send or mass follow up.",
    durationMs: 22_000,
    steps: [
      { at: 0, label: "Scan customer book rows" },
      { at: 0.3, label: "Filter protection suitability" },
      { at: 0.55, label: "Click Hello {first name} greeting" },
      { at: 0.8, label: "Send / mass follow-up" },
    ],
  },
  {
    id: "analyzer",
    label: "Policy Analyzer",
    shortLabel: "Analyzer",
    topTab: "crm",
    title: "In-force policy analyzer",
    subtitle:
      "Live analysis for households, carriers, IMOs, and commercial groups.",
    durationMs: 14_000,
    steps: [
      { at: 0, label: "Open policyholder lens" },
      { at: 0.35, label: "Compare carrier & IMO scores" },
      { at: 0.7, label: "Check commercial gaps" },
    ],
  },
  {
    id: "app",
    label: "Mobile App",
    shortLabel: "Mobile",
    topTab: "app",
    title: "iOS · connect & ask",
    subtitle:
      "Upload a policy or connect a live in-force API, then ask in text — lapse risk and overfund projections with charts.",
    durationMs: 28_000,
    steps: [
      { at: 0, label: "Choose Upload PDF or Live API" },
      { at: 0.25, label: "Ingest in-force policy" },
      { at: 0.45, label: "Ask: Will my policy lapse?" },
      { at: 0.7, label: "Ask overfund CV · show chart" },
      { at: 0.9, label: "Continue to voice" },
    ],
  },
  {
    id: "agents",
    label: "Voice",
    shortLabel: "Voice",
    topTab: "app",
    title: "iOS · voice to broker",
    subtitle:
      "Ask the voice agent for overfunded IUL coverage options, then connect with a broker.",
    durationMs: 24_000,
    steps: [
      { at: 0, label: "Ask overfunded IUL options" },
      { at: 0.3, label: "Select Max cash-value IUL" },
      { at: 0.55, label: "View growth illustration" },
      { at: 0.8, label: "Connect with a broker" },
    ],
  },
];

export const PRODUCT_TOP_TABS: { id: ProductTopTab; label: string }[] = [
  { id: "web", label: "Web product" },
  { id: "cli", label: "CLI agent" },
  { id: "crm", label: "CRM & analyzer" },
  { id: "app", label: "iOS app & voice" },
];

export const PRODUCT_AUTOPLAY_TOTAL_MS = PRODUCT_MODULES.reduce(
  (sum, m) => sum + m.durationMs,
  0,
);

/** Public path for the downloadable YC demo MP4 (≪100MB). */
export const PRODUCT_DEMO_DOWNLOAD_HREF =
  "/downloads/PolicyWell-YC-Demo-3min.mp4";

export const PRODUCT_DEMO_DOWNLOAD_LABEL = "Download MP4";

/** Full-length swift GIF walkthrough (same cut as the MP4). */
export const PRODUCT_DEMO_GIF_HREF =
  "/downloads/PolicyWell-YC-Demo-preview.gif";

export const PRODUCT_DEMO_GIF_LABEL = "Download GIF";

if (PRODUCT_AUTOPLAY_TOTAL_MS !== PRODUCT_DEMO_MAX_MS) {
  // Keep the walkthrough exactly 3:00 for YC submissions.
  throw new Error(
    `Product demo must total ${PRODUCT_DEMO_MAX_MS}ms, got ${PRODUCT_AUTOPLAY_TOTAL_MS}ms`,
  );
}

export function modulesForTab(tab: ProductTopTab): ProductModule[] {
  return PRODUCT_MODULES.filter((m) => m.topTab === tab);
}

export function activeDemoStep(
  module: ProductModule,
  progress01: number,
): ProductDemoStep {
  const steps = module.steps;
  let current = steps[0];
  for (const step of steps) {
    if (progress01 >= step.at) current = step;
  }
  return current;
}

export function demoStepIndex(
  module: ProductModule,
  progress01: number,
): number {
  const steps = module.steps;
  let idx = 0;
  for (let i = 0; i < steps.length; i++) {
    if (progress01 >= steps[i].at) idx = i;
  }
  return idx;
}
