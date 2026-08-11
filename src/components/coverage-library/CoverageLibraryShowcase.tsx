"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CoverageShowcaseProfile = {
  slug: string;
  name: string;
  industry: string;
  assetTypes: string[];
  completionScore: number;
  takeaways: string[];
  requirementCount: number;
  coverageCount: number;
  perilCount: number;
  pairCount: number;
};

function perilLabel(count: number) {
  return count === 1 ? "1 peril" : `${count} distinct perils`;
}

function assetLabel(types: string[]) {
  if (types.length === 1) return `1 asset type: ${types[0]}`;
  return `${types.length} asset types: ${types.slice(0, 2).join(", ")}`;
}

export function CoverageLibraryShowcase({
  profiles,
  industries,
}: {
  profiles: CoverageShowcaseProfile[];
  industries: string[];
}) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (industry !== "all" && p.industry !== industry) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q) ||
        p.assetTypes.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [profiles, query, industry]);

  const active = activeSlug
    ? (profiles.find((p) => p.slug === activeSlug) ?? null)
    : null;

  const chips = useMemo(
    () => [
      { id: "all", label: "All" },
      ...industries.map((item) => ({ id: item, label: item })),
    ],
    [industries],
  );

  return (
    <div className="pw-cl-showcase">
      <div className="pw-cl-showcase-glow" aria-hidden />
      <div
        className="pw-cl-window"
        role="region"
        aria-label="Coverage Library preview"
      >
        <header className="pw-cl-window-chrome">
          <span className="pw-cl-window-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <p className="pw-cl-window-title">Coverage Library</p>
          {active ? (
            <button
              type="button"
              className="pw-cl-window-close"
              aria-label="Close profile preview"
              onClick={() => setActiveSlug(null)}
            >
              ×
            </button>
          ) : (
            <span className="pw-cl-window-close-spacer" aria-hidden />
          )}
        </header>

        {active ? (
          <div className="pw-cl-window-detail" key={active.slug}>
            <p className="pw-cl-window-industry">{active.industry}</p>
            <h3 className="pw-cl-window-profile-name">{active.name}</h3>

            <div className="pw-cl-window-takeaways">
              <p className="pw-cl-window-kicker">Key takeaways</p>
              <ul>
                {(active.takeaways.length
                  ? active.takeaways
                  : [
                      `Spans ${active.requirementCount} published requirements across ${active.pairCount} coverage type peril pairs.`,
                      `Applies to ${assetLabel(active.assetTypes)}.`,
                      `Covers ${active.coverageCount} coverage types and ${perilLabel(active.perilCount)}.`,
                    ]
                )
                  .slice(0, 3)
                  .map((item) => (
                    <li key={item}>
                      <span className="pw-cl-window-check is-moss" aria-hidden>
                        <svg viewBox="0 0 16 16" width="10" height="10">
                          <path
                            fill="none"
                            stroke="#fff"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.5 8.2 6.4 11l6-6.5"
                          />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="pw-cl-window-glance">
              <p className="pw-cl-window-kicker">At a glance</p>
              <dl>
                <div>
                  <dd>{active.requirementCount}</dd>
                  <dt>Requirements</dt>
                </div>
                <div>
                  <dd>{active.coverageCount}</dd>
                  <dt>Coverage types</dt>
                </div>
                <div>
                  <dd>{active.perilCount}</dd>
                  <dt>Perils</dt>
                </div>
                <div>
                  <dd>{active.assetTypes.length}</dd>
                  <dt>Asset types</dt>
                </div>
              </dl>
            </div>

            <div className="pw-cl-window-protection">
              <div className="pw-cl-window-protection-head">
                <p className="pw-cl-window-kicker">Protection</p>
                <strong>{active.completionScore}%</strong>
              </div>
              <div className="pw-cl-window-bar pw-cl-window-bar-lg" aria-hidden>
                <span
                  style={{
                    width: `${Math.max(8, Math.min(100, active.completionScore))}%`,
                  }}
                />
              </div>
            </div>

            {active.assetTypes.length ? (
              <div className="pw-cl-window-assets">
                <p className="pw-cl-window-kicker">Asset types covered</p>
                <ul className="pw-cl-risk-card-assets">
                  {active.assetTypes.slice(0, 4).map((asset) => (
                    <li key={asset}>{asset}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="pw-cl-window-footer is-overlay">
              <Link
                href={`/platform/coverage-library/${active.slug}/`}
                className="pw-cl-window-cta"
              >
                Read full report »
              </Link>
            </div>
          </div>
        ) : (
          <div className="pw-cl-window-browse">
            <label className="pw-cl-window-search">
              <span className="sr-only">Search risk profiles</span>
              <svg
                viewBox="0 0 20 20"
                width="16"
                height="16"
                aria-hidden
                className="pw-cl-window-search-icon"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  d="M8.5 14.5a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm5.2-1.3 3.6 3.6"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search risk profiles, industries, coverage"
              />
            </label>

            <div className="pw-cl-window-filters" role="tablist" aria-label="Industry">
              <span className="pw-cl-window-show">Show</span>
              <div className="pw-cl-window-chips">
                {chips.map((chip) => {
                  const selected = industry === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      className={
                        selected
                          ? "pw-cl-window-chip is-active"
                          : "pw-cl-window-chip"
                      }
                      onClick={() => setIndustry(chip.id)}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pw-cl-window-cols" aria-hidden>
              <span>Risk profile</span>
              <span>Completion</span>
            </div>

            <ul className="pw-cl-window-list">
              {filtered.length === 0 ? (
                <li className="pw-cl-window-empty">No profiles match that search.</li>
              ) : (
                filtered.map((profile) => (
                  <li key={profile.slug}>
                    <button
                      type="button"
                      className="pw-cl-window-row"
                      onClick={() => setActiveSlug(profile.slug)}
                    >
                      <span className="pw-cl-window-row-main">
                        <strong>{profile.name}</strong>
                        <em>
                          {profile.industry}
                          {profile.assetTypes[0]
                            ? ` · ${profile.assetTypes[0]}`
                            : ""}
                        </em>
                      </span>
                      <span className="pw-cl-window-row-meta">
                        <span
                          className="pw-cl-window-bar"
                          aria-hidden
                        >
                          <span
                            style={{
                              width: `${Math.max(8, Math.min(100, profile.completionScore))}%`,
                            }}
                          />
                        </span>
                        <span className="pw-cl-window-pct">
                          {profile.completionScore}%
                        </span>
                        <span className="pw-cl-window-chevron" aria-hidden>
                          →
                        </span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="pw-cl-window-footer is-overlay">
              <Link
                href="/platform/coverage-library/"
                className="pw-cl-window-cta"
              >
                Browse the full library
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
