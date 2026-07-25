"use client";

import { useEffect, useId, useRef } from "react";

type MotionKind =
  | "shelf"
  | "pour"
  | "pills"
  | "float"
  | "rack"
  | "pallet"
  | "shop"
  | "computer"
  | "box-truck"
  | "dump-truck"
  | "tow-truck"
  | "flooring"
  | "general-contractor"
  | "handyman"
  | "landscaping"
  | "painter"
  | "roofing"
  | "commercial-property"
  | "multifamily-property"
  | "residential-property"
  | "short-term-rental"
  | "fine-dining"
  | "restaurant-group"
  | "small-grocery"
  | "supercenter"
  | "supermarket"
  | "auto-dealer"
  | "auto-repair"
  | "body-shop"
  | "mechanic"
  | "used-car-dealer"
  | "cybersecurity"
  | "fintech"
  | "bar"
  | "crypto";

const MOTION_BY_SLUG: Record<string, MotionKind> = {
  ecommerce: "computer",
  "beauty-and-cosmetics": "shelf",
  "clothing-store": "rack",
  cpg: "pallet",
  "food-and-beverage": "shop",
  "pet-business": "float",
  supplement: "pills",
  "alcoholic-beverage": "pour",
  "box-truck": "box-truck",
  "dump-truck": "dump-truck",
  "tow-truck": "tow-truck",
  "flooring-contractor": "flooring",
  "general-contractor": "general-contractor",
  handyman: "handyman",
  landscaping: "landscaping",
  painter: "painter",
  roofing: "roofing",
  "commercial-property-management": "commercial-property",
  "multifamily-property-management": "multifamily-property",
  "residential-property-management": "residential-property",
  "short-term-rental-management": "short-term-rental",
  "fine-dining-restaurant": "fine-dining",
  "restaurant-group": "restaurant-group",
  "small-grocery-store": "small-grocery",
  supercenter: "supercenter",
  supermarket: "supermarket",
  "auto-dealer": "auto-dealer",
  "auto-repair": "auto-repair",
  "body-shop": "body-shop",
  mechanic: "mechanic",
  "used-car-dealer": "used-car-dealer",
  "cybersecurity-company": "cybersecurity",
  fintech: "fintech",
  bar: "bar",
  "crypto-company": "crypto",
};

type IndustryPhotoStageProps = {
  slug: string;
  label: string;
  /** Optional explicit image URL. Defaults to legacy ecommerce asset path. */
  src?: string;
  className?: string;
};

