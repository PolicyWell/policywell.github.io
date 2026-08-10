import type { Metadata } from "next";
import Link from "next/link";
import { CoverageLibraryBrowse } from "@/components/coverage-library/CoverageLibraryBrowse";
import { CoverageLibraryCta } from "@/components/coverage-library/CoverageLibraryCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import {
  libraryStats,
  listCoverageProfiles,
  listIndustries,
} from "@/lib/coverage-library";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Platform", path: "/platform" },
  { name: "Coverage Library", path: "/platform/coverage-library" },
] as const;

const FAQS = [
  {
    q: "What is the PolicyWell Coverage Library?",
    a: "The PolicyWell Coverage Library is a directory of benchmark coverage standards — required limits, deductibles, and carrier-quality expectations for a specific risk. It includes industry profiles plus tools to apply a profile to a live policy for coverage-gap assessment.",
  },
  {
    q: "What is a risk profile?",
    a: "A risk profile is one benchmark coverage standard in the library: the required limits, deductibles, endorsements, and carrier rating for a single risk. Open any profile to see its requirement set, typical exclusions, and the coverage gaps that risk most often carries.",
  },
  {
    q: "What does the completion score mean?",
    a: "Completion score is the count of coverage×peril pairs the profile requires, divided by the pairs applicable to that asset type, expressed as a percentage. 100% means coverage is required for every applicable pair. Sort the directory by it to see which risks the library benchmarks most thoroughly.",
  },
  {
    q: "Can I create a custom risk profile?",
    a: "Yes. When no library standard fits, PolicyWell’s condition builder lets teams compose custom requirements from fields, operators, and requirement values — choosing asset types, coverages, and requirement-level details. Custom profiles benchmark policies the same way library profiles do.",
  },
] as const;

export const metadata: Metadata = marketingMetadata({
  title: "Coverage Library | PolicyWell Platform",
  description:
    "Browse PolicyWell commercial coverage benchmarks by industry. Compare risk profiles, completion scores, and requirement sets — then run gap assessments in the platform.",
  path: "/platform/coverage-library",
  absoluteTitle: true,
});

export default function CoverageLibraryPage() {
  const profiles = listCoverageProfiles();
  const industries = listIndustries();
  const stats = libraryStats();

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...CRUMBS])} />
      <SiteNav />
      <main className="pw-cl-page">
        <div className="pw-shell pw-shell-wide pw-cl-hero">
          <SiteBreadcrumbs items={[...CRUMBS]} />
          <p className="pw-cl-eyebrow">Coverage Library</p>
          <h1 className="pw-cl-title">
            Master technical coverage
            <span> for any risk.</span>
          </h1>
          <p className="pw-cl-lede">
            Browse benchmark standards by industry and lender-style requirement.
            Find the right protection profile — then apply it to a live policy
            for a PolicyWell gap assessment.
          </p>
          <div className="pw-cl-hero-actions">
            <Link href="/demo/" className="pw-btn">
              Request demo access
            </Link>
            <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
              Book a call
            </Link>
          </div>
          <dl className="pw-cl-stats">
            <div>
              <dt>Coverage profiles</dt>
              <dd>{stats.profileCount}</dd>
            </div>
            <div>
              <dt>Industries</dt>
              <dd>{stats.industryCount}</dd>
            </div>
            <div>
              <dt>Coverage filters</dt>
              <dd>{stats.filterCount}</dd>
            </div>
          </dl>
        </div>

        <section
          id="browse"
          className="pw-cl-section"
          aria-labelledby="pw-cl-browse-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">Browse</p>
            <h2 id="pw-cl-browse-heading" className="pw-cl-section-title">
              Browse, then take action.
            </h2>
            <p className="pw-cl-section-copy">
              Filter by industry, sort by risk. Find your gold-standard
              benchmark.
            </p>
            <CoverageLibraryBrowse
              profiles={profiles}
              industries={industries}
            />
          </div>
        </section>

        <section
          id="analyze"
          className="pw-cl-section pw-cl-section-alt"
          aria-labelledby="pw-cl-analyze-heading"
        >
          <div className="pw-shell pw-shell-wide pw-cl-split">
            <div>
              <p className="pw-cl-eyebrow">Analyze</p>
              <h2 id="pw-cl-analyze-heading" className="pw-cl-section-title">
                Full transparency into every risk profile.
              </h2>
              <p className="pw-cl-section-copy">
                Check protection scores, appetite signals, and individual
                requirements to understand what coverage is best for the case.
                Simple requirements? Covered. Complex layered programs, blanket
                analyses, or guide updates? PolicyWell’s engines handle the edge
                cases so your team doesn’t have to.
              </p>
              <div className="pw-cl-hero-actions">
                <Link href="/demo/" className="pw-btn">
                  Request demo access
                </Link>
                <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
                  Book a call
                </Link>
              </div>
            </div>
            <aside className="pw-cl-panel" aria-label="Risk profile preview">
              <p className="pw-cl-panel-kicker">Risk profile</p>
              <p className="pw-cl-panel-title">Completion &amp; requirements</p>
              <ul className="pw-cl-panel-list">
                <li>
                  <span>Published requirements</span>
                  <strong>Limits · deductibles · ratings</strong>
                </li>
                <li>
                  <span>Coverage tower</span>
                  <strong>Line × peril benchmarks</strong>
                </li>
                <li>
                  <span>Gap assessment</span>
                  <strong>Apply to a live policy</strong>
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section
          id="customize"
          className="pw-cl-section"
          aria-labelledby="pw-cl-customize-heading"
        >
          <div className="pw-shell pw-shell-wide pw-cl-split">
            <div>
              <p className="pw-cl-eyebrow">Customize</p>
              <h2 id="pw-cl-customize-heading" className="pw-cl-section-title">
                Build your own risk profile.
              </h2>
              <p className="pw-cl-section-copy">
                Use PolicyWell tools to create custom coverage requirements when
                the library is not a fit. Choose asset types, coverages, and
                requirement-level details to build the exact profile you need.
              </p>
              <div className="pw-cl-hero-actions">
                <Link href="/demo/" className="pw-btn">
                  Request demo access
                </Link>
                <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
                  Book a call
                </Link>
              </div>
            </div>
            <aside className="pw-cl-panel" aria-label="Condition builder">
              <p className="pw-cl-panel-kicker">Condition builder</p>
              <p className="pw-cl-panel-title">Compose requirements</p>
              <ul className="pw-cl-panel-list">
                <li>
                  <span>Fields</span>
                  <strong>Limit · deductible · rating</strong>
                </li>
                <li>
                  <span>Operators</span>
                  <strong>≥ · ≤ · includes · equals</strong>
                </li>
                <li>
                  <span>Values</span>
                  <strong>Money · % TIV · statutory</strong>
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section
          id="faq"
          className="pw-cl-section pw-cl-section-alt"
          aria-labelledby="pw-cl-faq-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">FAQ</p>
            <h2 id="pw-cl-faq-heading" className="pw-cl-section-title">
              Frequently asked questions
            </h2>
            <div className="pw-cl-faq">
              {FAQS.map((item) => (
                <details key={item.q} className="pw-cl-faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="pw-shell pw-shell-wide">
          <CoverageLibraryCta />
        </div>
      </main>
    </div>
  );
}
