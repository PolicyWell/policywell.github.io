"use client";

import {
  formatMoney,
  type ProposalBook,
} from "@/lib/intelligence/proposal-book";

export function PremiumByPolicySlide({ book }: { book: ProposalBook }) {
  return (
    <div className="pw-proposal-page">
      <p className="pw-proposal-kicker">Benchmarks to market pricing</p>
      <h3 className="pw-proposal-page-title">Premium by policy</h3>
      <p className="pw-proposal-mono">
        Lines · {book.premiumRows.length} policies
      </p>

      <div className="pw-proposal-premium-layout">
        <div className="pw-proposal-premium-stack" aria-hidden="true">
          <strong className="pw-proposal-premium-total">
            {formatMoney(book.totalPremium)}
          </strong>
          <div className="pw-proposal-premium-bar">
            {book.premiumRows.map((row) => (
              <span
                key={row.id}
                className={`pw-proposal-premium-seg ${row.tone}`}
                style={{ flexGrow: Math.max(row.share, 0.04) }}
                title={`${row.name}: ${formatMoney(row.premium)}`}
              />
            ))}
          </div>
        </div>

        <div className="pw-proposal-scroll">
          <table className="pw-proposal-table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Premium</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {book.premiumRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span
                      className={`pw-proposal-swatch ${row.tone}`}
                      aria-hidden="true"
                    />
                    {row.name}
                  </td>
                  <td className="pw-proposal-mono">
                    {formatMoney(row.premium)}
                  </td>
                  <td className="pw-proposal-mono">
                    {Math.round(row.share * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="pw-proposal-footnote">
        Source: premium recap · excludes policies whose premium is attributed to
        another · blanket premiums recorded per location are summed to the
        policy.
      </p>
    </div>
  );
}
