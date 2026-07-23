export const ECOSYSTEM = {
  eyebrow: "Insurance ecosystem",
  headline: "One intelligence platform.\nBuilt for the entire insurance ecosystem.",
  supporting:
    "Insurance decisions do not happen in isolation. PolicyWell connects policyholders, advisors, distribution organizations, and carriers through a shared intelligence and workflow layer.",
  audiences: [
    {
      id: "policyholders",
      label: "Policyholders",
      value:
        "Understand coverage, identify risks, and receive clear next steps.",
      capabilities: [
        "Policy explanations",
        "Household insurance profile",
        "Coverage analysis",
        "Annual reviews",
        "Personalized recommendations",
        "Advisor connection",
        "Policy document management",
      ],
    },
    {
      id: "advisors",
      label: "Advisors and Brokers",
      value:
        "Review more policies, explain recommendations, and serve clients efficiently.",
      capabilities: [
        "AI-assisted policy reviews",
        "Grounded Q&A",
        "Household context",
        "Policy comparisons",
        "Replacement analysis",
        "Client-ready reports",
        "Annual-review workflows",
        "Approval controls",
      ],
    },
    {
      id: "imos",
      label: "IMOs and BGAs",
      value:
        "Understand the book of business and surface opportunities across advisor networks.",
      capabilities: [
        "Multi-advisor workspaces",
        "Portfolio intelligence",
        "Annual-review pipelines",
        "Replacement opportunities",
        "Lapse-risk detection",
        "Advisor productivity",
        "Compliance workflows",
        "Commission attribution",
        "White-label deployment",
      ],
    },
    {
      id: "carriers",
      label: "Carriers and Financial Institutions",
      value:
        "Deploy intelligence across servicing, retention, distribution, and enterprise workflows.",
      capabilities: [
        "Policy ingestion APIs",
        "Policy review automation",
        "Retention intelligence",
        "Advisor enablement",
        "Carrier-specific workflows",
        "White-label interfaces",
        "Legacy-system integration",
        "CLI and batch processing",
        "Governance and audit tools",
      ],
    },
  ],
} as const;

export const PRODUCT_FLOW = [
  "Connect insurance data",
  "Build household and policy context",
  "Analyze policy health and risk",
  "Generate grounded recommendations",
  "Licensed professional review",
  "Client decision and action",
  "Carrier and distribution workflow",
  "Feedback and ongoing monitoring",
] as const;

export const HOME_HERO = {
  eyebrow: "Insurance intelligence",
  headline: "The intelligence layer for insurance.",
  supporting:
    "PolicyWell connects policies, household context, advisor workflows, distribution organizations, and carrier systems to deliver explainable recommendations and human-approved actions.",
  primaryCta: { label: "Experience PolicyWell", href: "/demo" },
  secondaryCta: { label: "Explore the Platform", href: "/#ecosystem" },
  trust: "Context first. Explainable recommendations. Human approval.",
} as const;
