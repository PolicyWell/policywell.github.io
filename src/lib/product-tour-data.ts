export type ProductSceneId =
  | "intro"
  | "risk"
  | "market"
  | "claims"
  | "cli"
  | "crm"
  | "analyzer"
  | "app"
  | "agents"
  | "close";

export type ProductScene = {
  id: ProductSceneId;
  step: string;
  title: string;
  subtitle: string;
  /** Auto-advance duration in ms (total tour ~3 minutes). */
  durationMs: number;
};

/** YC partner product tour — ~180s when autoplayed. */
export const PRODUCT_SCENES: ProductScene[] = [
  {
    id: "intro",
    step: "01",
    title: "PolicyWell product tour",
    subtitle:
      "A three-minute walkthrough of the web workspace, white-label CLI agent, CRM, policy analyzer, and mobile app — built for carriers, IMOs, producers, and commercial groups.",
    durationMs: 16000,
  },
  {
    id: "risk",
    step: "02",
    title: "Risk assessment",
    subtitle:
      "Every in-force policy is scored for gaps and exposure so teams see under- and over-coverage before renewal.",
    durationMs: 20000,
  },
  {
    id: "market",
    step: "03",
    title: "Market comparison",
    subtitle:
      "Quotes from carrier partners sit side by side on premium, terms, and coverage match.",
    durationMs: 20000,
  },
  {
    id: "claims",
    step: "04",
    title: "Claims tracker",
    subtitle:
      "Open claims and renewals live in one place — with adjusters, documents, and resolution timelines.",
    durationMs: 18000,
  },
  {
    id: "cli",
    step: "05",
    title: "White-label CLI agent",
    subtitle:
      "Insurance professionals embed PolicyWell as a terminal agent — policyholders, carriers, IMOs, and commercial teams.",
    durationMs: 24000,
  },
  {
    id: "crm",
    step: "06",
    title: "Follow-up CRM",
    subtitle:
      "Queues for policyholders, gap seekers, and producers — next actions grounded in live policy context.",
    durationMs: 18000,
  },
  {
    id: "analyzer",
    step: "07",
    title: "In-force policy analyzer",
    subtitle:
      "Live analysis for households, carriers, IMOs, and commercial groups — health scores, riders, and recommendations.",
    durationMs: 18000,
  },
  {
    id: "app",
    step: "08",
    title: "Mobile app · upload a policy",
    subtitle:
      "After the web product, the app lets clients photograph or upload a policy and start analysis on device.",
    durationMs: 18000,
  },
  {
    id: "agents",
    step: "09",
    title: "Text & voice interpretation",
    subtitle:
      "Ask in plain language or speak — the agent interprets coverage questions with grounded, explainable answers.",
    durationMs: 18000,
  },
  {
    id: "close",
    step: "10",
    title: "Ready to go deeper?",
    subtitle:
      "Open the live workspace, book a call with the team, or replay any scene from this tour.",
    durationMs: 10000,
  },
];

export const PRODUCT_TOUR_TOTAL_MS = PRODUCT_SCENES.reduce(
  (sum, s) => sum + s.durationMs,
  0,
);