export function IndustryPhotoStage({
  slug,
  label,
  src,
  className = "",
}: IndustryPhotoStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const motion = MOTION_BY_SLUG[slug] ?? "float";
  const imageSrc = src ?? `/industries/ecommerce/${slug}.webp`;

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
      const rotY = cx * 4;
      const rotX = -cy * 3;
      media.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${cx * 4}px, ${cy * 3}px, 0)`;
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
            src={imageSrc}
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
            {motion === "computer" && (
              <>
                <span className="pw-fx-screen" />
                <span className="pw-fx-cart" />
                <span className="pw-fx-package" />
                <span className="pw-fx-cursor" />
              </>
            )}
            {motion === "box-truck" && (
              <>
                <span className="pw-fx-wheel pw-fx-wheel-a" />
                <span className="pw-fx-wheel pw-fx-wheel-b" />
                <span className="pw-fx-road-dash" />
              </>
            )}
            {motion === "dump-truck" && (
              <>
                <span className="pw-fx-dump-bed" />
                <span className="pw-fx-wheel pw-fx-wheel-a" />
                <span className="pw-fx-wheel pw-fx-wheel-b" />
              </>
            )}
            {motion === "tow-truck" && (
              <>
                <span className="pw-fx-tow-boom" />
                <span className="pw-fx-tow-hook" />
                <span className="pw-fx-wheel pw-fx-wheel-a" />
              </>
            )}
            {motion === "flooring" && (
              <>
                <span className="pw-fx-plank pw-fx-plank-a" />
                <span className="pw-fx-plank pw-fx-plank-b" />
              </>
            )}
            {motion === "general-contractor" && (
              <>
                <span className="pw-fx-hardhat" />
                <span className="pw-fx-blueprint" />
              </>
            )}
            {motion === "handyman" && (
              <>
                <span className="pw-fx-wrench" />
                <span className="pw-fx-tool-bob" />
              </>
            )}
            {motion === "landscaping" && (
              <>
                <span className="pw-fx-leaf pw-fx-leaf-a" />
                <span className="pw-fx-leaf pw-fx-leaf-b" />
                <span className="pw-fx-leaf pw-fx-leaf-c" />
              </>
            )}
            {motion === "painter" && (
              <>
                <span className="pw-fx-roller" />
                <span className="pw-fx-paint-drip" />
              </>
            )}
            {motion === "roofing" && (
              <>
                <span className="pw-fx-shingle" />
                <span className="pw-fx-ladder-rung" />
              </>
            )}
            {motion === "commercial-property" && (
              <>
                <span className="pw-fx-window-glow pw-fx-window-glow-a" />
                <span className="pw-fx-window-glow pw-fx-window-glow-b" />
                <span className="pw-fx-window-glow pw-fx-window-glow-c" />
              </>
            )}
            {motion === "multifamily-property" && (
              <>
                <span className="pw-fx-balcony-light pw-fx-balcony-light-a" />
                <span className="pw-fx-balcony-light pw-fx-balcony-light-b" />
                <span className="pw-fx-balcony-light pw-fx-balcony-light-c" />
              </>
            )}
            {motion === "residential-property" && (
              <>
                <span className="pw-fx-key-ring" />
                <span className="pw-fx-porch-glow" />
              </>
            )}
            {motion === "short-term-rental" && (
              <>
                <span className="pw-fx-suitcase-roll" />
                <span className="pw-fx-key-tag" />
              </>
            )}
            {motion === "fine-dining" && (
              <>
                <span className="pw-fx-candle-flame" />
                <span className="pw-fx-wine-shimmer" />
                <span className="pw-fx-plate-steam" />
              </>
            )}
            {motion === "restaurant-group" && (
              <>
                <span className="pw-fx-storefront-glow pw-fx-storefront-glow-a" />
                <span className="pw-fx-storefront-glow pw-fx-storefront-glow-b" />
                <span className="pw-fx-storefront-glow pw-fx-storefront-glow-c" />
                <span className="pw-fx-umbrella-sway" />
              </>
            )}
            {motion === "small-grocery" && (
              <>
                <span className="pw-fx-produce pw-fx-produce-a" />
                <span className="pw-fx-produce pw-fx-produce-b" />
                <span className="pw-fx-basket-bob" />
              </>
            )}
            {motion === "supercenter" && (
              <>
                <span className="pw-fx-cart-roll pw-fx-cart-roll-a" />
                <span className="pw-fx-cart-roll pw-fx-cart-roll-b" />
                <span className="pw-fx-entrance-glow" />
              </>
            )}
            {motion === "supermarket" && (
              <>
                <span className="pw-fx-aisle-glow pw-fx-aisle-glow-a" />
                <span className="pw-fx-aisle-glow pw-fx-aisle-glow-b" />
                <span className="pw-fx-cart-line" />
              </>
            )}
            {motion === "auto-dealer" && (
              <>
                <span className="pw-fx-showroom-glow" />
                <span className="pw-fx-lot-shine pw-fx-lot-shine-a" />
                <span className="pw-fx-lot-shine pw-fx-lot-shine-b" />
              </>
            )}
            {motion === "auto-repair" && (
              <>
                <span className="pw-fx-lift-rise" />
                <span className="pw-fx-tool-spin" />
              </>
            )}
            {motion === "body-shop" && (
              <>
                <span className="pw-fx-spray-mist" />
                <span className="pw-fx-paint-swatch" />
              </>
            )}
            {motion === "mechanic" && (
              <>
                <span className="pw-fx-wrench-turn" />
                <span className="pw-fx-diag-blink" />
              </>
            )}
            {motion === "used-car-dealer" && (
              <>
                <span className="pw-fx-string-light pw-fx-string-light-a" />
                <span className="pw-fx-string-light pw-fx-string-light-b" />
                <span className="pw-fx-string-light pw-fx-string-light-c" />
              </>
            )}
            {motion === "cybersecurity" && (
              <>
                <span className="pw-fx-shield-pulse" />
                <span className="pw-fx-net-node pw-fx-net-node-a" />
                <span className="pw-fx-net-node pw-fx-net-node-b" />
                <span className="pw-fx-net-node pw-fx-net-node-c" />
              </>
            )}
            {motion === "fintech" && (
              <>
                <span className="pw-fx-card-slide" />
                <span className="pw-fx-chart-rise" />
                <span className="pw-fx-coin-spin" />
              </>
            )}
            {motion === "bar" && (
              <>
                <span className="pw-fx-neon-glow" />
                <span className="pw-fx-tap-pour" />
                <span className="pw-fx-glass-clink" />
              </>
            )}
            {motion === "crypto" && (
              <>
                <span className="pw-fx-coin-orbit" />
                <span className="pw-fx-chain-node pw-fx-chain-node-a" />
                <span className="pw-fx-chain-node pw-fx-chain-node-b" />
                <span className="pw-fx-chain-node pw-fx-chain-node-c" />
              </>
            )}
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
