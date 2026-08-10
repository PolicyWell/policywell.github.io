"use client";

import type { ProposalBook } from "@/lib/intelligence/proposal-book";

export function MarketStandardSlide({ book }: { book: ProposalBook }) {
  const prior = book.traditionalScore;
  const proposed = book.proposedScore;

  return (
    <div className="pw-proposal-page">
      <h3 className="pw-proposal-page-title">
        Benchmarking coverage to a published specification
      </h3>
      <p className="pw-proposal-lede">
        A renewal can be judged two ways. One asks whether the policy changed
        while the other asks whether it is right.
      </p>

      <div className="pw-proposal-compare">
        <article className="pw-proposal-compare-card is-traditional">
          <p className="pw-proposal-compare-eyebrow is-amber">
            The traditional check
          </p>
          <p className="pw-proposal-compare-copy">
            This year&apos;s policy is set against last year&apos;s, and because
            the two agree nothing was lost.
          </p>
          <p className="pw-proposal-compare-metric">No market standard</p>
          <div
            className="pw-proposal-bars is-flat"
            role="img"
            aria-label="Prior and proposed both match with no market standard"
          >
            <div className="pw-proposal-bar-col">
              <span className="pw-proposal-bar-link">no change</span>
              <span className="pw-proposal-bar is-prior" style={{ height: "52%" }} />
              <span className="pw-proposal-bar-label">Prior</span>
            </div>
            <div className="pw-proposal-bar-col">
              <span className="pw-proposal-bar is-prior" style={{ height: "52%" }} />
              <span className="pw-proposal-bar-label">Proposed</span>
            </div>
          </div>
          <p className="pw-proposal-compare-foot">
            The comparison is self-referential. It can only report that the two
            policies match, and it is silent on whether either was adequate.
          </p>
        </article>

        <article className="pw-proposal-compare-card is-market">
          <p className="pw-proposal-compare-eyebrow is-moss">
            Benchmarked to a market standard
          </p>
          <p className="pw-proposal-compare-copy">
            Both policies are scored against the case&apos;s risk profile, a
            published market standard.
          </p>
          <p className="pw-proposal-compare-metric is-solid">
            The market standard · 100%
          </p>
          <div
            className="pw-proposal-bars is-scored"
            role="img"
            aria-label={`Prior ${prior}% and proposed ${proposed}% against market standard`}
          >
            <div className="pw-proposal-standard-line" aria-hidden="true" />
            <div className="pw-proposal-bar-col">
              <span
                className="pw-proposal-bar is-prior is-short"
                style={{ height: `${prior}%` }}
              />
              <span className="pw-proposal-bar-label">Prior</span>
            </div>
            <div className="pw-proposal-bar-col">
              <span className="pw-proposal-gain" aria-hidden="true">
                measured gain
              </span>
              <span
                className="pw-proposal-bar is-proposed"
                style={{ height: `${proposed}%` }}
              />
              <span className="pw-proposal-bar-label">Proposed</span>
            </div>
          </div>
          <p className="pw-proposal-compare-foot">
            Scoring both against the current standard shows coverage against the
            newest understanding of the risk — and where the program still falls
            short.
          </p>
        </article>
      </div>
    </div>
  );
}
