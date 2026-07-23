import Link from "next/link";
import type { BillingPeriod } from "@/lib/pricing-data";
import type { NestedPlan, PricingTone } from "@/lib/pricing-data";

type PriceBlock = {
  display: string;
  detail: string | null;
};

export function PricingCard({
  name,
  audience,
  tone,
  popular,
  price,
  subheading,
  features,
  cta,
  note,
  valueStatement,
  nestedPlan,
  rangeNote,
  billing,
}: {
  name: string;
  audience: string;
  tone: PricingTone;
  popular: boolean;
  price: PriceBlock;
  subheading: string;
  features: readonly string[];
  cta: { label: string; href: string; variant: "primary" | "secondary" };
  note: string | null;
  valueStatement: string | null;
  nestedPlan: NestedPlan | null;
  rangeNote: string | null;
  billing: BillingPeriod;
}) {
  const nestedPrice =
    nestedPlan == null
      ? null
      : billing === "monthly"
        ? nestedPlan.monthly
        : nestedPlan.annual;

  const external = cta.href.startsWith("http");

  return (
    <article className={`pw-pricing-card tone-${tone}${popular ? " is-popular" : ""}`}>
      {popular && <p className="pw-pricing-badge">Most Popular</p>}
      <header className="pw-pricing-card-head">
        <p className="pw-pricing-audience">{audience}</p>
        <h3 className="pw-pricing-name">{name}</h3>
        <div className="pw-pricing-amount">
          <span className="pw-pricing-figure">{price.display}</span>
          {price.detail ? (
            <span className="pw-pricing-period">{price.detail}</span>
          ) : null}
        </div>
        {rangeNote ? <p className="pw-pricing-range">{rangeNote}</p> : null}
        <p className="pw-pricing-sub">{subheading}</p>
      </header>

      {nestedPlan && nestedPrice ? (
        <div className="pw-pricing-nested">
          <div className="pw-pricing-nested-top">
            <p className="pw-pricing-nested-name">{nestedPlan.name}</p>
            <p className="pw-pricing-nested-price">
              {nestedPrice.display}
              <span> {nestedPrice.detail}</span>
            </p>
          </div>
          <ul className="pw-pricing-nested-list">
            {nestedPlan.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul className="pw-pricing-features">
        {features.map((item) => (
          <li key={item}>
            <CheckIcon />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="pw-pricing-card-foot">
        {valueStatement ? (
          <p className="pw-pricing-value">{valueStatement}</p>
        ) : null}
        <Link
          href={cta.href}
          className={`pw-btn w-full justify-center ${
            cta.variant === "secondary" ? "pw-btn-secondary" : ""
          } ${tone === "carrier" && cta.variant === "secondary" ? "pw-pricing-btn-carrier" : ""}`}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {cta.label}
        </Link>
        {note ? <p className="pw-pricing-note">{note}</p> : null}
      </div>
    </article>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      className="pw-pricing-check"
    >
      <path
        d="M3.2 8.2 6.4 11.4 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
