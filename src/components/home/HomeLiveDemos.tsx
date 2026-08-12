import { BookOfBusinessCLIShowcase } from "@/components/BookOfBusinessCLIShowcase";
import { CoverageLibraryShowcase } from "@/components/coverage-library/CoverageLibraryShowcase";
import { ProposalCarousel } from "@/components/intelligence/proposals/ProposalCarousel";
import { ReportCarousel } from "@/components/intelligence/reports/ReportCarousel";
import { PolicyWellCLIShowcase } from "@/components/PolicyWellCLIShowcase";
import type { CoverageShowcaseProfile } from "@/components/coverage-library/CoverageLibraryShowcase";

/** Proprietary interactive demos kept below the WithCoverage-style carousel. */
export function HomeLiveDemos({
  coverageProfiles,
  coverageIndustries,
}: {
  coverageProfiles: CoverageShowcaseProfile[];
  coverageIndustries: string[];
}) {
  return (
    <div className="pw-wc-live-demos">
      <section
        id="intelligent-insights"
        className="pw-bob-section"
        aria-labelledby="pw-bob-heading"
      >
        <div className="pw-shell pw-shell-wide">
          <BookOfBusinessCLIShowcase />
        </div>
      </section>

      <section
        id="reports"
        className="pw-demo-section pw-demo-reports"
        aria-label="PolicyWell commercial simulations"
      >
        <div className="pw-shell pw-shell-wide">
          <ReportCarousel />
        </div>
      </section>

      <section
        id="proposals"
        className="pw-proposals-section"
        aria-labelledby="pw-proposals-heading"
      >
        <div className="pw-shell pw-shell-wide">
          <ProposalCarousel
            coverageProfiles={coverageProfiles}
            coverageIndustries={coverageIndustries}
            hideCoverageLibrary
          />
        </div>
      </section>

      <section
        id="coverage-library"
        className="pw-wc-live-library"
        aria-label="Coverage Library"
      >
        <div className="pw-shell pw-shell-wide">
          <CoverageLibraryShowcase
            profiles={coverageProfiles}
            industries={coverageIndustries}
          />
        </div>
      </section>

      <section id="agent-cli" className="pw-wc-live-agent" aria-label="Agent CLI">
        <div className="pw-shell pw-shell-wide">
          <PolicyWellCLIShowcase />
        </div>
      </section>
    </div>
  );
}
