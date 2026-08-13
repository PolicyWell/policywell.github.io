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

    // Required for reliable autoplay (React's `muted` prop alone is flaky).
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.loop = true;
    el.controls = false;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      el.pause();
      el.removeAttribute("autoplay");
      return;
    }

    const play = () => {
      el.muted = true;
      void el.play().catch(() => {
        /* poster stays until autoplay is allowed */
      });
    };

    play();
    el.addEventListener("loadeddata", play);
    el.addEventListener("canplay", play);
    const onVis = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      el.removeEventListener("loadeddata", play);
      el.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", onVis);
    };
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
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          poster={HERO_POSTER}
          aria-hidden
          tabIndex={-1}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="pw-wc-hero-shade" />
      </div>

      <div className="pw-wc-hero-inner">
        <LiveAnalysisCounter className="pw-wc-hero-live animate-rise" />
        <p className="pw-wc-hero-brand animate-rise">PolicyWell</p>
        <h1 className="pw-wc-hero-title animate-rise">
          Your Coverage Data, Made Intelligent.
          <br />
          Analyze, Optimized &amp; Protected
        </h1>
        <p className="pw-wc-hero-lede animate-rise-delay">
          Turn complex insurance data into clear coverage insights, portfolio
          intelligence, and automated workflows—from individual policies to
          entire books of business.
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
