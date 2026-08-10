"use client";

import { useState } from "react";
import type { CommercialReportBook } from "@/lib/intelligence/commercial-report-book";
import { ProvenanceTag, ReportHeader } from "./report-meta";

const BUCKETS = [
  { label: "0–20%", min: 0, max: 20 },
  { label: "21–40%", min: 21, max: 40 },
  { label: "41–60%", min: 41, max: 60 },
  { label: "61–80%", min: 61, max: 80 },
  { label: "81–100%", min: 81, max: 100 },
] as const;

export function CaseComplianceReport({ book }: { book: CommercialReportBook }) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hist = BUCKETS.map((b) => ({
    ...b,
    count: book.cases.filter((c) => {
      const s = c.compliancePct ?? -1;
      return s >= b.min && s <= b.max;
    }).length,
  }));
  const maxHist = Math.max(1, ...hist.map((h) => h.count));
  const hovered = book.cases.find((c) => c.id === hoverId) ?? null;

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Case compliance"
        subtitle="Account readiness from diligence completeness — not an underwriting score."
      />

      <div className="pw-report-summary pw-report-summary-split">
        <div className="pw-report-stat-grid">
          <div className="pw-report-stat">
            <span className="pw-report-stat-label">Total policies</span>
            <strong className="pw-report-stat-value">{book.totalPolicies}</strong>
          </div>
          <div className="pw-report-stat">
            <span className="pw-report-stat-label">Avg requirement score</span>
            <strong className="pw-report-stat-value">{book.avgRequirementScore}%</strong>
          </div>
          <div className="pw-report-stat">
            <span className="pw-report-stat-label">Readiness</span>
            <strong className="pw-report-stat-value">{book.readinessScore}</strong>
          </div>
        </div>
        <div className="pw-report-hist" aria-label="Cases by requirement score">
          <p className="pw-report-kicker">Cases by requirements</p>
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
              <th>Case name</th>
              <th>Compliance score</th>
              <th>Risk profile</th>
            </tr>
          </thead>
          <tbody>
            {book.cases.map((row) => (
              <tr
                key={row.id}
                onMouseEnter={() => setHoverId(row.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <td>
                  <span className="pw-report-link" style={{ textDecoration: "underline" }}>
                    {row.name}
                  </span>{" "}
                  <ProvenanceTag provenance={book.provenance} />
                </td>
                <td>
                  <button
                    type="button"
                    className="pw-report-score-seg"
                    onClick={() => setHoverId(row.id)}
                  >
                    <span className="pw-report-mono">{row.compliancePct ?? "—"}%</span>
                    <span className="pw-report-seg-track" aria-hidden="true">
                      <i
                        className="pw-report-seg-mixed"
                        style={{ width: `${row.compliancePct ?? 0}%` }}
                      />
                    </span>
                  </button>
                </td>
                <td>{row.riskProfile}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hovered ? (
        <aside className="pw-report-tooltip" aria-live="polite">
          <p className="pw-report-tooltip-title">
            Compliance score: {hovered.compliancePct}% ({hovered.compliant + hovered.waived}/
            {hovered.totalRequirements})
          </p>
          <ul className="pw-report-compose">
            <li>
              <span>Compliant</span>
              <strong>{hovered.compliant}</strong>
              <em>Resolved diligence</em>
            </li>
            <li>
              <span>Non-compliant</span>
              <strong>{hovered.nonCompliant}</strong>
              <em>Open medium/low items</em>
            </li>
            <li>
              <span>Missing</span>
              <strong>{hovered.missing}</strong>
              <em>Critical / high open items</em>
            </li>
            <li>
              <span>Waived</span>
              <strong>{hovered.waived}</strong>
              <em>Explicitly waived</em>
            </li>
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
