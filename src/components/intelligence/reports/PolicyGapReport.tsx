"use client";

import {
  gapSeverity,
  type GapType,
  type ReportBook,
  type ReportPolicyRow,
} from "@/lib/intelligence/report-book";
import { ProvenanceTag, ReportHeader, StatusPill } from "./report-meta";

export function PolicyGapReport({
  book,
  onSelectPolicy,
}: {
  book: ReportBook;
  onSelectPolicy: (row: ReportPolicyRow) => void;
}) {
  const gapRows = book.rows.flatMap((row) =>
    row.gaps.map((gap) => ({ row, gap, severity: gapSeverity(gap) })),
  );

  const severityCounts = {
    high: gapRows.filter((g) => g.severity === "high").length,
    medium: gapRows.filter((g) => g.severity === "medium").length,
    low: gapRows.filter((g) => g.severity === "low").length,
  };
  const maxBar = Math.max(1, ...Object.values(severityCounts));
  const avgGapScore =
    book.rows.length === 0
      ? 0
      : Math.round(
          book.rows.reduce((acc, r) => acc + r.gaps.length * 12, 0) /
            book.rows.length,
        );

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Policy Gaps"
        subtitle="Open gaps across the book, ranked by severity and review urgency."
      />

      <div className="pw-report-summary">
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Total policies</span>
          <strong className="pw-report-stat-value">{book.rows.length}</strong>
        </div>
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Avg gap score</span>
          <strong className="pw-report-stat-value">{avgGapScore}</strong>
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
              <th>Client</th>
              <th>Policy</th>
              <th>Gap type</th>
              <th>Severity</th>
              <th>Last review</th>
              <th>Recommended action</th>
            </tr>
          </thead>
          <tbody>
            {gapRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="pw-report-empty">
                  No gaps detected from available evidence.
                </td>
              </tr>
            ) : (
              gapRows.map(({ row, gap, severity }) => (
                <tr key={`${row.id}-${gap}`}>
                  <td>
                    <StatusPill status={severityToStatus(severity)} />
                  </td>
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
                  <td>{gap}</td>
                  <td className="pw-report-cap">{severity}</td>
                  <td className="pw-report-mono">
                    {row.daysSinceReview != null
                      ? `${row.daysSinceReview}d implied`
                      : "—"}
                  </td>
                  <td>{actionForGap(gap, row)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function severityToStatus(severity: "high" | "medium" | "low") {
  if (severity === "high") return "critical" as const;
  if (severity === "medium") return "attention" as const;
  return "monitor" as const;
}

function actionForGap(gap: GapType, row: ReportPolicyRow): string {
  const fromRec = row.recommendations[0]?.title;
  if (fromRec) return fromRec;
  switch (gap) {
    case "Underfunded":
      return "Align planned premium to illustrated target.";
    case "Missing in-force illustration":
      return "Request updated in-force illustration.";
    case "Coverage gap":
      return "Review death benefit vs household need.";
    case "Loan exposure":
      return "Review loan repayment path.";
    default:
      return "Schedule advisor review.";
  }
}
