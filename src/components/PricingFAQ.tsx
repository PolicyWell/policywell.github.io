"use client";

import { useId, useState } from "react";
import { PRICING } from "@/lib/pricing-data";

export function PricingFAQ() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="pw-pricing-faq">
      {PRICING.faqs.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={item.q} className={`pw-pricing-faq-item${open ? " is-open" : ""}`}>
            <h3>
              <button
                type="button"
                id={buttonId}
                className="pw-pricing-faq-trigger"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                <span>{item.q}</span>
                <span className="pw-pricing-faq-icon" aria-hidden="true">
                  {open ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="pw-pricing-faq-panel"
            >
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
