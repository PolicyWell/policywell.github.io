"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { BookOfBusinessCLIShowcase } from "@/components/BookOfBusinessCLIShowcase";
import {
  CoverageLibraryShowcase,
  type CoverageShowcaseProfile,
} from "@/components/coverage-library/CoverageLibraryShowcase";
import { ProposalCarousel } from "@/components/intelligence/proposals/ProposalCarousel";
import { ReportCarousel } from "@/components/intelligence/reports/ReportCarousel";
import { PolicyWellCLIShowcase } from "@/components/PolicyWellCLIShowcase";

const TABS = [
  {
    id: "insights",
    label: "Intelligent Insights",
    blurb: "Ingest books · find opportunities",
  },
  {
    id: "reports",
    label: "Reports",
    blurb: "Commercial simulations",
  },
  {
    id: "renewals",
    label: "Sales & Renewals",
    blurb: "Proposal-ready slides",
  },
  {
    id: "library",
    label: "Coverage Library",
    blurb: "Industry benchmarks",
  },
  {
    id: "agent",
    label: "Agent CLI",
    blurb: "Tool-grounded intelligence",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function HomePlatformShowcase({
  coverageProfiles,
  coverageIndustries,
}: {
  coverageProfiles: CoverageShowcaseProfile[];
  coverageIndustries: string[];
}) {
  const [tab, setTab] = useState<TabId>("insights");
  const baseId = useId();

  return (
    <section
      id="platform"
      className="pw-wc-platform"
      aria-labelledby="pw-wc-platform-heading"
    >
      <div className="pw-shell pw-shell-wide">
        <div className="pw-wc-platform-head">
          <h2 id="pw-wc-platform-heading" className="pw-wc-platform-title">
            One Digital Platform To Deliver You A Seamless Experience
          </h2>
          <Link href="/platform/" className="pw-wc-btn-outline pw-wc-btn-outline-light">
            Learn more
          </Link>
        </div>

        <div
          className="pw-wc-platform-tabs"
          role="tablist"
          aria-label="PolicyWell platform surfaces"
        >
          {TABS.map((t) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${baseId}-${t.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${t.id}`}
                className={`pw-wc-platform-tab${selected ? " is-active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="pw-wc-platform-tab-label">{t.label}</span>
                <span className="pw-wc-platform-tab-blurb">{t.blurb}</span>
              </button>
            );
          })}
        </div>

        <div className="pw-wc-platform-stage">
          {TABS.map((t) => {
            const selected = tab === t.id;
            return (
              <div
                key={t.id}
                id={`${baseId}-panel-${t.id}`}
                role="tabpanel"
                aria-labelledby={`${baseId}-${t.id}`}
                hidden={!selected}
                className="pw-wc-platform-panel"
              >
                {t.id === "insights" && (
                  <div id="intelligent-insights">
                    <BookOfBusinessCLIShowcase />
                  </div>
                )}
                {t.id === "reports" && (
                  <div id="reports">
                    <ReportCarousel />
                  </div>
                )}
                {t.id === "renewals" && (
                  <div id="proposals">
                    <ProposalCarousel
                      coverageProfiles={coverageProfiles}
                      coverageIndustries={coverageIndustries}
                      hideCoverageLibrary
                    />
                  </div>
                )}
                {t.id === "library" && (
                  <CoverageLibraryShowcase
                    profiles={coverageProfiles}
                    industries={coverageIndustries}
                  />
                )}
                {t.id === "agent" && <PolicyWellCLIShowcase />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
