"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CoverageProfile } from "@/lib/coverage-library";

const PAGE_SIZE = 12;

export function CoverageLibraryBrowse({
  profiles,
  industries,
}: {
  profiles: CoverageProfile[];
  industries: string[];
}) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [sort, setSort] = useState<"score" | "name">("score");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = profiles.filter((p) => {
      if (industry !== "all" && p.industry !== industry) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q) ||
        p.assetTypes.some((a) => a.toLowerCase().includes(q))
      );
    });
    rows = [...rows].sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : b.completionScore - a.completionScore || a.name.localeCompare(b.name),
    );
    return rows;
  }, [profiles, query, industry, sort]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="pw-cl-browse">
      <div className="pw-cl-browse-controls">
        <label className="pw-cl-field">
          <span className="sr-only">Search profiles</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search risk profiles"
            className="pw-cl-input"
          />
        </label>
        <label className="pw-cl-field">
          <span className="sr-only">Industry</span>
          <select
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="pw-cl-input"
          >
            <option value="all">All industries</option>
            {industries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="pw-cl-field">
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "score" | "name")}
            className="pw-cl-input"
          >
            <option value="score">Completion score</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <p className="pw-cl-browse-count">
        {filtered.length} of {profiles.length} profiles
      </p>

      <div className="pw-cl-table-wrap">
        <table className="pw-cl-table">
          <thead>
            <tr>
              <th>Risk profile</th>
              <th>Industry</th>
              <th>Completion score</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((profile) => (
              <tr key={profile.slug}>
                <td>
                  <Link
                    href={`/platform/coverage-library/${profile.slug}/`}
                    className="pw-cl-profile-link"
                  >
                    <strong>{profile.name}</strong>
                    <span>{profile.assetTypes.join(" · ")}</span>
                  </Link>
                </td>
                <td>{profile.industry}</td>
                <td className="pw-cl-mono">{profile.completionScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="pw-cl-card-list">
        {shown.map((profile) => (
          <li key={`card-${profile.slug}`}>
            <Link
              href={`/platform/coverage-library/${profile.slug}/`}
              className="pw-cl-profile-card"
            >
              <strong>{profile.name}</strong>
              <span>
                {profile.assetTypes[0]} · {profile.industry}
              </span>
              <em className="pw-cl-mono">{profile.completionScore}%</em>
            </Link>
          </li>
        ))}
      </ul>

      {visible < filtered.length ? (
        <button
          type="button"
          className="pw-btn pw-btn-secondary pw-cl-more"
          onClick={() => setVisible((n) => n + PAGE_SIZE)}
        >
          Show more profiles
          <span className="pw-cl-more-meta">
            Showing {shown.length} of {filtered.length}
          </span>
        </button>
      ) : (
        <p className="pw-cl-more-meta">
          Showing {shown.length} of {filtered.length}
        </p>
      )}
    </div>
  );
}
