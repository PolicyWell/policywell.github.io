"use client";

import { useMemo, useState } from "react";
import type {
  CoverageProfile,
  RequirementGroup,
  RequirementKind,
} from "@/lib/coverage-library";

const PAGE = 50;

export function CoverageProfileRequirements({
  profile,
}: {
  profile: CoverageProfile;
}) {
  const [group, setGroup] = useState<"All" | RequirementGroup>("All");
  const [kind, setKind] = useState<"All" | RequirementKind>("All");
  const [peril, setPeril] = useState("All");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE);

  const perils = useMemo(() => {
    const set = new Set(profile.requirements.map((row) => row.peril));
    return ["All", ...[...set].sort((a, b) => a.localeCompare(b))];
  }, [profile.requirements]);

  const counts = useMemo(() => {
    const byGroup: Record<string, number> = { All: profile.requirements.length };
    const byKind: Record<string, number> = { All: profile.requirements.length };
    const byPeril: Record<string, number> = { All: profile.requirements.length };
    for (const row of profile.requirements) {
      byGroup[row.group] = (byGroup[row.group] ?? 0) + 1;
      byKind[row.kind] = (byKind[row.kind] ?? 0) + 1;
      byPeril[row.peril] = (byPeril[row.peril] ?? 0) + 1;
    }
    return { byGroup, byKind, byPeril };
  }, [profile.requirements]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profile.requirements.filter((row) => {
      if (group !== "All" && row.group !== group) return false;
      if (kind !== "All" && row.kind !== kind) return false;
      if (peril !== "All" && row.peril !== peril) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.coverage.toLowerCase().includes(q) ||
        row.peril.toLowerCase().includes(q) ||
        row.text.toLowerCase().includes(q)
      );
    });
  }, [profile.requirements, group, kind, peril, query]);

  const shown = filtered.slice(0, visible);
  const dirty =
    group !== "All" || kind !== "All" || peril !== "All" || query.trim() !== "";

  function reset() {
    setGroup("All");
    setKind("All");
    setPeril("All");
    setQuery("");
    setVisible(PAGE);
  }

  return (
    <div className="pw-cl-requirements">
      <label className="pw-cl-window-search pw-cl-req-search">
        <span className="sr-only">Search requirements</span>
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
            setVisible(PAGE);
          }}
          placeholder="Search requirements…"
        />
      </label>

      <div className="pw-cl-req-filters">
        <div className="pw-cl-req-filter-block">
          <p className="pw-cl-filters-label">Group</p>
          <div className="pw-cl-chip-row" role="group" aria-label="Requirement group">
            {(["All", "General", "Property", "Liability"] as const).map((g) => (
              <button
                key={g}
                type="button"
                className={`pw-cl-chip${group === g ? " is-active" : ""}`}
                onClick={() => {
                  setGroup(g);
                  setVisible(PAGE);
                }}
              >
                {g} {counts.byGroup[g] ?? 0}
              </button>
            ))}
          </div>
        </div>

        <div className="pw-cl-req-filter-block">
          <p className="pw-cl-filters-label">Type</p>
          <div className="pw-cl-chip-row" role="group" aria-label="Requirement type">
            {(
              ["All", "Limit", "Deductible", "Carrier Rating", "Other"] as const
            ).map((k) => (
              <button
                key={k}
                type="button"
                className={`pw-cl-chip${kind === k ? " is-active" : ""}`}
                onClick={() => {
                  setKind(k);
                  setVisible(PAGE);
                }}
              >
                {k} {counts.byKind[k] ?? 0}
              </button>
            ))}
          </div>
        </div>

        <div className="pw-cl-req-filter-block">
          <p className="pw-cl-filters-label">Peril</p>
          <label className="pw-cl-req-peril">
            <span className="sr-only">Peril</span>
            <select
              value={peril}
              onChange={(e) => {
                setPeril(e.target.value);
                setVisible(PAGE);
              }}
            >
              {perils.map((item) => (
                <option key={item} value={item}>
                  {item === "All"
                    ? `All ${counts.byPeril.All ?? 0}`
                    : `${item} ${counts.byPeril[item] ?? 0}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="pw-cl-req-status">
        <p className="pw-cl-browse-count">
          Showing <strong>{shown.length}</strong> of{" "}
          <strong>{filtered.length}</strong> matching ·{" "}
          {profile.requirements.length} total
        </p>
        {dirty ? (
          <button type="button" className="pw-cl-req-reset" onClick={reset}>
            <span aria-hidden>↻</span> Reset filters
          </button>
        ) : null}
      </div>

      <div className="pw-cl-table-wrap">
        <table className="pw-cl-table pw-cl-req-table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Peril</th>
              <th>Requirement type</th>
              <th>Applicability</th>
              <th>Requirement — tabulated</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td className="pw-cl-req-name">
                  <span className="pw-cl-req-path">
                    {row.group} — {row.coverage}
                  </span>
                  <strong>{row.name}</strong>
                </td>
                <td className="pw-cl-req-peril-cell">{row.peril}</td>
                <td>
                  <span className="pw-cl-req-type-tag">{row.kind}</span>
                </td>
                <td className="pw-cl-req-applicability">{row.applicability}</td>
                <td className="pw-cl-req-tabulated">{row.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible < filtered.length ? (
        <button
          type="button"
          className="pw-btn pw-btn-secondary pw-cl-more"
          onClick={() => setVisible((n) => n + PAGE)}
        >
          Load {Math.min(PAGE, filtered.length - visible)} more
          <span className="pw-cl-more-meta">
            {filtered.length - visible} remaining
          </span>
        </button>
      ) : null}
    </div>
  );
}
