"use client";

import type { ProposalBook } from "@/lib/intelligence/proposal-book";

export function CohortStrengthSlide({ book }: { book: ProposalBook }) {
  return (
    <div className="pw-proposal-page">
      <h3 className="pw-proposal-page-title">
        How a comparable cohort is assembled
      </h3>
      <p className="pw-proposal-lede">
        Benchmarks are created by comparing the subject program against a risk
        profile. Match strength tells the reader how much weight the cohort can
        carry in the conversation — without inventing peers that are not there.
      </p>

      <ul className="pw-proposal-cohort-list">
        {book.cohort.map((row) => (
          <li key={row.level} className="pw-proposal-cohort-card">
            <div className="pw-proposal-cohort-head">
              <strong>{row.label}</strong>
              <span
                className="pw-proposal-cohort-meter"
                aria-label={`${row.filled} of 4 characteristics held`}
              >
                {Array.from({ length: 4 }, (_, i) => (
                  <i
                    key={i}
                    className={i < row.filled ? "is-on" : undefined}
                  />
                ))}
              </span>
            </div>
            <p>{row.copy}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
