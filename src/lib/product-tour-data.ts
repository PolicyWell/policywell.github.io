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

export type ProductModule = {
  id: ProductModuleId;
  label: string;
  shortLabel: string;
  topTab: ProductTopTab;
  title: string;
  subtitle: string;
  /** Autoplay dwell time when cycling the central view. */
  durationMs: number;
};

/** Modules shown in the left rail of the /product central demo. */
export const PRODUCT_MODULES: ProductModule[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    topTab: "web",
    title: "PolicyWell command center",
    subtitle:
      "One workspace for risk, market, claims, CLI, messaging, and in-force analysis — switch modules from the rail.",
    durationMs: 14000,
  },
  {
    id: "risk",
    label: "Risk",
    shortLabel: "Risk",
    topTab: "web",
    title: "Risk assessment",
    subtitle:
      "Every in-force policy scored for gaps and exposure before renewal.",
    durationMs: 18000,
  },
  {
    id: "market",
    label: "Market",
    shortLabel: "Market",
    topTab: "web",
    title: "Market comparison",
    subtitle:
      "Carrier quotes side by side on premium, terms, and coverage match.",
    durationMs: 18000,
  },
  {
    id: "claims",
    label: "Claims",
    shortLabel: "Claims",
    topTab: "web",
    title: "Claims tracker",
    subtitle:
      "Open claims and renewals with adjusters, documents, and timelines.",
    durationMs: 16000,
  },
  {
    id: "cli",
    label: "CLI Agent",
    shortLabel: "CLI",
    topTab: "cli",
    title: "White-label CLI agent",
    subtitle:
      "Embedded terminal agent for policyholders, carriers, IMOs, and commercial teams.",
    durationMs: 22000,
  },
  {
    id: "crm",
    label: "Messaging",
    shortLabel: "Inbox",
    topTab: "crm",
    title: "Email & SMS messaging",
    subtitle:
      "One inbox for producers and consumers — keep email and SMS on the same contact thread.",
    durationMs: 20000,
  },
  {
    id: "analyzer",
    label: "Analyzer",
    shortLabel: "Analyze",
    topTab: "crm",
    title: "In-force policy analyzer",
    subtitle:
      "Live analysis for households, carriers, IMOs, and commercial groups.",
    durationMs: 16000,
  },
  {
    id: "app",
    label: "iOS App",
    shortLabel: "App",
    topTab: "app",
    title: "iOS · connect & ask",
    subtitle:
      "Upload a policy or connect a live in-force API, then ask in text — lapse risk and overfund projections with charts.",
    durationMs: 24000,
  },
  {
    id: "agents",
    label: "Voice Assistant",
    shortLabel: "Voice",
    topTab: "app",
    title: "iOS · voice to broker",
    subtitle:
      "Ask the voice agent for overfunded IUL coverage options, then connect with a broker.",
    durationMs: 22000,
  },
];

export const PRODUCT_TOP_TABS: { id: ProductTopTab; label: string }[] = [
  { id: "web", label: "Web product" },
  { id: "cli", label: "CLI agent" },
  { id: "crm", label: "Messaging & analyzer" },
  { id: "app", label: "iOS app & voice" },
];

export const PRODUCT_AUTOPLAY_TOTAL_MS = PRODUCT_MODULES.reduce(
  (sum, m) => sum + m.durationMs,
  0,
);

export function modulesForTab(tab: ProductTopTab): ProductModule[] {
  return PRODUCT_MODULES.filter((m) => m.topTab === tab);
}
