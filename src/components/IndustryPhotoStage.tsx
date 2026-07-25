"use client";

import { useEffect, useId, useRef } from "react";

type MotionKind =
  | "shelf"
  | "pour"
  | "pills"
  | "float"
  | "rack"
  | "pallet"
  | "shop";

const MOTION_BY_SLUG: Record<string, MotionKind> = {
  "beauty-and-cosmetics": "shelf",
  "clothing-store": "rack",
  cpg: "pallet",
  "food-and-beverage": "shop",
  "pet-business": "float",
  supplement: "pills",
  "alcoholic-beverage": "pour",
};

type IndustryPhotoStageProps = {
  slug: string;
  label: string;
  className?: string;
};

export function IndustryPhotoStage({
  slug,
  label,
  className = "",
}: IndustryPhotoStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const motion = MOTION_BY_SLUG[slug] ?? "float";
  const src = `/industries/ecommerce/${slug}.webp`;

  useEffect(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ty = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      const rotY = cx * 8;
      const rotX = -cy * 6;
      media.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${cx * 10}px, ${cy * 8}px, 0)`;
      raf = window.requestAnimationFrame(tick);
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`pw-photo-stage pw-photo-stage-${motion} ${className}`.trim()}
      role="img"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="sr-only">
        Interactive {label} scene — move to tilt; products animate in place
      </span>

      <div ref={mediaRef} className="pw-photo-stage-media">
        <div className="pw-photo-stage-bob">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="pw-photo-stage-img"
            draggable={false}
          />

          <div className="pw-photo-stage-fx" aria-hidden>
            {motion === "pills" && (
              <>
                <span className="pw-fx-pill pw-fx-pill-a" />
                <span className="pw-fx-pill pw-fx-pill-b" />
                <span className="pw-fx-pill pw-fx-pill-c" />
                <span className="pw-fx-pill pw-fx-pill-d" />
                <span className="pw-fx-scoop" />
              </>
            )}
            {motion === "pour" && (
              <>
                <span className="pw-fx-pour" />
                <span className="pw-fx-drip pw-fx-drip-a" />
                <span className="pw-fx-drip pw-fx-drip-b" />
              </>
            )}
            {motion === "shelf" && (
              <>
                <span className="pw-fx-spark pw-fx-spark-a" />
                <span className="pw-fx-spark pw-fx-spark-b" />
                <span className="pw-fx-spark pw-fx-spark-c" />
              </>
            )}
            {motion === "shop" && (
              <>
                <span className="pw-fx-jar pw-fx-jar-a" />
                <span className="pw-fx-jar pw-fx-jar-b" />
              </>
            )}
            {motion === "rack" && <span className="pw-fx-sway" />}
            {motion === "pallet" && <span className="pw-fx-roll" />}
            {motion === "float" && (
              <>
                <span className="pw-fx-treat pw-fx-treat-a" />
                <span className="pw-fx-treat pw-fx-treat-b" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
