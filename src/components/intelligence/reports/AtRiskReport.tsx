"use client";

import { useMemo, useState } from "react";
import {
  formatPct,
  type ReportBook,
  type ReportPolicyRow,
  type SignalStatus,
} from "@/lib/intelligence/report-book";
import { ProvenanceTag, ReportHeader, StatusPill } from "./report-meta";

export function AtRiskReport({
  book,
  onSelectPolicy,
}: {
  book: ReportBook;
  onSelectPolicy: (row: ReportPolicyRow) => void;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const points = useMemo(() => {
    return book.rows
      .map((row) => {
        const x = row.daysSinceReview;
        if (x == null) return null;
        // Performance vs expected: funding ratio delta in percent points.
        const ratio =
          row.currentPremium != null &&
          row.targetPremium != null &&
          row.targetPremium > 0
            ? (row.currentPremium / row.targetPremium - 1) * 100
            : null;
        if (ratio == null && !row.scored) return null;
        const y =
          ratio ??
          (row.scores ? row.scores.policyHealthScore - 70 : 0);
        return { row, x, y, status: riskStatus(row) };
      })
      .filter(Boolean) as Array<{
      row: ReportPolicyRow;
      x: number;
      y: number;
      status: SignalStatus;
    }>;
  }, [book.rows]);

  const xMax = Math.max(120, ...points.map((p) => p.x), 1);
  const yMin = Math.min(-30, ...points.map((p) => p.y), 0);
  const yMax = Math.max(40, ...points.map((p) => p.y), 1);
  const hovered = points.find((p) => p.row.id === hoverId) ?? null;

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="At-Risk Policies"
        subtitle="Review cadence versus funding trajectory — click a point for detail."
      />

      <div className="pw-report-scatter-wrap">
        <div className="pw-report-scatter" role="img" aria-label="At-risk scatter plot">
          <span className="pw-report-axis-y">Δ vs expected trajectory</span>
          <div className="pw-report-scatter-plot">
            {[0.25, 0.5, 0.75].map((g) => (
              <span
                key={g}
                className="pw-report-gridline"
                style={{ top: `${g * 100}%` }}
              />
            ))}
            {points.map((p) => {
              const left = (p.x / xMax) * 100;
              const top = ((yMax - p.y) / (yMax - yMin)) * 100;
              return (
                <button
                  key={p.row.id}
                  type="button"
                  className={`pw-report-dot pw-report-dot-${p.status}${
                    hoverId === p.row.id ? " is-active" : ""
                  }`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  aria-label={`${p.row.policyName}, ${p.x} days, ${p.y.toFixed(1)} delta`}
                  onMouseEnter={() => setHoverId(p.row.id)}
                  onFocus={() => setHoverId(p.row.id)}
                  onClick={() => onSelectPolicy(p.row)}
                />
              );
            })}
          </div>
          <span className="pw-report-axis-x">Days since implied last review</span>
        </div>

        {hovered ? (
          <aside className="pw-report-tooltip" aria-live="polite">
            <p className="pw-report-tooltip-title">{hovered.row.productType}</p>
            <p className="pw-report-muted">Client: {hovered.row.clientName}</p>
            <dl className="pw-report-mini-dl">
              <div>
                <dt>Last review</dt>
                <dd>{hovered.x} days</dd>
              </div>
              <div>
                <dt>Funding ratio</dt>
                <dd>
                  {hovered.row.currentPremium != null &&
                  hovered.row.targetPremium
                    ? formatPct(
                        hovered.row.currentPremium / hovered.row.targetPremium,
                        1,
                      )
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Cash value</dt>
                <dd>
                  {hovered.row.cashValue != null
                    ? `$${hovered.row.cashValue.toLocaleString()}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusPill status={hovered.status} />
                </dd>
              </div>
            </dl>
            <p className="pw-report-kicker">Recommended action</p>
            <p>
              {hovered.row.recommendations[0]?.title ??
                "Request updated in-force illustration"}
            </p>
          </aside>
        ) : (
          <p className="pw-report-hint">Hover or focus a point for the policy card.</p>
        )}
      </div>

      <div className="pw-report-scroll">
        <table className="pw-report-table">
          <thead>
            <tr>
              <th>Policy</th>
              <th>Client</th>
              <th>Status</th>
              <th>Review</th>
              <th>Funding</th>
              <th>Opportunity</th>
            </tr>
          </thead>
          <tbody>
            {book.rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <button
                    type="button"
                    className="pw-report-link"
                    onClick={() => onSelectPolicy(row)}
                  >
                    {row.policyName}
                  </button>
                </td>
                <td>
                  {row.clientName} <ProvenanceTag provenance={row.provenance} />
                </td>
                <td>
                  <StatusPill status={riskStatus(row)} />
                </td>
                <td className="pw-report-mono">
                  {row.daysSinceReview != null ? `${row.daysSinceReview}d` : "—"}
                </td>
                <td>
                  <StatusPill status={row.signals.funding} />
                </td>
                <td>{row.recommendations[0]?.title ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function riskStatus(row: ReportPolicyRow): SignalStatus {
  if (!row.scored) return "unknown";
  const priority = row.scores?.reviewPriorityScore ?? 0;
  if (priority >= 75 || row.signals.funding === "critical") return "critical";
  if (priority >= 60 || row.signals.funding === "attention") return "attention";
  if (priority >= 40) return "monitor";
  return "healthy";
}
