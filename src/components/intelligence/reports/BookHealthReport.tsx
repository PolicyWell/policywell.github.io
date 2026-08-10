"use client";

import { useState } from "react";
import type { ReportBook, ReportPolicyRow } from "@/lib/intelligence/report-book";
import { ProvenanceTag, ReportHeader, StatusPill } from "./report-meta";

const BUCKETS = [
  { label: "0–20", min: 0, max: 20 },
  { label: "21–40", min: 21, max: 40 },
  { label: "41–60", min: 41, max: 60 },
  { label: "61–80", min: 61, max: 80 },
  { label: "81–100", min: 81, max: 100 },
] as const;

export function BookHealthReport({
  book,
  onSelectPolicy,
}: {
  book: ReportBook;
  onSelectPolicy: (row: ReportPolicyRow) => void;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const scored = book.rows.filter((r) => r.scored && r.scores);
  const clients = new Set(book.rows.map((r) => r.clientId)).size;
  const avg =
    scored.length === 0
      ? null
      : Math.round(
          scored.reduce((a, r) => a + (r.scores?.policyHealthScore ?? 0), 0) /
            scored.length,
        );

  const hist = BUCKETS.map((b) => ({
    ...b,
    count: scored.filter((r) => {
      const s = r.scores!.policyHealthScore;
      return s >= b.min && s <= b.max;
    }).length,
  }));
  const maxHist = Math.max(1, ...hist.map((h) => h.count));
  const hovered = book.rows.find((r) => r.id === hoverId) ?? null;

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Book Health"
        subtitle="Deterministic policy health across the working book."
      />

      <div className="pw-report-summary pw-report-summary-split">
        <div className="pw-report-stat-grid">
          <div className="pw-report-stat">
            <span className="pw-report-stat-label">Total policies</span>
            <strong className="pw-report-stat-value">{book.rows.length}</strong>
          </div>
          <div className="pw-report-stat">
            <span className="pw-report-stat-label">Total clients</span>
            <strong className="pw-report-stat-value">{clients}</strong>
          </div>
          <div className="pw-report-stat">
            <span className="pw-report-stat-label">Avg policy health score</span>
            <strong className="pw-report-stat-value">
              {avg == null ? "Not scored" : avg}
            </strong>
          </div>
        </div>
        <div className="pw-report-hist" aria-label="Health score distribution">
          <p className="pw-report-kicker">Policies by health score</p>
          <div className="pw-report-hist-bars">
            {hist.map((h) => (
              <div key={h.label} className="pw-report-hist-col">
                <span className="pw-report-mono">{h.count || ""}</span>
                <div
                  className="pw-report-hist-bar"
                  style={{ height: `${Math.max(8, (h.count / maxHist) * 88)}px` }}
                />
                <span>{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pw-report-scroll">
        <table className="pw-report-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Policy</th>
              <th>Health score</th>
              <th>Funding</th>
              <th>Risk</th>
              <th>Review status</th>
            </tr>
          </thead>
          <tbody>
            {book.rows.map((row) => {
              const health = row.scores?.policyHealthScore ?? null;
              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => setHoverId(row.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <td>
                    <button
                      type="button"
                      className="pw-report-link"
                      onClick={() => onSelectPolicy(row)}
                    >
                      {row.clientName}
                    </button>
                    <ProvenanceTag provenance={row.provenance} />
                  </td>
                  <td>{row.policyName}</td>
                  <td>
                    {health == null ? (
                      <span className="pw-report-muted">Not scored</span>
                    ) : (
                      <button
                        type="button"
                        className="pw-report-score-seg"
                        aria-label={`Health score ${health}`}
                        onClick={() => onSelectPolicy(row)}
                      >
                        <span className="pw-report-mono">{health}</span>
                        <span className="pw-report-seg-track" aria-hidden="true">
                          <i style={{ width: `${health}%` }} />
                        </span>
                      </button>
                    )}
                  </td>
                  <td>
                    <StatusPill status={row.signals.funding} />
                  </td>
                  <td>
                    <StatusPill status={row.signals.lapseRisk} />
                  </td>
                  <td>
                    <StatusPill status={row.signals.reviewFreshness} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hovered?.scores ? (
        <aside className="pw-report-cell-detail" aria-live="polite">
          <p className="pw-report-kicker">Score composition · {hovered.clientName}</p>
          <ul className="pw-report-compose">
            {hovered.scores.explanations
              .filter((e) =>
                [
                  "policyHealthScore",
                  "protectionScore",
                  "reviewPriorityScore",
                  "beneficiaryScore",
                ].includes(e.scoreKey),
              )
              .map((e) => (
                <li key={e.scoreKey}>
                  <span>{e.label}</span>
                  <strong>{e.value}</strong>
                  <em>{e.rationale}</em>
                </li>
              ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
