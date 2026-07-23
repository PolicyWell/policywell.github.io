"use client";

import type { BillingPeriod } from "@/lib/pricing-data";
import { PRICING } from "@/lib/pricing-data";

export function PricingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (next: BillingPeriod) => void;
}) {
  return (
    <div className="pw-pricing-toggle-wrap">
      <div
        className="pw-pricing-toggle"
        role="group"
        aria-label="Billing period"
      >
        <button
          type="button"
          className={value === "monthly" ? "is-active" : undefined}
          aria-pressed={value === "monthly"}
          onClick={() => onChange("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={value === "annual" ? "is-active" : undefined}
          aria-pressed={value === "annual"}
          onClick={() => onChange("annual")}
        >
          Annual
        </button>
      </div>
      <p className="pw-pricing-toggle-note">
        <span className="pw-pricing-save">{PRICING.billing.annualSavingsLabel}</span>
        <span aria-hidden="true"> · </span>
        {PRICING.billing.annualNote}
      </p>
    </div>
  );
}
