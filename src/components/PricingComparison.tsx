import type { ComparisonValue } from "@/lib/pricing-data";
import { PRICING } from "@/lib/pricing-data";

export function PricingComparison() {
  const { columns, rows } = PRICING.comparison;

  return (
    <div className="pw-pricing-compare">
      <div className="pw-pricing-compare-scroll" tabIndex={0}>
        <table>
          <caption className="sr-only">
            Feature comparison across PolicyWell pricing tiers
          </caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {columns.map((col) => (
                <th key={col.id} scope="col">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.feature}</th>
                {row.values.map((value, i) => (
                  <td key={`${row.feature}-${columns[i].id}`}>
                    <Cell value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ value }: { value: ComparisonValue }) {
  if (value === true) {
    return (
      <span className="pw-pricing-cell-yes" aria-label="Included">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path
            d="M3.2 8.2 6.4 11.4 12.8 4.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="pw-pricing-cell-no" aria-label="Not included">
        -
      </span>
    );
  }
  return <span className="pw-pricing-cell-text">{value}</span>;
}
