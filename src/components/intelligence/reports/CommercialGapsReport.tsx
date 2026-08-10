"use client";

import { LOB_LABELS } from "@/lib/commercial-types";
import type { CommercialReportBook } from "@/lib/intelligence/commercial-report-book";
import { ProvenanceTag, ReportHeader, StatusPill } from "./report-meta";

export function CommercialGapsReport({ book }: { book: CommercialReportBook }) {
  const severityCounts = {
    high: book.gaps.filter((g) => g.severity === "high").length,
    medium: book.gaps.filter((g) => g.severity === "medium").length,
    low: book.gaps.filter((g) => g.severity === "low").length,
  };
  const maxBar = Math.max(1, ...Object.values(severityCounts));

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Policy gaps"
        subtitle={`Open coverage gaps for ${book.accountName} from the commercial gap engine.`}
      />

      <div className="pw-report-summary">
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Total policies</span>
          <strong className="pw-report-stat-value">{book.totalPolicies}</strong>
        </div>
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Gaps detected</span>
          <strong className="pw-report-stat-value">{book.gaps.length}</strong>
        </div>
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Coverage adequacy</span>
          <strong className="pw-report-stat-value">{book.coverageAdequacyScore}</strong>
        </div>
        <div className="pw-report-bars" aria-label="Gaps by severity">
          <p className="pw-report-kicker">Distribution by severity</p>
          {(
            [
              ["high", severityCounts.high],
              ["medium", severityCounts.medium],
              ["low", severityCounts.low],
            ] as const
          ).map(([label, count]) => (
            <div key={label} className="pw-report-bar-row">
              <span>{label}</span>
              <div className="pw-report-bar-track">
                <span
                  className={`pw-report-bar-fill is-${label}`}
                  style={{ width: `${(count / maxBar) * 100}%` }}
                />
              </div>
              <span className="pw-report-mono">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pw-report-scroll">
        <table className="pw-report-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Account</th>
              <th>Line</th>
              <th>Gap</th>
              <th>Severity</th>
              <th>Confidence</th>
              <th>Missing requirements</th>
            </tr>
          </thead>
          <tbody>
            {book.gaps.length === 0 ? (
              <tr>
                <td colSpan={7} className="pw-report-empty">
                  No coverage gaps from current commercial rules.
                </td>
              </tr>
            ) : (
              book.gaps.map((gap) => (
                <tr key={gap.id}>
                  <td>
                    <StatusPill
                      status={
                        gap.severity === "high"
                          ? "critical"
                          : gap.severity === "medium"
                            ? "attention"
                            : "monitor"
                      }
                    />
                  </td>
                  <td>
                    {book.accountName}{" "}
                    <ProvenanceTag provenance={book.provenance} />
                  </td>
                  <td>{LOB_LABELS[gap.line]}</td>
                  <td>
                    <strong>{gap.title}</strong>
                    <div className="pw-report-sub">{gap.rationale}</div>
                  </td>
                  <td className="pw-report-cap">{gap.severity}</td>
                  <td className="pw-report-mono">
                    {Math.round(gap.confidence * 100)}%
                  </td>
                  <td>{gap.missingRequirements.join(", ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
