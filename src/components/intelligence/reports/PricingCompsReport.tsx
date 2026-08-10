"use client";

import { useMemo, useState } from "react";
import {
  formatMoney,
  type CommercialPolicyRow,
  type CommercialReportBook,
} from "@/lib/intelligence/commercial-report-book";
import { ProvenanceTag, ReportHeader } from "./report-meta";

const MATCH_LABEL = {
  very_strong: "Very strong",
  strong: "Strong",
  relevant: "Relevant",
  directional: "Directional",
  gap: "Gap",
} as const;

const SEGMENT_TONES = [
  "tone-0",
  "tone-1",
  "tone-2",
  "tone-3",
  "tone-4",
] as const;

export function PricingCompsReport({ book }: { book: CommercialReportBook }) {
  const [expanded, setExpanded] = useState<string | null>(
    book.policies.find((p) => p.premium != null)?.id ?? null,
  );

  const premiumRows = useMemo(() => {
    const rows = book.policies.filter(
      (p) => p.premium != null && p.status !== "not_on_file",
    );
    const total = rows.reduce((sum, r) => sum + (r.premium ?? 0), 0);
    return rows.map((row, i) => ({
      row,
      share: total > 0 ? (row.premium ?? 0) / total : 0,
      tone: SEGMENT_TONES[i % SEGMENT_TONES.length]!,
    }));
  }, [book.policies]);

  const totalPremium =
    book.currentPremium ??
    premiumRows.reduce((sum, r) => sum + (r.row.premium ?? 0), 0);

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Pricing comps"
        subtitle="Program premiums on file plus illustrative appetite fit — no invented market ROL."
      />

      <div className="pw-report-premium-module">
        <p className="pw-report-kicker pw-report-kicker-accent">
          Benchmarks to market pricing
        </p>
        <h4 className="pw-report-premium-title">Premium by policy</h4>
        <p className="pw-report-mono pw-report-premium-meta">
          Lines · {premiumRows.length} policies
        </p>

        <div className="pw-report-premium-layout">
          <div className="pw-report-premium-stack" aria-hidden="true">
            <strong className="pw-report-premium-total">
              {formatMoney(totalPremium)}
            </strong>
            <div className="pw-report-premium-bar">
              {premiumRows.map(({ row, share, tone }) => (
                <span
                  key={row.id}
                  className={`pw-report-premium-seg ${tone}`}
                  style={{ flexGrow: Math.max(share, 0.04) }}
                  title={`${row.name}: ${formatMoney(row.premium)}`}
                />
              ))}
            </div>
          </div>

          <div className="pw-report-scroll pw-report-premium-table-wrap">
            <table className="pw-report-table pw-report-premium-table">
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Premium</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {premiumRows.map(({ row, share, tone }) => (
                  <tr key={row.id}>
                    <td>
                      <span className={`pw-report-swatch ${tone}`} aria-hidden="true" />
                      {row.name}
                    </td>
                    <td className="pw-report-mono">{formatMoney(row.premium)}</td>
                    <td className="pw-report-mono">
                      {Math.round(share * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="pw-report-footnote">
          Source: premium recap from the commercial demo program · excludes lines
          not on file · no market ROL invented when carrier quotes are absent.
        </p>
      </div>

      <div className="pw-report-scroll">
        <table className="pw-report-table">
          <thead>
            <tr>
              <th>Policy</th>
              <th>Match quality</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            {book.policies.map((row) => (
              <PolicyPriceRow
                key={row.id}
                row={row}
                book={book}
                expanded={expanded === row.id}
                onToggle={() =>
                  setExpanded((id) => (id === row.id ? null : row.id))
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PolicyPriceRow({
  row,
  book,
  expanded,
  onToggle,
}: {
  row: CommercialPolicyRow;
  book: CommercialReportBook;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr>
        <td>
          <button type="button" className="pw-report-link" onClick={onToggle}>
            {expanded ? "▾ " : "▸ "}
            {row.name}
          </button>
          <div className="pw-report-sub">
            {row.carrier} · {row.lineLabel}{" "}
            <ProvenanceTag provenance={book.provenance} />
          </div>
        </td>
        <td>
          <span className={`pw-report-match pw-report-match-${row.matchQuality}`}>
            {MATCH_LABEL[row.matchQuality]}
          </span>
        </td>
        <td className="pw-report-mono">{formatMoney(row.premium)}</td>
      </tr>
      {expanded ? (
        <tr className="pw-report-expand-row">
          <td colSpan={3}>
            <p className="pw-report-kicker">Appetite carriers (illustrative)</p>
            <ul className="pw-report-carrier-list">
              {book.appetite.map((a) => (
                <li key={a.id}>
                  <strong>{a.carrier}</strong>
                  <span>{a.productOrCoverage}</span>
                  <span className="pw-report-cap">{a.appetiteFit} fit</span>
                  <span className="pw-report-muted">
                    {a.estimatedPremiumRange
                      ? `${formatMoney(a.estimatedPremiumRange.low)}–${formatMoney(a.estimatedPremiumRange.high)}`
                      : "No premium estimate without rating inputs"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="pw-report-muted">
              Limit {formatMoney(row.limit)} · Deductible{" "}
              {formatMoney(row.deductible)}
            </p>
          </td>
        </tr>
      ) : null}
    </>
  );
}
