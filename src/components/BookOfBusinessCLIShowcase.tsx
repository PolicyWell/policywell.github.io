"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { BOOK_OF_BUSINESS_SCENES } from "@/lib/book-of-business-cli";
import { BobSceneTerminal } from "./BobSceneTerminal";

export function BookOfBusinessCLIShowcase({
  className = "",
}: {
  className?: string;
}) {
  const tablistId = useId();
  const [sceneId, setSceneId] = useState(BOOK_OF_BUSINESS_SCENES[0]!.id);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const scene =
    BOOK_OF_BUSINESS_SCENES.find((s) => s.id === sceneId) ??
    BOOK_OF_BUSINESS_SCENES[0]!;

  return (
    <div className={`pw-bob-showcase ${className}`.trim()}>
      <div className="pw-bob-meta">
        <h2 id="pw-bob-heading" className="pw-bob-heading">
          Intelligent Insights
        </h2>
        <p className="pw-bob-pear2-link">
          <Link href="/pear2/">
            policywell.ai/pear2
            <span aria-hidden> →</span>
          </Link>
          <span className="pw-bob-pear2-note">
            Ingest + opportunities in one interface
          </span>
        </p>
      </div>

      <div
        className="pw-bob-tabs"
        role="tablist"
        aria-label="Intelligent Insights CLI demos"
        id={tablistId}
      >
        {BOOK_OF_BUSINESS_SCENES.map((item) => {
          const selected = item.id === scene.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={selected ? "pw-bob-tab is-active" : "pw-bob-tab"}
              onClick={() => setSceneId(item.id)}
            >
              <span className="pw-bob-tab-cmd">$</span>
              policywell {item.label}
            </button>
          );
        })}
      </div>

      <BobSceneTerminal
        key={scene.id}
        scene={scene}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
