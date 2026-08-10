"use client";

import {
  formatMoney,
  formatPct,
  fundingBenchmarks,
  type ReportBook,
  type ReportPolicyRow,
} from "@/lib/intelligence/report-book";
import { ProvenanceTag, ReportHeader, StatusPill } from "./report-meta";

export function FundingReport({
  book,
  onSelectPolicy,
}: {
  book: ReportBook;
  onSelectPolicy: (row: ReportPolicyRow) => void;
}) {
  const focus = book.rows[0] ?? null;
  const bench = focus ? fundingBenchmarks(focus) : null;
  const stack = bench
    ? [
        { label: "Current funding", value: bench.current, tone: "current" as const },
        { label: "No-lapse threshold", value: bench.noLapse, tone: "threshold" as const },
        { label: "Guideline maximum", value: bench.guidelineMax, tone: "guide" as const },
        { label: "TAMRA 7-pay", value: bench.tamra7Pay, tone: "tamra" as const },
      ]
    : [];
  const maxStack = Math.max(1, ...stack.map((s) => s.value ?? 0));

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Funding Benchmarks"
        subtitle="Funding relative to each policy’s own design — not market comps."
      />

      {focus && bench ? (
        <div className="pw-report-funding">
          <div className="pw-report-funding-head">
            <div>
              <p className="pw-report-kicker">Focus policy</p>
              <p className="pw-report-funding-title">
                <button
                  type="button"
                  className="pw-report-link"
                  onClick={() => onSelectPolicy(focus)}
                >
                  {focus.policyName}
                </button>
              </p>
              <p className="pw-report-muted">
                {focus.clientName} · {focus.carrier}
              </p>
            </div>
            <div className="pw-report-funding-kpis">
              <div>
                <span className="pw-report-stat-label">Funding ratio</span>
                <strong>{formatPct(bench.fundingRatio, 1)}</strong>
              </div>
              <div>
                <span className="pw-report-stat-label">Premium headroom</span>
                <strong>{formatMoney(bench.premiumHeadroom)}</strong>
              </div>
              <div>
                <span className="pw-report-stat-label">Status</span>
                <StatusPill status={bench.status} />
              </div>
            </div>
          </div>

          {bench.derived ? (
            <p className="pw-report-banner">
              Illustration schedule lines marked derived are deterministic proxies
              from the policy’s target premium for this simulated demo — not carrier
              MEC filings or market benchmarks.
            </p>
          ) : null}

          <div className="pw-report-stack" aria-label="Funding stack">
            {stack.map((item) => (
              <div key={item.label} className="pw-report-stack-row">
                <div className="pw-report-stack-meta">
                  <strong>{formatMoney(item.value)}</strong>
                  <span>
                    {item.label}
                    {item.tone !== "current" ? " · derived" : ""}
                  </span>
                </div>
                <div className="pw-report-stack-track">
                  <span
                    className={`pw-report-stack-fill is-${item.tone}`}
                    style={{
                      width: `${((item.value ?? 0) / maxStack) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="pw-report-empty">Insufficient premium data to chart funding.</p>
      )}

      <div className="pw-report-scroll">
        <table className="pw-report-table">
          <thead>
            <tr>
              <th>Policy</th>
              <th>Current funding</th>
              <th>No-lapse</th>
              <th>Guideline max</th>
              <th>Funding ratio</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {book.rows.map((row) => {
              const b = fundingBenchmarks(row);
              return (
                <tr key={row.id}>
                  <td>
                    <button
                      type="button"
                      className="pw-report-link"
                      onClick={() => onSelectPolicy(row)}
                    >
                      {row.policyName}
                    </button>
                    <div className="pw-report-sub">
                      {row.clientName} <ProvenanceTag provenance={row.provenance} />
                    </div>
                  </td>
                  <td className="pw-report-mono">{formatMoney(b.current)}</td>
                  <td className="pw-report-mono">
                    {b.noLapse == null ? "Insufficient data" : formatMoney(b.noLapse)}
                  </td>
                  <td className="pw-report-mono">
                    {b.guidelineMax == null
                      ? "Insufficient data"
                      : formatMoney(b.guidelineMax)}
                  </td>
                  <td className="pw-report-mono">{formatPct(b.fundingRatio, 1)}</td>
                  <td>
                    <StatusPill status={b.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
