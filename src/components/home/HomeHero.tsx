"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LiveAnalysisCounter } from "@/components/LiveAnalysisCounter";

const HERO_SCENES = [
  {
    src: "/industries/heroes/flooring-contractor-insurance-hero.webp",
    label: "Commercial construction",
  },
  {
    src: "/industries/heroes/technology-hero.webp",
    label: "Technology",
  },
  {
    src: "/industries/heroes/restaurant-group-insurance-hero.webp",
    label: "Restaurants",
  },
  {
    src: "/industries/heroes/semi-truck-insurance-hero.webp",
    label: "Trucking",
  },
  {
    src: "/industries/heroes/commercial-property-management-insurance-hero.webp",
    label: "Property",
  },
] as const;

const PROOF_STRIP = [
  "Agencies",
  "Carriers",
  "IMOs",
  "Advisors",
  "Policyholders",
  "Commercial books",
  "HOA & property",
  "Life & annuity",
] as const;

export function HomeHero() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setScene((i) => (i + 1) % HERO_SCENES.length);
    }, 5600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="pw-wc-hero" aria-label="PolicyWell hero">
      <div className="pw-wc-hero-media" aria-hidden>
        {HERO_SCENES.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt=""
            className={`pw-wc-hero-img${i === scene ? " is-active" : ""}`}
            decoding="async"
            fetchPriority={i === 0 ? "high" : "low"}
          />
        ))}
        <div className="pw-wc-hero-shade" />
      </div>

      <div className="pw-wc-hero-inner">
        <LiveAnalysisCounter className="pw-wc-hero-live animate-rise" />
        <p className="pw-wc-hero-brand animate-rise">PolicyWell</p>
        <h1 className="pw-wc-hero-title animate-rise">
          You underwrite the future.
          <br />
          We make it intelligent.
        </h1>
        <p className="pw-wc-hero-lede animate-rise-delay">
          PolicyWell is the agentic operating system for the insurance
          industry — coverage analysis, book intelligence, and AI agents in
          one platform.
        </p>
        <div className="pw-wc-hero-cta animate-rise-delay-2">
          <Link href="/book-a-call/" className="pw-wc-btn-light">
            Talk to our team
          </Link>
        </div>
      </div>

      <div className="pw-wc-proof" aria-label="Who PolicyWell serves">
        <div className="pw-wc-proof-track">
          {[...PROOF_STRIP, ...PROOF_STRIP].map((label, i) => (
            <span key={`${label}-${i}`} className="pw-wc-proof-item">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
