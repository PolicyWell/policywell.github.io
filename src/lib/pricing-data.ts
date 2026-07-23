export type BillingPeriod = "monthly" | "annual";

export type PricingTone = "mint" | "featured" | "enterprise" | "carrier";

export type ComparisonValue = boolean | string;

export type NestedPlan = {
  name: string;
  monthly: { display: string; detail: string };
  annual: { display: string; detail: string };
  features: readonly string[];
};

export const PRICING = {
  hero: {
    eyebrow: "Pricing",
    headlineLines: [
      "Free for policyholders and policy seekers.",
      "Built to power the insurance ecosystem.",
    ] as const,
    supporting:
      "Free for consumers. Built for advisors, IMOs, and carriers.",
    primaryCta: { label: "Start Free", href: "/login" },
    secondaryCta: {
      label: "Talk to Sales",
      href: "https://www.linkedin.com/company/policywell",
    },
    trust:
      "Human-reviewed recommendations. Enterprise-grade security. No rip-and-replace required.",
  },
  billing: {
    annualSavingsLabel: "Save 17% annually",
    annualNote: "Approximately two months free",
  },
  tiers: [
    {
      id: "policyholder",
      name: "Policyholder",
      audience: "For individuals, families, and people exploring coverage",
      tone: "mint" as PricingTone,
      popular: false,
      price: {
        monthly: { display: "Free", detail: null as string | null },
        annual: { display: "Free", detail: null as string | null },
      },
      subheading:
        "Understand your coverage without paying for another dashboard.",
      features: [
        "Upload or connect insurance policies",
        "AI-powered policy explanations",
        "Household insurance profile",
        "Coverage-gap analysis",
        "Annual policy health reviews",
        "Personalized recommendations",
        "Plain-language policy summaries",
        "Advisor connection when needed",
      ],
      cta: { label: "Start Free", href: "/login", variant: "secondary" as const },
      note: "No credit card required.",
      valueStatement: null as string | null,
      nestedPlan: null as NestedPlan | null,
      rangeNote: null as string | null,
    },
    {
      id: "advisor",
      name: "Advisor Professional",
      audience: "For independent advisors and small practices",
      tone: "featured" as PricingTone,
      popular: true,
      price: {
        monthly: {
          display: "$249",
          detail: "per month",
        },
        annual: {
          display: "$2,490",
          detail: "per year",
        },
      },
      subheading:
        "Turn policy review into a repeatable client workflow.",
      features: [
        "Unlimited policy reviews",
        "AI recommendation engine",
        "Household risk scoring",
        "Client-ready reports",
        "Policy comparison workflows",
        "Replacement analysis",
        "Annual review automation",
        "Client portal",
        "CRM integrations",
        "Priority support",
      ],
      cta: {
        label: "Start Advisor Trial",
        href: "/login",
        variant: "primary" as const,
      },
      note: null as string | null,
      valueStatement:
        "One additional policy placement can cover the annual subscription.",
      nestedPlan: {
        name: "Solo",
        monthly: { display: "$99", detail: "per month" },
        annual: { display: "$990", detail: "per year" },
        features: [
          "Up to 25 active client households",
          "Policy review tools",
          "Client-ready reports",
          "Basic household analysis",
          "Email support",
        ],
      },
      rangeNote: null as string | null,
    },
    {
      id: "imo",
      name: "IMO / BGA",
      audience: "For insurance marketing organizations and distribution teams",
      tone: "enterprise" as PricingTone,
      popular: false,
      price: {
        monthly: {
          display: "Starting at $1,500",
          detail: "per month",
        },
        annual: {
          display: "Starting at $15,000",
          detail: "per year",
        },
      },
      subheading:
        "Intelligence across your advisor network and book of business.",
      features: [
        "Multi-advisor workspace",
        "Book-of-business analysis",
        "Annual review pipeline",
        "Replacement opportunity detection",
        "Coverage-upgrade opportunities",
        "Lapse-risk identification",
        "Advisor productivity dashboards",
        "Compliance review workflows",
        "Commission opportunity tracking",
        "White-label client portal",
        "CRM and data integrations",
        "Role-based permissions",
        "Dedicated onboarding",
      ],
      cta: {
        label: "Talk to Sales",
        href: "https://www.linkedin.com/company/policywell",
        variant: "primary" as const,
      },
      note: null as string | null,
      valueStatement:
        "Surface more opportunities across the entire book of business without adding administrative headcount.",
      nestedPlan: null as NestedPlan | null,
      rangeNote:
        "Typical plans range from $1,500 to $5,000 per month depending on advisor count, policy volume, and integrations.",
    },
    {
      id: "carrier",
      name: "Carrier Enterprise",
      audience: "For insurance carriers and financial institutions",
      tone: "carrier" as PricingTone,
      popular: false,
      price: {
        monthly: {
          display: "Custom annual license",
          detail: null as string | null,
        },
        annual: {
          display: "Custom annual license",
          detail: null as string | null,
        },
      },
      subheading:
        "APIs, AI workflows, white-label deployment, and legacy integration.",
      features: [
        "Enterprise platform license",
        "Policy ingestion APIs",
        "AI policy-review APIs",
        "Recommendation APIs",
        "White-label deployment",
        "Carrier-specific reasoning workflows",
        "Policy administration integration",
        "Legacy mainframe integration",
        "CLI and batch-processing tools",
        "SSO and role-based access",
        "Private cloud or custom deployment",
        "Audit logs and governance controls",
        "Dedicated support and service-level agreements",
        "Custom implementation services",
      ],
      cta: {
        label: "Contact Enterprise Sales",
        href: "https://www.linkedin.com/company/policywell",
        variant: "secondary" as const,
      },
      note: null as string | null,
      valueStatement:
        "Deploy PolicyWell across servicing, distribution, retention, and advisor enablement without replacing existing systems.",
      nestedPlan: null as NestedPlan | null,
      rangeNote:
        "Typical contracts may begin around $100,000 annually and scale based on policy volume, integrations, workflows, and deployment scope.",
    },
  ],
  valueMetrics: [
    {
      title: "Advisor productivity",
      copy: "Complete more policy reviews without increasing headcount.",
    },
    {
      title: "Policy retention",
      copy: "Identify lapse risk and retention opportunities earlier.",
    },
    {
      title: "Distribution growth",
      copy: "Surface replacement, upgrade, and new-coverage opportunities.",
    },
    {
      title: "Legacy modernization",
      copy: "Add AI workflows without replacing policy administration systems.",
    },
  ],
  api: {
    headline: "Insurance intelligence as infrastructure",
    supporting:
      "PolicyWell can be deployed through the web application, APIs, CLI tools, batch workflows, CRM integrations, and existing policy administration systems.",
    usageItems: [
      "Policy ingestion",
      "Policy extraction",
      "Policy review",
      "Household context",
      "Risk scoring",
      "Product comparison",
      "Recommendation generation",
      "Report generation",
    ],
    primaryCta: { label: "View API Documentation", href: "/docs" },
    secondaryCta: {
      label: "Discuss Integration",
      href: "https://www.linkedin.com/company/policywell",
    },
    note: "No rip-and-replace required.",
  },
  marketplace: {
    headline: "A compliant path from recommendation to action",
    supporting:
      "PolicyWell may create additional revenue through advisor subscriptions, permitted referral arrangements, marketplace fees, and transaction-related services, subject to licensing and regulatory requirements.",
    steps: [
      "Policyholder insight",
      "AI recommendation",
      "Licensed advisor review",
      "Client presentation",
      "Application",
      "Carrier submission",
      "Commission attribution",
    ],
    compliance:
      "Insurance recommendations and transactions remain subject to licensed advisor review, carrier requirements, and applicable state and federal regulations.",
  },
  comparison: {
    columns: [
      { id: "policyholder", label: "Policyholder" },
      { id: "advisor", label: "Advisor" },
      { id: "imo", label: "IMO / BGA" },
      { id: "carrier", label: "Carrier Enterprise" },
    ],
    rows: [
      { feature: "Policy uploads", values: [true, true, true, true] },
      { feature: "Policy explanations", values: [true, true, true, true] },
      { feature: "Household profile", values: [true, true, true, true] },
      { feature: "Coverage analysis", values: [true, true, true, true] },
      { feature: "AI recommendations", values: [true, true, true, true] },
      {
        feature: "Client-ready reports",
        values: [false, true, true, true],
      },
      {
        feature: "Replacement analysis",
        values: [false, true, true, true],
      },
      {
        feature: "Annual review automation",
        values: [false, true, true, true],
      },
      {
        feature: "Multi-advisor management",
        values: [false, false, true, true],
      },
      {
        feature: "Book-of-business analytics",
        values: [false, false, true, true],
      },
      {
        feature: "Lapse-risk detection",
        values: [false, "Professional", true, true],
      },
      {
        feature: "White-label portal",
        values: [false, false, true, true],
      },
      {
        feature: "CRM integrations",
        values: [false, true, true, true],
      },
      { feature: "API access", values: [false, false, "Add-on", true] },
      { feature: "CLI tools", values: [false, false, "Add-on", true] },
      {
        feature: "Legacy-system integration",
        values: [false, false, false, true],
      },
      {
        feature: "Custom workflows",
        values: [false, false, "Limited", true],
      },
      { feature: "SSO", values: [false, false, true, true] },
      { feature: "Audit logs", values: [false, false, true, true] },
      {
        feature: "Dedicated support",
        values: [false, "Priority", true, true],
      },
    ] as { feature: string; values: ComparisonValue[] }[],
  },
  faqs: [
    {
      q: "Why is PolicyWell free for policyholders and policy seekers?",
      a: "Consumers get free access to insurance intelligence so they can understand coverage, gaps, and next steps. Advisors, IMOs, and carriers fund the product by paying for productivity tools, portfolio intelligence, APIs, and enterprise infrastructure.",
    },
    {
      q: "Do advisors need a license to use PolicyWell?",
      a: "PolicyWell is a workflow and intelligence layer. Insurance recommendations and client-facing advice remain subject to licensed advisor review and applicable regulations. Advisors should use PolicyWell within their existing licensing and compliance requirements.",
    },
    {
      q: "What is included in the Advisor Solo plan?",
      a: "Solo is the entry advisor plan at $99 per month or $990 per year. It includes up to 25 active client households, policy review tools, client-ready reports, basic household analysis, and email support.",
    },
    {
      q: "How is IMO pricing calculated?",
      a: "IMO / BGA plans start at $1,500 per month or $15,000 per year. Typical plans range up to $5,000 per month based on advisor count, policy volume, white-label needs, and integrations.",
    },
    {
      q: "How is carrier pricing calculated?",
      a: "Carrier Enterprise is a custom annual license. Contracts typically begin around $100,000 annually and scale with policy volume, APIs, workflows, white-label deployment, and integration scope.",
    },
    {
      q: "Can PolicyWell integrate with legacy systems?",
      a: "Yes. Carrier deployments are designed for policy administration systems, CRM platforms, batch workflows, CLI tools, and legacy environments without requiring rip-and-replace.",
    },
    {
      q: "Do you offer API-only pricing?",
      a: "Yes. API and usage-based pricing is available for ingestion, extraction, review, household context, scoring, comparison, recommendation generation, and report generation — or as part of an enterprise contract.",
    },
    {
      q: "Can PolicyWell be white-labeled?",
      a: "White-label client portals and deployment options are available on IMO / BGA and Carrier Enterprise plans.",
    },
    {
      q: "Does PolicyWell receive commissions?",
      a: "PolicyWell may participate in permitted referral, marketplace, and transaction-related arrangements where legally allowed. Insurance transactions remain subject to licensed advisor review, carrier requirements, and applicable regulations.",
    },
    {
      q: "Can I pay annually?",
      a: "Yes. Annual billing is available for Advisor and IMO / BGA plans and saves approximately 17% versus monthly billing — about two months free.",
    },
  ],
  finalCta: {
    headline: "Start with one policy.\nScale across the entire insurance ecosystem.",
    supporting:
      "Policyholders can begin for free. Advisors, IMOs, and carriers can contact us for tailored onboarding and enterprise pricing.",
    primaryCta: { label: "Start Free", href: "/login" },
    secondaryCta: {
      label: "Talk to Sales",
      href: "https://www.linkedin.com/company/policywell",
    },
  },
} as const;

export type PricingTier = (typeof PRICING.tiers)[number];
