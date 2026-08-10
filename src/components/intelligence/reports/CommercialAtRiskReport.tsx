"use client";

import { useMemo, useState } from "react";
import {
  formatMoney,
  type CommercialPolicyRow,
  type CommercialReportBook,
} from "@/lib/intelligence/commercial-report-book";
import { ProvenanceTag, ReportHeader, StatusPill } from "./report-meta";

export function CommercialAtRiskReport({ book }: { book: CommercialReportBook }) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const points = useMemo(() => {
    return book.policies
      .filter((p) => p.daysToRenewal != null)
      .map((row) => ({
        row,
        x: row.daysToRenewal!,
        y: row.status === "not_on_file" ? row.underinsuredPressure : row.underinsuredPressure * 0.6,
      }));
  }, [book.policies]);

  const xMax = Math.max(90, ...points.map((p) => p.x), 1);
  const yMax = Math.max(40, ...points.map((p) => p.y), 1);
  const hovered = points.find((p) => p.row.id === hoverId) ?? null;

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="At-risk renewals"
        subtitle="Days to renewal versus underinsured pressure from the commercial risk engine."
      />

      <div className="pw-report-scatter-wrap">
        <div className="pw-report-scatter" role="img" aria-label="At-risk renewal scatter">
          <span className="pw-report-axis-y">Underinsured pressure</span>
          <div className="pw-report-scatter-plot">
            {[0.25, 0.5, 0.75].map((g) => (
              <span key={g} className="pw-report-gridline" style={{ top: `${g * 100}%` }} />
            ))}
            {points.map((p) => (
              <button
                key={p.row.id}
                type="button"
                className={`pw-report-dot pw-report-dot-${dotStatus(p.row)}${
                  hoverId === p.row.id ? " is-active" : ""
                }`}
                style={{
                  left: `${(p.x / xMax) * 100}%`,
                  top: `${100 - (p.y / yMax) * 100}%`,
                }}
                aria-label={`${p.row.name}, ${p.x} days, pressure ${Math.round(p.y)}`}
                onMouseEnter={() => setHoverId(p.row.id)}
                onFocus={() => setHoverId(p.row.id)}
              />
            ))}
          </div>
          <span className="pw-report-axis-x">Days to renewal</span>
        </div>

        {hovered ? (
          <aside className="pw-report-tooltip" aria-live="polite">
            <p className="pw-report-tooltip-title">{hovered.row.name}</p>
            <p className="pw-report-muted">
              {book.accountName} · {hovered.row.lineLabel}
            </p>
            <dl className="pw-report-mini-dl">
              <div>
                <dt>Days to renewal</dt>
                <dd>{hovered.x}</dd>
              </div>
              <div>
                <dt>Premium</dt>
                <dd>{formatMoney(hovered.row.premium)}</dd>
              </div>
              <div>
                <dt>Underinsured</dt>
                <dd>{book.underinsuredScore}/100</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusPill status={dotStatus(hovered.row)} />
                </dd>
              </div>
            </dl>
            <p className="pw-report-kicker">Recommended action</p>
            <p>
              {hovered.row.status === "not_on_file"
                ? "Address coverage gap before market submission."
                : "Start renewal readiness review — gather loss runs and schedules."}
            </p>
          </aside>
        ) : (
          <p className="pw-report-hint">Hover a point for renewal detail.</p>
        )}
      </div>

      <div className="pw-report-scroll">
        <table className="pw-report-table">
          <thead>
            <tr>
              <th>Policy</th>
              <th>Status</th>
              <th>Renewal</th>
              <th>Premium</th>
              <th>Opportunity</th>
            </tr>
          </thead>
          <tbody>
            {book.policies.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.name}
                  <div className="pw-report-sub">
                    {row.lineLabel} <ProvenanceTag provenance={book.provenance} />
                  </div>
                </td>
                <td>
                  <StatusPill status={dotStatus(row)} />
                </td>
                <td className="pw-report-mono">
                  {row.daysToRenewal != null ? `${row.daysToRenewal}d` : "—"}
                </td>
                <td className="pw-report-mono">{formatMoney(row.premium)}</td>
                <td>
                  {row.status === "not_on_file"
                    ? "Fill coverage gap"
                    : "Renewal readiness"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function dotStatus(row: CommercialPolicyRow) {
  if (row.status === "not_on_file" || row.matchQuality === "gap") return "critical" as const;
  if ((row.daysToRenewal ?? 999) <= 60) return "attention" as const;
  if (row.matchQuality === "relevant") return "monitor" as const;
  return "healthy" as const;
}
