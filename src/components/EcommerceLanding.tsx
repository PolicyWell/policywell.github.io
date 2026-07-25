import Link from "next/link";
import { IndustryLaptopFrame } from "@/components/IndustryLaptopFrame";
import { EcommerceStorefrontDemo } from "@/components/EcommerceStorefrontDemo";
import { SiteNav } from "@/components/ui";
import {
  ECOMMERCE_VERTICALS,
  industryQuoteHref,
  type EcommerceVertical,
} from "@/lib/industries-nav";

export function EcommerceLanding({
  vertical,
  isHub = false,
}: {
  vertical: EcommerceVertical;
  isHub?: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-clip">
      <SiteNav />
      <main className="pw-industry-page">
        <section className="pw-industry-hero">
          <div className="pw-shell pw-industry-hero-grid">
            <div className="pw-industry-hero-copy animate-rise">
              <p className="pw-industry-eyebrow">
                <Link href="/industries/ecommerce/">Ecommerce</Link>
                {!isHub && (
                  <>
                    <span aria-hidden> / </span>
                    <span>{vertical.label}</span>
                  </>
                )}
              </p>
              <h1 className="font-display text-pine">{vertical.headline}</h1>
              <p className="pw-industry-support">{vertical.support}</p>
              <div className="pw-industry-hero-actions">
                <Link
                  href={industryQuoteHref(vertical.label)}
                  className="pw-btn"
                >
                  Get a Quote
                </Link>
                <Link href="/docs/api/quotes/" className="pw-btn pw-btn-secondary">
                  Quotes API
                </Link>
              </div>
            </div>

            <div className="pw-industry-hero-stage animate-rise-delay-2">
              <IndustryLaptopFrame>
                <EcommerceStorefrontDemo vertical={vertical} />
              </IndustryLaptopFrame>
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
                open a vertical to explore the interactive storefront.
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
