import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Privacy Policy", path: "/privacy" },
] as const;

export const metadata: Metadata = marketingMetadata({
  title: "Privacy Policy | PolicyWell",
  description:
    "How PolicyWell collects, uses, and protects personal and insurance-related information on policywell.ai.",
  path: "/privacy",
  absoluteTitle: true,
});

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...CRUMBS])} />
      <SiteNav />
      <main className="pw-shell py-8 md:py-12 space-y-8 min-w-0 w-full max-w-3xl">
        <SiteBreadcrumbs items={[...CRUMBS]} />
        <header className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl text-pine">
            Privacy Policy
          </h1>
          <p className="text-sm text-stone">Last updated: July 28, 2026</p>
        </header>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">Overview</h2>
          <p>
            PolicyWell (“we”, “us”) operates policywell.ai and related product
            surfaces. This policy explains what information we collect, how we
            use it, and the choices you have. Insurance decision support on our
            site is not a bindable quote or underwriting decision.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">
            Information we collect
          </h2>
          <p>We may collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Contact details you submit (name, email, phone, company, state).
            </li>
            <li>
              Coverage preferences, policy descriptions, and related notes from
              quote or contact forms.
            </li>
            <li>
              Usage data such as pages visited, device type, and approximate
              location derived from IP address.
            </li>
            <li>
              Account information if you sign in to product workspaces we
              provide.
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">How we use information</h2>
          <p>We use information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Respond to quote requests, demos, and support inquiries.</li>
            <li>Operate, secure, and improve the website and products.</li>
            <li>Communicate product updates when you opt in.</li>
            <li>Comply with law and protect against fraud or abuse.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">Sharing</h2>
          <p>
            We do not sell personal information. We may share data with licensed
            advisors reviewing your request, service providers who process data
            on our behalf, or when required by law. Carrier or partner sharing
            happens only as needed to fulfill a request you initiated.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">Contact</h2>
          <p>
            Privacy questions:{" "}
            <a
              className="underline hover:text-pine"
              href="mailto:info@policywell.ai"
            >
              info@policywell.ai
            </a>{" "}
            or see{" "}
            <Link href="/contact/" className="underline hover:text-pine">
              Contact
            </Link>
            . Related:{" "}
            <Link href="/terms/" className="underline hover:text-pine">
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
