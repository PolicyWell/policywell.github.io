"use client";

import {
  statusAt,
  type ProposalBook,
  type ProposalCellStatus,
} from "@/lib/intelligence/proposal-book";

const LEGEND: { status: ProposalCellStatus; label: string }[] = [
  { status: "pass", label: "Pass" },
  { status: "fail", label: "Fail" },
  { status: "missing", label: "Missing" },
  { status: "waived", label: "Waived" },
  { status: "na", label: "N/A" },
];

export function CoverageStatusSlide({ book }: { book: ProposalBook }) {
  return (
    <div className="pw-proposal-page">
      <h3 className="pw-proposal-page-title">
        Status of every coverage and peril pair
      </h3>
      <p className="pw-proposal-mono">{book.locationLine}</p>

      <div className="pw-proposal-scroll">
        <table className="pw-proposal-status-matrix">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Peril</span>
              </th>
              {book.statusCoverages.map((cov) => (
                <th key={cov.id} scope="col">
                  <span>{cov.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {book.statusPerils.map((peril) => (
              <tr key={peril.id}>
                <th scope="row">{peril.label}</th>
                {book.statusCoverages.map((cov) => {
                  const status = statusAt(book, cov.id, peril.id);
                  return (
                    <td key={cov.id}>
                      <span
                        className={`pw-proposal-status pw-proposal-status-${status}`}
                      >
                        {status === "na" ? "N/A" : status}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pw-proposal-legend">
        {LEGEND.map((item) => (
          <span key={item.status} className="pw-proposal-legend-item">
            <i className={`pw-proposal-status-${item.status}`} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
      <p className="pw-proposal-footnote">
        Where several requirements pair the same peril with the same coverage,
        the cell shows the worst of them — so a passing cell means every
        requirement behind it passed.
      </p>
    </div>
  );
}
