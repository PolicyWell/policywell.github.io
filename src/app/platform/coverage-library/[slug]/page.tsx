import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverageLibraryCta } from "@/components/coverage-library/CoverageLibraryCta";
import { CoverageProfileRequirements } from "@/components/coverage-library/CoverageProfileRequirements";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import {
  getCoverageProfile,
  getCoverageProfileSlugs,
  relatedProfiles,
} from "@/lib/coverage-library";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCoverageProfileSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getCoverageProfile(slug);
  if (!profile) {
    return marketingMetadata({
      title: "Coverage profile",
      description: "PolicyWell coverage library profile.",
      path: `/platform/coverage-library/${slug}`,
    });
  }
  return marketingMetadata({
    title: `${profile.name} Insurance Requirements | PolicyWell`,
    description: profile.summary,
    path: `/platform/coverage-library/${profile.slug}`,
    absoluteTitle: true,
  });
}

export default async function CoverageProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = getCoverageProfile(slug);
  if (!profile) notFound();

  const related = relatedProfiles(profile);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Platform", path: "/platform" },
    { name: "Coverage Library", path: "/platform/coverage-library" },
    {
      name: profile.name,
      path: `/platform/coverage-library/${profile.slug}`,
    },
  ] as const;

  const propertyTower = profile.tower.filter((t) => t.group === "Property");
  const liabilityTower = profile.tower.filter((t) => t.group === "Liability");

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...crumbs])} />
      <SiteNav />
      <main className="pw-cl-page">
        <div className="pw-shell pw-shell-wide pw-cl-hero pw-cl-hero-profile">
          <SiteBreadcrumbs items={[...crumbs]} />
          <p className="pw-cl-eyebrow">Overview</p>
          <h1 className="pw-cl-title pw-cl-title-profile">
            What an adequately protected {profile.name} program looks like
          </h1>
          <p className="pw-cl-lede">{profile.summary}</p>
          <div className="pw-cl-takeaways">
            <p className="pw-cl-panel-kicker">Key takeaways</p>
            <ul>
              {profile.takeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <dl className="pw-cl-stats pw-cl-stats-profile">
            <div>
              <dt>Requirements</dt>
              <dd>{profile.requirements.length}</dd>
            </div>
            <div>
              <dt>Coverage types</dt>
              <dd>{profile.tower.length}</dd>
            </div>
            <div>
              <dt>Perils</dt>
              <dd>
                {
                  new Set(
                    profile.tower.flatMap((t) => t.perils.map((p) => p.peril)),
                  ).size
                }
              </dd>
            </div>
            <div>
              <dt>Asset types</dt>
              <dd>{profile.assetTypes.length}</dd>
            </div>
            <div>
              <dt>Completion score</dt>
              <dd>{profile.completionScore}%</dd>
            </div>
          </dl>
          <p className="pw-cl-mono pw-cl-pairs">
            {profile.requiredPairs} of {profile.pairCount} pairs required
          </p>
        </div>

        <section
          className="pw-cl-section"
          aria-labelledby="pw-cl-tower-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">Coverage tower</p>
            <h2 id="pw-cl-tower-heading" className="pw-cl-section-title">
              Required limits by coverage type and peril
            </h2>
            <div className="pw-cl-tower-grid">
              {propertyTower.length ? (
                <div className="pw-cl-tower-col">
                  <h3>
                    Property
                    <span>{propertyTower.length} coverage types</span>
                  </h3>
                  {propertyTower.map((line) => (
                    <article key={line.coverage} className="pw-cl-tower-card">
                      <h4>{line.coverage}</h4>
                      <ul>
                        {line.perils.map((peril) => (
                          <li key={peril.peril}>
                            <span>{peril.peril}</span>
                            <strong className="pw-cl-mono">{peril.limit}</strong>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : null}
              {liabilityTower.length ? (
                <div className="pw-cl-tower-col">
                  <h3>
                    Liability
                    <span>{liabilityTower.length} coverage types</span>
                  </h3>
                  {liabilityTower.map((line) => (
                    <article key={line.coverage} className="pw-cl-tower-card">
                      <h4>{line.coverage}</h4>
                      <ul>
                        {line.perils.map((peril) => (
                          <li key={peril.peril}>
                            <span>{peril.peril}</span>
                            <strong className="pw-cl-mono">{peril.limit}</strong>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className="pw-cl-section pw-cl-section-alt"
          aria-labelledby="pw-cl-req-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">Requirements</p>
            <h2 id="pw-cl-req-heading" className="pw-cl-section-title">
              Full requirement set for {profile.name}
            </h2>
            <p className="pw-cl-section-copy">
              Every requirement in the PolicyWell standard —{" "}
              {profile.requirements.length} rows across limits, deductibles,
              carrier rating, and presence checks. Search and filter to drill
              in.
            </p>
            <CoverageProfileRequirements profile={profile} />
          </div>
        </section>

        <section
          className="pw-cl-section"
          aria-labelledby="pw-cl-compliance-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">Compliance</p>
            <h2 id="pw-cl-compliance-heading" className="pw-cl-section-title">
              Who requires {profile.name}
            </h2>
            <ul className="pw-cl-prose-list">
              {profile.whoRequires.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="pw-cl-carrier">
              <strong>Carrier standard.</strong> {profile.carrierStandard}
            </p>
            <p className="pw-cl-section-copy">
              PolicyWell runs these checks for the brokers and advisors who
              place {profile.industry.toLowerCase()} coverage — with human
              review gates before client delivery.
            </p>
          </div>
        </section>

        <section
          className="pw-cl-section pw-cl-section-alt"
          aria-labelledby="pw-cl-exclusions-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">Exclusions</p>
            <h2 id="pw-cl-exclusions-heading" className="pw-cl-section-title">
              What {profile.name} does not cover
            </h2>
            <ul className="pw-cl-prose-list">
              {profile.exclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="pw-cl-section"
          aria-labelledby="pw-cl-advisory-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">Risk advisory</p>
            <h2 id="pw-cl-advisory-heading" className="pw-cl-section-title">
              {profile.advisoryTitle}
            </h2>
            <p className="pw-cl-section-copy">{profile.advisoryLead}</p>
            <ul className="pw-cl-prose-list">
              {profile.advisoryPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="pw-cl-section pw-cl-section-alt"
          aria-labelledby="pw-cl-profile-faq-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">FAQ</p>
            <h2 id="pw-cl-profile-faq-heading" className="pw-cl-section-title">
              Frequently asked questions
            </h2>
            <div className="pw-cl-faq">
              {profile.faqs.map((item) => (
                <details key={item.question} className="pw-cl-faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          className="pw-cl-section"
          aria-labelledby="pw-cl-about-heading"
        >
          <div className="pw-shell pw-shell-wide">
            <p className="pw-cl-eyebrow">Maintained by</p>
            <h2 id="pw-cl-about-heading" className="pw-cl-section-title">
              About this coverage standard
            </h2>
            <p className="pw-cl-section-copy">
              This profile is maintained by the PolicyWell coverage research
              team, which keeps Coverage Library benchmarks aligned to live
              commercial placements and insurer guides. It is general guidance,
              not legal or coverage advice. Verify requirements against the
              actual policy and contract.
            </p>
          </div>
        </section>

        {related.length ? (
          <section
            className="pw-cl-section pw-cl-section-alt"
            aria-labelledby="pw-cl-related-heading"
          >
            <div className="pw-shell pw-shell-wide">
              <p className="pw-cl-eyebrow">Explore</p>
              <h2 id="pw-cl-related-heading" className="pw-cl-section-title">
                Related coverage profiles
              </h2>
              <ul className="pw-cl-related">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/platform/coverage-library/${item.slug}/`}>
                      <span>{item.industry}</span>
                      <strong>{item.name}</strong>
                      <em className="pw-cl-mono">
                        Completeness {item.completionScore}%
                      </em>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <div className="pw-shell pw-shell-wide pw-cl-profile-footer">
          <CoverageLibraryCta
            title="Benchmark-driven advice. Free tier available."
            body={`Upload a ${profile.industry} policy and run a gap assessment against this profile in one workflow. Decision support — not a bindable quote.`}
          />
          <p className="pw-cl-back">
            <Link href="/platform/coverage-library/">← Back to library</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
