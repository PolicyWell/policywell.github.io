import Link from "next/link";

const SOCIALS = [
  {
    href: "https://instagram.com/policywell",
    label: "Instagram",
    icon: InstagramIcon,
  },
  {
    href: "https://x.com/policywell",
    label: "X",
    icon: XIcon,
  },
  {
    href: "https://www.linkedin.com/company/policywell",
    label: "LinkedIn",
    icon: LinkedInIcon,
  },
] as const;

/** Primary hierarchy — crawlable footer anchors for sitelink signals. */
const PRIMARY_LINKS = [
  { href: "/platform/", label: "Platform" },
  { href: "/industries/", label: "Industries" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/docs/", label: "Docs" },
  { href: "/demo/", label: "Demo" },
  { href: "/api/", label: "API" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
] as const;

const SUPPORTING_LINKS = [
  { href: "/platform/coverage-library/", label: "Coverage Library" },
  { href: "/product/", label: "Product tour" },
  { href: "/life-insurance/", label: "Life Insurance" },
  { href: "/annuities/", label: "Annuities" },
  { href: "/press/", label: "Press" },
  { href: "/careers/", label: "Careers" },
  { href: "/quote/#contact", label: "Request a Quote" },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy/", label: "Privacy Policy" },
  { href: "/terms/", label: "Terms of Service" },
  { href: "/sitemap/", label: "Sitemap" },
] as const;

export function SiteFooter() {
  return (
    <footer className="pw-site-footer mt-auto border-t border-pine/10 bg-foam/50 backdrop-blur-sm">
      <div className="pw-shell py-8 md:py-10 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="min-w-0">
            <Link
              href="/"
              className="font-display text-lg text-pine tracking-tight"
            >
              PolicyWell
            </Link>
            <p className="text-xs text-stone mt-1 max-w-sm">
              AI infrastructure for insurance — coverage analysis, workflows,
              and decision support for the insurance ecosystem.
            </p>
            <p className="text-xs text-moss mt-3 font-semibold">
              Built with <span aria-hidden="true">💚</span>
              <span className="sr-only">love</span> Atlanta + Boston
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-moss">
              Follow us
            </p>
            <ul className="flex items-center gap-2">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow PolicyWell on ${label}`}
                    title={label}
                    className="pw-social-link"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <nav aria-label="Footer">
          <ul className="pw-footer-links">
            <li className="pw-footer-group">
              <span className="pw-footer-group-title">Explore</span>
              <ul className="pw-footer-sublinks">
                {PRIMARY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="pw-footer-group">
              <span className="pw-footer-group-title">More</span>
              <ul className="pw-footer-sublinks">
                {SUPPORTING_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="pw-footer-group">
              <span className="pw-footer-group-title">Legal</span>
              <ul className="pw-footer-sublinks">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.874 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
