"use client";

import { useState } from "react";
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

export function PricingCompsReport({ book }: { book: CommercialReportBook }) {
  const [expanded, setExpanded] = useState<string | null>(book.policies[0]?.id ?? null);

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Pricing comps"
        subtitle="Program premiums on file plus illustrative appetite fit — no invented market ROL."
      />

      <p className="pw-report-banner">
        Multi-carrier quote comps are shown only when grounded appetite data exists.
        Harbor Mutual premiums below are from the commercial demo seed; appetite
        carriers are labeled illustrative and do not include premium estimates.
      </p>

      <div className="pw-report-summary">
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Program premium</span>
          <strong className="pw-report-stat-value">
            {formatMoney(book.currentPremium)}
          </strong>
        </div>
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Lines on file</span>
          <strong className="pw-report-stat-value">{book.totalPolicies}</strong>
        </div>
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Appetite matches</span>
          <strong className="pw-report-stat-value">{book.appetite.length}</strong>
        </div>
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
              Limit {formatMoney(row.limit)} · Deductible {formatMoney(row.deductible)}
            </p>
          </td>
        </tr>
      ) : null}
    </>
  );
}
