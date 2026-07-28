import Link from "next/link";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import {
  INDUSTRY_CATEGORIES,
  industryCategoryHref,
} from "@/lib/industries-nav";
import {
  getIndustryChildren,
  getIndustryPage,
} from "@/lib/industry-pages-data";

export function IndustriesHub() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-clip">
      <SiteNav />
      <main className="pw-industry-page">
        <section className="pw-industries-hub-hero">
          <div className="pw-shell">
            <SiteBreadcrumbs
              className="mb-4"
              items={[
                { name: "Home", path: "/" },
                { name: "Industries", path: "/industries" },
              ]}
            />
            <p className="pw-industry-eyebrow">Industries</p>
            <h1 className="font-display text-pine">
              Insurance for every business we understand
            </h1>
            <p className="pw-industry-support">
              PolicyWell covers financial products (life insurance and
              annuities), ecommerce brands, contractors, restaurants, trucking
              fleets, property managers, and more — browse a vertical to start a
              coverage review.
            </p>
          </div>
        </section>

        <section className="pw-industries-hub-grid-wrap">
          <div className="pw-shell">
            <ul className="pw-industries-hub-grid">
              {INDUSTRY_CATEGORIES.map((category) => {
                const href = industryCategoryHref(category.id);
                const path = href.replace(/\/$/, "") || href;
                const page = getIndustryPage(path);
                const nested = getIndustryChildren(path);
                return (
                  <li key={category.id}>
                    <Link href={href} className="pw-industries-hub-card">
                      <span className="pw-industries-hub-card-label">
                        {page?.label ?? category.label}
                      </span>
                      <span className="pw-industries-hub-card-meta">
                        {nested.length > 0
                          ? `${nested.length} verticals`
                          : "Specialist coverage"}
                      </span>
                      <span className="pw-industries-hub-card-arrow" aria-hidden>
                        →
                      </span>
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
