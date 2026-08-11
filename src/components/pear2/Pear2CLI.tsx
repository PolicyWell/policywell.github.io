"use client";

import { useEffect, useMemo, useState } from "react";
import { BobSceneTerminal } from "@/components/BobSceneTerminal";
import { getPear2CombinedScene } from "@/lib/book-of-business-cli";

/**
 * Culmination of homepage Intelligent Insights CLIs:
 * `policywell ingest` + `policywell opportunities` in one interface.
 */
export function Pear2CLI() {
  const scene = useMemo(() => getPear2CombinedScene(), []);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="pw-pear2">
      <div className="pw-pear2-hero">
        <p className="pw-bob-eyebrow">Pear 2</p>
        <h1 className="pw-bob-heading">Intelligent Insights</h1>
        <p className="pw-pear2-sub">
          <code>policywell ingest</code> and{" "}
          <code>policywell opportunities</code> — one interface.
        </p>
      </div>
      <BobSceneTerminal
        scene={scene}
        reducedMotion={reducedMotion}
        chromeTitle="policywell · pear2 · ~/book-of-business"
      />
    </div>
  );
}
