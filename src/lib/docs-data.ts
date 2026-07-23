export type DocsStatus = "Available" | "Preview" | "Planned";

export type DocsUseCase = {
  slug: string;
  title: string;
  summary: string;
  status: DocsStatus;
  icon: DocsIconName;
  capabilities: readonly string[];
  overview: string;
  nextSteps?: readonly { label: string; href: string }[];
};

export type DocsIconName =
  | "shield"
  | "chart"
  | "chat"
  | "document"
  | "spark"
  | "crm"
  | "api"
  | "building"
  | "webhook"
  | "workflow"
  | "brand"
  | "sdk";

export const DOCS_META = {
  product: "PolicyWell Docs",
  title: "Getting started",
  description:
    "Explore common use cases and integrate PolicyWell immediately.",
} as const;

/** Common use cases - Natural-style start-here card grid. */
export const DOCS_USE_CASES: readonly DocsUseCase[] = [
  {
    slug: "policy-intelligence",
    title: "Policy Intelligence",
    summary:
      "Upload and analyze life insurance policies for health, risk, and coverage gaps",
    status: "Available",
    icon: "shield",
    overview:
      "Policy Intelligence turns policy documents and household context into structured understanding - coverage, funding, riders, beneficiaries, and policy-health scoring - so advisors and consumers can act with clarity.",
    capabilities: [
      "Upload and analyze life insurance policies",
      "Lapse risk analysis",
      "Cash value projections",
      "COI analysis",
      "Rider detection",
      "Beneficiary analysis",
      "Coverage gap analysis",
      "Policy health score",
    ],
    nextSteps: [
      { label: "Open the demo", href: "/demo" },
      { label: "Ask the assistant", href: "/agent" },
    ],
  },
  {
    slug: "annuity-intelligence",
    title: "Annuity Intelligence",
    summary:
      "Compare FIAs, MYGAs, and SPIAs with income and exchange analysis",
    status: "Preview",
    icon: "chart",
    overview:
      "Annuity Intelligence helps advisors evaluate income products side by side - illustrations, surrender schedules, bonuses, and 1035 exchange considerations - with clear outputs for client conversations.",
    capabilities: [
      "FIA comparisons",
      "MYGA comparisons",
      "SPIA analysis",
      "Income projections",
      "Surrender schedules",
      "Bonus calculations",
      "1035 exchange analysis",
    ],
    nextSteps: [
      { label: "Compare policies", href: "/compare" },
      { label: "View pricing", href: "/pricing" },
    ],
  },
  {
    slug: "ai-insurance-assistant",
    title: "AI Insurance Assistant",
    summary:
      "Embedded assistant for consumer and advisor conversations",
    status: "Available",
    icon: "chat",
    overview:
      "The AI Insurance Assistant answers questions about coverage, funding, and next actions. Conversations are household-aware and document-aware, and designed for human review before client-facing delivery.",
    capabilities: [
      "Embedded AI assistant",
      "Consumer mode",
      "Advisor mode",
      "Household-aware conversations",
      "Document-aware chat",
    ],
    nextSteps: [
      { label: "Try the assistant", href: "/agent" },
      { label: "Start onboarding", href: "/onboarding" },
    ],
  },
  {
    slug: "document-processing",
    title: "Document Processing",
    summary:
      "Ingest policies and illustrations into structured insurance data",
    status: "Available",
    icon: "document",
    overview:
      "Document Processing ingests insurance PDFs and illustrations, extracts structured policy data, and feeds the analysis and recommendation layers used across PolicyWell workflows.",
    capabilities: [
      "Upload policies",
      "Parse illustrations",
      "Extract structured data",
      "Generate recommendations",
    ],
    nextSteps: [
      { label: "Upload a document", href: "/upload" },
      { label: "CLI design", href: "/docs/cli" },
    ],
  },
  {
    slug: "recommendation-engine",
    title: "Recommendation Engine",
    summary:
      "Funding, coverage, rider, and exchange recommendations for human review",
    status: "Available",
    icon: "spark",
    overview:
      "The Recommendation Engine proposes next actions from policy and household context. Recommendations are reviewed by licensed professionals before presentation - PolicyWell does not bind coverage automatically.",
    capabilities: [
      "Funding recommendations",
      "Coverage recommendations",
      "Rider recommendations",
      "Policy optimization",
      "Exchange recommendations",
    ],
    nextSteps: [
      { label: "Open workspace", href: "/workspace" },
      { label: "See the demo", href: "/demo" },
    ],
  },
  {
    slug: "advisor-crm-integration",
    title: "Advisor CRM Integration",
    summary:
      "Connect PolicyWell to Salesforce, Redtail, Wealthbox, and more",
    status: "Planned",
    icon: "crm",
    overview:
      "Advisor CRM Integration syncs household context, review tasks, and recommendation status into advisor systems of record. Integrations are planned and will ship as Preview connectors before general availability.",
    capabilities: [
      "Salesforce",
      "Redtail",
      "Wealthbox",
      "HubSpot",
      "Microsoft Dynamics",
    ],
    nextSteps: [{ label: "Talk to sales", href: "/pricing" }],
  },
  {
    slug: "carrier-apis",
    title: "Carrier APIs",
    summary:
      "Quotes, illustrations, underwriting status, and policy servicing",
    status: "Planned",
    icon: "api",
    overview:
      "Carrier APIs provide structured access to quoting, illustration, servicing, and claims workflows. Use them for enterprise ingestion, batch processing, and distribution enablement.",
    capabilities: [
      "Quotes",
      "Illustrations",
      "Underwriting status",
      "Policy status",
      "Premium history",
      "Claims status",
    ],
    nextSteps: [
      { label: "Carrier console", href: "/carrier" },
      { label: "CLI design", href: "/docs/cli" },
    ],
  },
  {
    slug: "imo-platform",
    title: "IMO Platform",
    summary:
      "Advisor networks, persistency analytics, and production dashboards",
    status: "Preview",
    icon: "building",
    overview:
      "The IMO Platform gives marketing organizations visibility across advisor activity, persistency, lapse risk, and production - with workflows that connect field activity back to PolicyWell intelligence.",
    capabilities: [
      "Advisor management",
      "Book of business",
      "Persistency analytics",
      "Lapse monitoring",
      "Production dashboards",
    ],
    nextSteps: [
      { label: "IMO workspace", href: "/imo" },
      { label: "Firm ops", href: "/firm" },
    ],
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    summary:
      "Event notifications for uploads, analysis, lapse risk, and reviews",
    status: "Planned",
    icon: "webhook",
    overview:
      "Webhooks deliver PolicyWell lifecycle events to your systems so advisors, IMOs, and carriers can automate follow-up without polling.",
    capabilities: [
      "Policy uploaded",
      "Analysis completed",
      "Recommendation generated",
      "Policy nearing lapse",
      "Annual review due",
      "Premium missed",
    ],
    nextSteps: [{ label: "View pricing", href: "/pricing" }],
  },
  {
    slug: "workflow-automation",
    title: "Workflow Automation",
    summary:
      "Trigger analyses, notify advisors, and schedule client follow-ups",
    status: "Preview",
    icon: "workflow",
    overview:
      "Workflow Automation connects PolicyWell signals to advisor and organization processes - analysis triggers, review scheduling, client follow-ups, and human-approval gates.",
    capabilities: [
      "Trigger analyses",
      "Notify advisors",
      "Schedule reviews",
      "Client follow-ups",
      "Automated insurance workflows",
    ],
    nextSteps: [
      { label: "Open tasks", href: "/tasks" },
      { label: "Try the assistant", href: "/agent" },
    ],
  },
  {
    slug: "white-label-platform",
    title: "White-Label Platform",
    summary:
      "Custom branding, domains, and embedded PolicyWell experiences",
    status: "Planned",
    icon: "brand",
    overview:
      "White-Label Platform lets carriers, IMOs, and institutions deploy PolicyWell under their brand - with tenant isolation, custom domains, and embedded product surfaces.",
    capabilities: [
      "Custom branding",
      "Custom domains",
      "Multi-tenant organizations",
      "Embedded PolicyWell experiences",
    ],
    nextSteps: [{ label: "Enterprise pricing", href: "/pricing" }],
  },
  {
    slug: "ai-agent-sdk",
    title: "AI Agent SDK",
    summary:
      "Build specialized agents for review, underwriting, claims, and sales",
    status: "Planned",
    icon: "sdk",
    overview:
      "The AI Agent SDK provides building blocks for specialized insurance agents that operate on PolicyWell context, tools, and approval workflows.",
    capabilities: [
      "Policy Review Agent",
      "Annual Review Agent",
      "Retirement Income Agent",
      "Underwriting Assistant",
      "Claims Assistant",
      "Compliance Agent",
      "Sales Assistant",
      "Client Onboarding Agent",
    ],
    nextSteps: [
      { label: "Try the assistant", href: "/agent" },
      { label: "CLI design", href: "/docs/cli" },
    ],
  },
] as const;

export function getUseCase(slug: string): DocsUseCase | undefined {
  return DOCS_USE_CASES.find((u) => u.slug === slug);
}

export type DocsNavItem = {
  label: string;
  href: string;
};

export type DocsNavGroup = {
  title: string;
  items: readonly DocsNavItem[];
};
