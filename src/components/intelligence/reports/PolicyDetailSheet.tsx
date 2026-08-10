"use client";

import type { ReportPolicyRow } from "@/lib/intelligence/report-book";
import {
  formatMoney,
  REPORT_METRIC_LABELS,
} from "@/lib/intelligence/report-book";
import { ProvenanceTag, StatusPill } from "./report-meta";

export function PolicyDetailSheet({
  row,
  onClose,
}: {
  row: ReportPolicyRow | null;
  onClose: () => void;
}) {
  if (!row) return null;

  return (
    <div className="pw-report-sheet" role="dialog" aria-modal="true" aria-label="Policy detail">
      <button
        type="button"
        className="pw-report-sheet-backdrop"
        aria-label="Close policy detail"
        onClick={onClose}
      />
      <aside className="pw-report-sheet-panel">
        <div className="pw-report-sheet-head">
          <div>
            <p className="pw-report-eyebrow">Policy</p>
            <h4 className="pw-report-sheet-title">{row.policyName}</h4>
            <p className="pw-report-sheet-meta">
              {row.clientName} · {row.carrier}
            </p>
          </div>
          <button type="button" className="pw-report-sheet-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="pw-report-sheet-tags">
          <ProvenanceTag provenance={row.provenance} />
          {row.scored && row.scores ? (
            <span className="pw-report-mono">
              Health {row.scores.policyHealthScore}/100
            </span>
          ) : (
            <span className="pw-report-mono">Not scored</span>
          )}
        </div>

        <dl className="pw-report-sheet-dl">
          <div>
            <dt>Current funding</dt>
            <dd>{formatMoney(row.currentPremium)}</dd>
          </div>
          <div>
            <dt>Target premium</dt>
            <dd>{formatMoney(row.targetPremium)}</dd>
          </div>
          <div>
            <dt>Cash value</dt>
            <dd>{formatMoney(row.cashValue)}</dd>
          </div>
          <div>
            <dt>Death benefit</dt>
            <dd>{formatMoney(row.deathBenefit)}</dd>
          </div>
          <div>
            <dt>Loans</dt>
            <dd>{formatMoney(row.loans)}</dd>
          </div>
          <div>
            <dt>Source document</dt>
            <dd>{row.documentName ?? "—"}</dd>
          </div>
        </dl>

        <div className="pw-report-sheet-signals">
          <p className="pw-report-kicker">Signal status</p>
          <ul>
            {(Object.keys(REPORT_METRIC_LABELS) as Array<keyof typeof REPORT_METRIC_LABELS>).map(
              (key) => (
                <li key={key}>
                  <span>{REPORT_METRIC_LABELS[key]}</span>
                  <StatusPill status={row.signals[key]} />
                </li>
              ),
            )}
          </ul>
        </div>

        {row.recommendations[0] ? (
          <div className="pw-report-sheet-action">
            <p className="pw-report-kicker">Recommended action</p>
            <p>{row.recommendations[0].title}</p>
            <p className="pw-report-muted">{row.recommendations[0].rationale}</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
