export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavGroup = {
  label: string;
  href?: string;
  items?: NavLink[];
};

/** Primary marketing navigation — YC-ready information architecture. */
export const SITE_NAV: NavGroup[] = [
  { label: "Product", href: "/demo" },
  {
    label: "Solutions",
    items: [
      { label: "Policyholders", href: "/#ecosystem-policyholders" },
      { label: "Advisors", href: "/#ecosystem-advisors" },
      { label: "IMOs and BGAs", href: "/#ecosystem-imos" },
      { label: "Carriers and Institutions", href: "/#ecosystem-carriers" },
    ],
  },
  {
    label: "Developers",
    items: [
      { label: "API overview", href: "/docs" },
      { label: "CLI", href: "/docs/cli" },
      { label: "Documentation", href: "/docs" },
      { label: "Integrations", href: "/docs#integrations" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Company",
    items: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/policywell",
        external: true,
      },
      { label: "Investor deck", href: "/deck" },
    ],
  },
];

export const SITE_PRIMARY_CTA: NavLink = {
  label: "Experience PolicyWell",
  href: "/demo",
};

export const SITE_SECONDARY_CTA: NavLink = {
  label: "Sign in",
  href: "/login",
};

export const SITE_META = {
  title: "PolicyWell | Insurance Intelligence Platform",
  description:
    "PolicyWell connects policyholders, advisors, insurance marketing organizations, and carriers through explainable insurance intelligence and human-approved workflows.",
  category: "Insurance intelligence platform",
  vision: "The intelligence layer for insurance",
} as const;
