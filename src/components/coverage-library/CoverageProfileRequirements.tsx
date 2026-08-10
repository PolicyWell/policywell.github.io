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
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE);

  const counts = useMemo(() => {
    const byGroup: Record<string, number> = { All: profile.requirements.length };
    const byKind: Record<string, number> = { All: profile.requirements.length };
    for (const row of profile.requirements) {
      byGroup[row.group] = (byGroup[row.group] ?? 0) + 1;
      byKind[row.kind] = (byKind[row.kind] ?? 0) + 1;
    }
    return { byGroup, byKind };
  }, [profile.requirements]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profile.requirements.filter((row) => {
      if (group !== "All" && row.group !== group) return false;
      if (kind !== "All" && row.kind !== kind) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.coverage.toLowerCase().includes(q) ||
        row.peril.toLowerCase().includes(q) ||
        row.text.toLowerCase().includes(q)
      );
    });
  }, [profile.requirements, group, kind, query]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="pw-cl-requirements">
      <div className="pw-cl-req-filters">
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
              {g}
              <span>{counts.byGroup[g] ?? 0}</span>
            </button>
          ))}
        </div>
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
              {k}
              <span>{counts.byKind[k] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="pw-cl-field pw-cl-field-grow">
          <span className="sr-only">Search requirements</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE);
            }}
            placeholder="Search requirements"
            className="pw-cl-input"
          />
        </label>
      </div>

      <p className="pw-cl-browse-count">
        Showing {shown.length} of {filtered.length} matching ·{" "}
        {profile.requirements.length} total
      </p>

      <div className="pw-cl-table-wrap">
        <table className="pw-cl-table pw-cl-req-table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Peril</th>
              <th>Type</th>
              <th>Applicability</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="pw-cl-req-path">
                    {row.group} › {row.coverage}
                  </span>
                  <strong>{row.name}</strong>
                </td>
                <td>{row.peril}</td>
                <td>{row.kind}</td>
                <td>{row.applicability}</td>
                <td>{row.text}</td>
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
