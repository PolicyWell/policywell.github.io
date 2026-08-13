"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LiveAnalysisCounter } from "@/components/LiveAnalysisCounter";

const HERO_VIDEO = "/hero/policywell-city-loop.mp4";
const HERO_POSTER = "/hero/policywell-city-loop.jpg";

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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      el.pause();
      el.removeAttribute("autoplay");
      return;
    }

    // Autoplay can be blocked until muted play() is requested again after mount.
    const play = () => {
      void el.play().catch(() => {
        /* keep poster visible */
      });
    };
    play();
    const onVis = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <section className="pw-wc-hero" aria-label="PolicyWell hero">
      <div className="pw-wc-hero-media" aria-hidden>
        {/*
          Looping MP4 used as a gif-like full-bleed hero (much smaller/sharper
          than an animated GIF at this resolution). Poster covers first paint.
        */}
        <video
          ref={videoRef}
          className="pw-wc-hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HERO_POSTER}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
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
