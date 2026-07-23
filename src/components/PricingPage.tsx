"use client";

import Link from "next/link";
import { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import { PricingComparison } from "@/components/PricingComparison";
import { PricingFAQ } from "@/components/PricingFAQ";
import { PricingToggle } from "@/components/PricingToggle";
import { SiteNav } from "@/components/ui";
import type { BillingPeriod } from "@/lib/pricing-data";
import { PRICING } from "@/lib/pricing-data";

export function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>("annual");

  return (
    <div className="flex-1 flex flex-col pw-pricing">
      <SiteNav />
      <main>
        <section className="pw-pricing-hero">
          <div className="pw-shell pw-pricing-hero-inner">
            <p className="pw-pricing-eyebrow animate-rise">{PRICING.hero.eyebrow}</p>
            <h1 className="pw-pricing-h1 animate-rise-delay">
              {PRICING.hero.headlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="pw-pricing-lede animate-rise-delay-2">
              {PRICING.hero.supporting}
            </p>
            <div className="pw-pricing-hero-cta animate-rise-delay-2">
              <Link href={PRICING.hero.primaryCta.href} className="pw-btn">
                {PRICING.hero.primaryCta.label}
              </Link>
              <a
                href={PRICING.hero.secondaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pw-btn pw-btn-secondary"
              >
                {PRICING.hero.secondaryCta.label}
              </a>
            </div>
            <p className="pw-pricing-trust animate-rise-delay-2">
              {PRICING.hero.trust}
            </p>
          </div>
        </section>

        <section className="pw-pricing-tiers" aria-labelledby="pricing-tiers-heading">
          <div className="pw-shell">
            <div className="pw-pricing-tiers-head">
              <h2 id="pricing-tiers-heading" className="sr-only">
                Plans
              </h2>
              <PricingToggle value={billing} onChange={setBilling} />
            </div>

            <div className="pw-pricing-grid">
              {PRICING.tiers.map((tier) => {
                const price =
                  billing === "monthly" ? tier.price.monthly : tier.price.annual;
                return (
                  <PricingCard
                    key={tier.id}
                    name={tier.name}
                    audience={tier.audience}
                    tone={tier.tone}
                    popular={tier.popular}
                    price={price}
                    subheading={tier.subheading}
                    features={tier.features}
                    cta={tier.cta}
                    note={tier.note}
                    valueStatement={tier.valueStatement}
                    nestedPlan={tier.nestedPlan}
                    rangeNote={tier.rangeNote}
                    billing={billing}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="pw-pricing-section" aria-labelledby="value-heading">
          <div className="pw-shell">
            <div className="pw-pricing-section-head">
              <h2 id="value-heading" className="pw-pricing-h2">
                Pricing tied to measurable value
              </h2>
              <p className="pw-pricing-section-copy">
                PolicyWell pricing scales with the value delivered across
                policies, advisors, workflows, and integrations.
              </p>
            </div>
            <div className="pw-pricing-metrics">
              {PRICING.valueMetrics.map((metric) => (
                <article key={metric.title} className="pw-pricing-metric">
                  <h3>{metric.title}</h3>
                  <p>{metric.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="pw-pricing-section pw-pricing-infra"
          aria-labelledby="infra-heading"
        >
          <div className="pw-shell">
            <div className="pw-pricing-section-head">
              <h2 id="infra-heading" className="pw-pricing-h2">
                {PRICING.api.headline}
              </h2>
              <p className="pw-pricing-section-copy">{PRICING.api.supporting}</p>
            </div>

            <div className="pw-pricing-arch" aria-hidden="true">
              <div className="pw-pricing-arch-row">
                {["Carrier Systems", "Advisor CRMs", "Policy Documents", "Household Data"].map(
                  (label) => (
                    <span key={label} className="pw-pricing-arch-chip">
                      {label}
                    </span>
                  ),
                )}
              </div>
              <div className="pw-pricing-arch-arrow">↓</div>
              <div className="pw-pricing-arch-core">PolicyWell API + CLI</div>
              <div className="pw-pricing-arch-arrow">↓</div>
              <div className="pw-pricing-arch-row">
                {["Ingestion", "Context", "Scoring", "Reasoning", "Recommendations"].map(
                  (label) => (
                    <span key={label} className="pw-pricing-arch-chip is-mid">
                      {label}
                    </span>
                  ),
                )}
              </div>
              <div className="pw-pricing-arch-arrow">↓</div>
              <div className="pw-pricing-arch-row">
                {[
                  "Advisor Workflows",
                  "Carrier Workflows",
                  "Client Reports",
                  "Applications",
                ].map((label) => (
                  <span key={label} className="pw-pricing-arch-chip is-out">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="pw-pricing-api-block">
              <p className="pw-pricing-api-label">
                API and usage-based pricing is available for:
              </p>
              <ul className="pw-pricing-api-list">
                {PRICING.api.usageItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="pw-pricing-hero-cta">
                <Link href={PRICING.api.primaryCta.href} className="pw-btn">
                  {PRICING.api.primaryCta.label}
                </Link>
                <a
                  href={PRICING.api.secondaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pw-btn pw-btn-secondary"
                >
                  {PRICING.api.secondaryCta.label}
                </a>
              </div>
              <p className="pw-pricing-note mt-4">{PRICING.api.note}</p>
            </div>
          </div>
        </section>

        <section
          className="pw-pricing-section"
          aria-labelledby="marketplace-heading"
        >
          <div className="pw-shell">
            <div className="pw-pricing-section-head">
              <h2 id="marketplace-heading" className="pw-pricing-h2">
                {PRICING.marketplace.headline}
              </h2>
              <p className="pw-pricing-section-copy">
                {PRICING.marketplace.supporting}
              </p>
            </div>

            <ol className="pw-pricing-flow">
              {PRICING.marketplace.steps.map((step, index) => (
                <li key={step} className="pw-pricing-flow-item">
                  <span className="pw-pricing-flow-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="pw-pricing-flow-label">{step}</span>
                </li>
              ))}
            </ol>

            <p className="pw-pricing-compliance">
              {PRICING.marketplace.compliance}
            </p>
          </div>
        </section>

        <section
          className="pw-pricing-section pw-pricing-compare-section"
          aria-labelledby="compare-heading"
        >
          <div className="pw-shell">
            <div className="pw-pricing-section-head">
              <h2 id="compare-heading" className="pw-pricing-h2">
                Compare plans
              </h2>
              <p className="pw-pricing-section-copy">
                A clear view of what each tier unlocks across the insurance
                ecosystem.
              </p>
            </div>
            <PricingComparison />
          </div>
        </section>

        <section className="pw-pricing-section" aria-labelledby="faq-heading">
          <div className="pw-shell pw-pricing-faq-layout">
            <div className="pw-pricing-section-head">
              <h2 id="faq-heading" className="pw-pricing-h2">
                Frequently asked questions
              </h2>
            </div>
            <PricingFAQ />
          </div>
        </section>

        <section className="pw-pricing-final" aria-labelledby="final-heading">
          <div className="pw-shell pw-pricing-final-inner">
            <h2 id="final-heading" className="pw-pricing-final-title">
              {PRICING.finalCta.headline.split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="pw-pricing-final-copy">{PRICING.finalCta.supporting}</p>
            <div className="pw-pricing-hero-cta">
              <Link
                href={PRICING.finalCta.primaryCta.href}
                className="pw-btn !bg-foam !text-pine hover:!bg-white"
              >
                {PRICING.finalCta.primaryCta.label}
              </Link>
              <a
                href={PRICING.finalCta.secondaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pw-btn pw-btn-secondary !border-foam/35 !text-foam hover:!bg-foam/10"
              >
                {PRICING.finalCta.secondaryCta.label}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
