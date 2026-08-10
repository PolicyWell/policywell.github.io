"use client";

import { useState } from "react";
import {
  cellAt,
  HEATMAP_COVERAGES,
  HEATMAP_PERILS,
  type CommercialReportBook,
  type HeatmapCoverageId,
  type HeatmapPerilId,
  type PerilCell,
} from "@/lib/intelligence/commercial-report-book";
import { MatrixIcon, ReportHeader, STATUS_LABELS, StatusPill } from "./report-meta";

export function PerilHeatmapReport({ book }: { book: CommercialReportBook }) {
  const [active, setActive] = useState<PerilCell | null>(null);

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Coverage × peril heatmap"
        subtitle={`${book.accountName} — in-force program signals by coverage and peril.`}
        icon={<MatrixIcon />}
      />

      <p className="pw-report-banner">{book.disclaimer}</p>

      <div className="pw-report-scroll">
        <table className="pw-report-matrix pw-report-matrix-peril">
          <thead>
            <tr>
              <th scope="col">Coverage</th>
              {HEATMAP_PERILS.map((p) => (
                <th key={p.id} scope="col">
                  <span className="pw-report-peril-label">{p.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEATMAP_COVERAGES.map((cov) => (
              <tr key={cov.id}>
                <th scope="row">{cov.label}</th>
                {HEATMAP_PERILS.map((peril) => {
                  const cell = cellAt(
                    book,
                    cov.id as HeatmapCoverageId,
                    peril.id as HeatmapPerilId,
                  );
                  const status = cell?.status ?? "unknown";
                  return (
                    <td key={peril.id}>
                      <button
                        type="button"
                        className={`pw-report-cell pw-report-cell-${status}`}
                        aria-label={`${cov.label} × ${peril.label}: ${STATUS_LABELS[status]}`}
                        onClick={() => setActive(cell ?? null)}
                      >
                        <span>{status === "na" ? "—" : status === "healthy" ? "●" : status === "monitor" ? "◐" : "!"}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pw-report-legend-row">
        <span className="pw-report-pill pw-report-pill-na">Grey = N/A / no axis fit</span>
        <StatusPill status="healthy" />
        <StatusPill status="monitor" />
        <StatusPill status="attention" />
        <StatusPill status="critical" />
      </div>

      {active ? (
        <aside className="pw-report-cell-detail" aria-live="polite">
          <div className="pw-report-cell-detail-head">
            <div>
              <p className="pw-report-kicker">
                {HEATMAP_COVERAGES.find((c) => c.id === active.coverageId)?.label} ×{" "}
                {HEATMAP_PERILS.find((p) => p.id === active.perilId)?.label}
              </p>
              <StatusPill status={active.status} />
            </div>
            <button type="button" className="pw-report-text-btn" onClick={() => setActive(null)}>
              Dismiss
            </button>
          </div>
          <p>{active.note}</p>
          <p className="pw-report-muted">
            Source: {book.accountName} commercial program · simulated demo seed
          </p>
        </aside>
      ) : (
        <p className="pw-report-hint">Select a cell for coverage / peril explanation.</p>
      )}
    </div>
  );
}
