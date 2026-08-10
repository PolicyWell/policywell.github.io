"use client";

import { useState } from "react";
import {
  REPORT_METRIC_LABELS,
  type ReportBook,
  type ReportMetricKey,
  type ReportPolicyRow,
  type SignalStatus,
} from "@/lib/intelligence/report-book";
import {
  MatrixIcon,
  ProvenanceTag,
  ReportHeader,
  STATUS_LABELS,
  StatusPill,
} from "./report-meta";

const METRICS = Object.keys(REPORT_METRIC_LABELS) as ReportMetricKey[];

export function PolicyHealthReport({
  book,
  onSelectPolicy,
}: {
  book: ReportBook;
  onSelectPolicy: (row: ReportPolicyRow) => void;
}) {
  const [active, setActive] = useState<{
    row: ReportPolicyRow;
    metric: ReportMetricKey;
  } | null>(null);

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Policy Health Matrix"
        subtitle="Status of every policy across the signals that matter."
        icon={<MatrixIcon />}
      />

      <div className="pw-report-scroll">
        <table className="pw-report-matrix">
          <thead>
            <tr>
              <th scope="col">Client / Policy</th>
              {METRICS.map((m) => (
                <th key={m} scope="col">
                  <span>{REPORT_METRIC_LABELS[m]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {book.rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">
                  <button
                    type="button"
                    className="pw-report-matrix-policy"
                    onClick={() => onSelectPolicy(row)}
                  >
                    <span className="pw-report-matrix-client">{row.clientName}</span>
                    <span className="pw-report-matrix-name">{row.policyName}</span>
                    <ProvenanceTag provenance={row.provenance} />
                  </button>
                </th>
                {METRICS.map((metric) => {
                  const status = row.signals[metric];
                  return (
                    <td key={metric}>
                      <button
                        type="button"
                        className={`pw-report-cell pw-report-cell-${status}`}
                        aria-label={`${row.policyName}: ${REPORT_METRIC_LABELS[metric]} ${STATUS_LABELS[status]}`}
                        onClick={() => setActive({ row, metric })}
                      >
                        <span>{cellMark(status)}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active ? (
        <aside className="pw-report-cell-detail" aria-live="polite">
          <div className="pw-report-cell-detail-head">
            <div>
              <p className="pw-report-kicker">{REPORT_METRIC_LABELS[active.metric]}</p>
              <StatusPill status={active.row.signals[active.metric]} />
            </div>
            <button type="button" className="pw-report-text-btn" onClick={() => setActive(null)}>
              Dismiss
            </button>
          </div>
          <p className="pw-report-cell-policy">
            {active.row.clientName} · {active.row.policyName}
          </p>
          <p>
            {active.row.signalNotes[active.metric] ??
              "No additional explanation available for this signal."}
          </p>
          <dl className="pw-report-mini-dl">
            <div>
              <dt>Source</dt>
              <dd>{active.row.documentName ?? "Profile fields"}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>
                {active.row.scored
                  ? "Deterministic score engine"
                  : "Insufficient evidence"}
              </dd>
            </div>
            <div>
              <dt>Recommended action</dt>
              <dd>
                {active.row.recommendations[0]?.title ??
                  "Request updated in-force illustration."}
              </dd>
            </div>
          </dl>
        </aside>
      ) : (
        <p className="pw-report-hint">Select a cell for explanation, source, and action.</p>
      )}
    </div>
  );
}

function cellMark(status: SignalStatus): string {
  switch (status) {
    case "healthy":
      return "●";
    case "monitor":
      return "◐";
    case "attention":
      return "!";
    case "critical":
      return "!!";
    case "na":
      return "—";
    default:
      return "?";
  }
}
