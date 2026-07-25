import Link from "next/link";
import { AlcoholFulfillmentScene } from "@/components/AlcoholFulfillmentScene";
import { IndustryLaptopFrame } from "@/components/IndustryLaptopFrame";
import { EcommerceStorefrontDemo } from "@/components/EcommerceStorefrontDemo";
import { SiteNav } from "@/components/ui";
import {
  ECOMMERCE_VERTICALS,
  industryQuoteHref,
  type EcommerceVertical,
} from "@/lib/industries-nav";

const PHONE_DISPLAY = "(470) 887-0449";
const PHONE_HREF = "tel:+14708870449";

export function EcommerceLanding({
  vertical,
  isHub = false,
}: {
  vertical: EcommerceVertical;
  isHub?: boolean;
}) {
  const isAlcohol = vertical.stage === "alcohol-fulfillment";

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-clip">
      <SiteNav />
      <main className="pw-industry-page">
        <section
          className={`pw-industry-hero${isAlcohol ? " pw-industry-hero-alcohol" : ""}`}
        >
          <div
            className={`pw-shell${isAlcohol ? " pw-industry-hero-stack" : " pw-industry-hero-grid"}`}
          >
            <div className="pw-industry-hero-copy animate-rise">
              <p className="pw-industry-eyebrow">
                <Link href="/industries/ecommerce/">Ecommerce</Link>
                <span aria-hidden> / </span>
                {isAlcohol ? (
                  <span>Alcoholic Beverage</span>
                ) : !isHub ? (
                  <span>{vertical.label}</span>
                ) : (
                  <span>Overview</span>
                )}
              </p>
              <h1 className="font-display text-pine">{vertical.headline}</h1>
              <p className="pw-industry-support">{vertical.support}</p>
              <div className="pw-industry-hero-actions">
                <Link
                  href={industryQuoteHref(vertical.label)}
                  className="pw-btn"
                >
                  Get a quote
                </Link>
                {!isAlcohol && (
                  <Link
                    href="/docs/api/quotes/"
                    className="pw-btn pw-btn-secondary"
                  >
                    Quotes API
                  </Link>
                )}
              </div>
              {isAlcohol && (
                <p className="pw-industry-hero-meta">
                  <Link href={industryQuoteHref(vertical.label)}>
                    {vertical.secondaryCta ?? "Free coverage review"}
                  </Link>
                  <span aria-hidden> · </span>
                  <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
                </p>
              )}
            </div>

            <div className="pw-industry-hero-stage animate-rise-delay-2">
              {isAlcohol ? (
                <AlcoholFulfillmentScene />
              ) : (
                <IndustryLaptopFrame>
                  <EcommerceStorefrontDemo vertical={vertical} />
                </IndustryLaptopFrame>
              )}
            </div>
          </div>
        </section>

        <section className="pw-industry-verticals">
          <div className="pw-shell">
            <div className="pw-industry-verticals-head">
              <h2 className="font-display text-pine">
                {isHub ? "Ecommerce verticals" : "More ecommerce verticals"}
              </h2>
              <p>
                Nested coverage programs for DTC and omnichannel brands —
                open a vertical to explore the interactive scene.
              </p>
            </div>
            <ul className="pw-industry-vertical-list">
              {ECOMMERCE_VERTICALS.map((item) => {
                const active = item.slug === vertical.slug && !isHub;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/industries/ecommerce/${item.slug}/`}
                      className={`pw-industry-vertical-link${active ? " is-active" : ""}`}
                    >
                      <span>{item.label}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
