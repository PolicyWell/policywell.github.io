"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CoverageProfile } from "@/lib/coverage-library";
import {
  buildIndustryMeta,
  type IndustryMeta,
} from "@/lib/coverage-library/industry-meta";
import { IndustryGlyph } from "./IndustryGlyph";

const PAGE_SIZE = 12;

export function CoverageLibraryBrowse({
  profiles,
  industries,
}: {
  profiles: CoverageProfile[];
  industries: string[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const industryMeta = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const profile of profiles) {
      counts[profile.industry] = (counts[profile.industry] ?? 0) + 1;
    }
    return buildIndustryMeta(industries, counts);
  }, [profiles, industries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (selected.length && !selected.includes(p.industry)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q) ||
        p.assetTypes.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [profiles, query, selected]);

  const shown = filtered.slice(0, visible);

  function toggleIndustry(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    setVisible(PAGE_SIZE);
  }

  function clearFilters() {
    setSelected([]);
    setQuery("");
    setVisible(PAGE_SIZE);
  }

  return (
    <div className="pw-cl-browse-layout">
      <div className="pw-cl-filters-panel">
        <div className="pw-cl-filters-head">
          <p>Filters</p>
          {selected.length || query ? (
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          ) : (
            <span />
          )}
        </div>
        <p className="pw-cl-filters-label">Industry / asset type</p>
        <ul className="pw-cl-industry-list">
          {industryMeta.map((item) => (
            <IndustryFilterRow
              key={item.id}
              item={item}
              active={selected.includes(item.id)}
              onToggle={() => toggleIndustry(item.id)}
            />
          ))}
        </ul>
      </div>

      <div className="pw-cl-browse-window">
        <header className="pw-cl-window-chrome">
          <span className="pw-cl-window-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <p className="pw-cl-window-title">Coverage Library</p>
          <span className="pw-cl-window-close-spacer" aria-hidden />
        </header>

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
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search risk profiles, industries, coverage"
            />
          </label>

          <div className="pw-cl-window-filters" role="tablist" aria-label="Show">
            <span className="pw-cl-window-show">Show</span>
            <div className="pw-cl-window-chips">
              <button
                type="button"
                role="tab"
                aria-selected={selected.length === 0}
                className={
                  selected.length === 0
                    ? "pw-cl-window-chip is-active"
                    : "pw-cl-window-chip"
                }
                onClick={() => {
                  setSelected([]);
                  setVisible(PAGE_SIZE);
                }}
              >
                All
              </button>
              {industryMeta.slice(0, 8).map((item) => {
                const on = selected.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    className={
                      on ? "pw-cl-window-chip is-active" : "pw-cl-window-chip"
                    }
                    onClick={() => toggleIndustry(item.id)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pw-cl-window-cols" aria-hidden>
            <span>Risk profile</span>
            <span>Completion</span>
          </div>

          <ul className="pw-cl-window-list pw-cl-browse-window-list">
            {shown.length === 0 ? (
              <li className="pw-cl-window-empty">
                No profiles match those filters.
              </li>
            ) : (
              shown.map((profile) => (
                <li key={profile.slug}>
                  <Link
                    href={`/platform/coverage-library/${profile.slug}/`}
                    className="pw-cl-window-row pw-cl-window-row-link"
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
                      <span className="pw-cl-window-bar" aria-hidden>
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
                  </Link>
                </li>
              ))
            )}
          </ul>

          <div className="pw-cl-window-footer pw-cl-browse-footer">
            {visible < filtered.length ? (
              <button
                type="button"
                className="pw-cl-window-cta pw-cl-window-cta-ghost"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
              >
                Show more profiles · {shown.length} of {filtered.length}
              </button>
            ) : null}
            <Link href="/demo/" className="pw-cl-window-cta">
              Request demo access
            </Link>
            <p className="pw-cl-browse-count">
              Showing {shown.length} of {filtered.length} matching ·{" "}
              {profiles.length} total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IndustryFilterRow({
  item,
  active,
  onToggle,
}: {
  item: IndustryMeta;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={
          active ? "pw-cl-industry-row is-active" : "pw-cl-industry-row"
        }
        aria-pressed={active}
        onClick={onToggle}
      >
        <span className="pw-cl-industry-icon">
          <IndustryGlyph glyph={item.glyph} />
        </span>
        <span className="pw-cl-industry-name">{item.label}</span>
        <span className="pw-cl-industry-count">{item.count}</span>
      </button>
    </li>
  );
}
