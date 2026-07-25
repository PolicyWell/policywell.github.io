import Link from "next/link";
import { SiteNav } from "@/components/ui";
import {
  INDUSTRY_HUB_PATHS,
  getIndustryChildren,
  getIndustryPage,
  industryHref,
} from "@/lib/industry-pages-data";

export function IndustriesHub() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-clip">
      <SiteNav />
      <main className="pw-industry-page">
        <section className="pw-industries-hub-hero">
          <div className="pw-shell">
            <p className="pw-industry-eyebrow">Industries</p>
            <h1 className="font-display text-pine">
              Insurance for every business we understand
            </h1>
            <p className="pw-industry-support">
              PolicyWell covers ecommerce brands, contractors, restaurants,
              trucking fleets, property managers, and more — browse a vertical
              to start a coverage review.
            </p>
          </div>
        </section>

        <section className="pw-industries-hub-grid-wrap">
          <div className="pw-shell">
            <ul className="pw-industries-hub-grid">
              {INDUSTRY_HUB_PATHS.map((path) => {
                const page = getIndustryPage(path);
                if (!page) return null;
                const nested = getIndustryChildren(path);
                return (
                  <li key={path}>
                    <Link
                      href={industryHref(path)}
                      className="pw-industries-hub-card"
                    >
                      <span className="pw-industries-hub-card-label">
                        {page.label}
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
