"use client";

import { useMemo, useState } from "react";
import type { EcommerceVertical } from "@/lib/industries-nav";

type EcommerceStorefrontDemoProps = {
  vertical: EcommerceVertical;
};

export function EcommerceStorefrontDemo({
  vertical,
}: EcommerceStorefrontDemoProps) {
  const [colorIdx, setColorIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(
    Math.min(1, vertical.sizes.length - 1),
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const swatch = vertical.colors[colorIdx] ?? vertical.accent;
  const brand = useMemo(
    () => vertical.label.split(" ")[0]?.toUpperCase() ?? "SHOP",
    [vertical.label],
  );

  return (
    <div className="pw-ecom-demo" style={{ ["--ecom-accent" as string]: swatch }}>
      <header className="pw-ecom-demo-nav">
        <span className="pw-ecom-demo-brand">{brand}</span>
        <nav aria-label="Demo store navigation">
          <span>Shop</span>
          <span>Collections</span>
          <span>About</span>
        </nav>
        <span className="pw-ecom-demo-cart">Cart ({added ? qty : 0})</span>
      </header>

      <div className="pw-ecom-demo-body">
        <div className="pw-ecom-demo-gallery">
          <div
            className="pw-ecom-demo-hero-art"
            style={{
              background: `linear-gradient(165deg, ${swatch}33 0%, #f7f4ef 45%, ${swatch}22 100%)`,
            }}
          >
            <div
              className="pw-ecom-demo-product-block"
              style={{ background: swatch }}
            />
            <p className="pw-ecom-demo-product-caption">{vertical.productName}</p>
          </div>
          <div className="pw-ecom-demo-thumbs" aria-hidden>
            {vertical.colors.slice(0, 4).map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="pw-ecom-demo-details">
          <p className="pw-ecom-demo-rating">★★★★★ · 182 reviews</p>
          <h2>{vertical.productName}</h2>
          <p className="pw-ecom-demo-price">{vertical.price}</p>
          <p className="pw-ecom-demo-copy">
            Crafted for {vertical.label.toLowerCase()} brands — premium
            detailing designed to convert on every channel.
          </p>

          <div className="pw-ecom-demo-field">
            <span>Color</span>
            <div className="pw-ecom-demo-swatches">
              {vertical.colors.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${i + 1}`}
                  className={i === colorIdx ? "is-active" : undefined}
                  style={{ background: c }}
                  onClick={() => setColorIdx(i)}
                />
              ))}
            </div>
          </div>

          <div className="pw-ecom-demo-field">
            <span>Size</span>
            <div className="pw-ecom-demo-sizes">
              {vertical.sizes.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className={i === sizeIdx ? "is-active" : undefined}
                  onClick={() => setSizeIdx(i)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pw-ecom-demo-field pw-ecom-demo-qty">
            <span>Quantity</span>
            <div className="pw-ecom-demo-stepper">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(9, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            className="pw-ecom-demo-cta"
            onClick={() => setAdded(true)}
          >
            {added ? "Added to cart" : "Add to Cart"}
          </button>
          <button type="button" className="pw-ecom-demo-buy">
            Buy Now
          </button>

          <ul className="pw-ecom-demo-perks">
            <li>Free shipping on orders over $100</li>
            <li>Free returns within 30 days</li>
            <li>2-year warranty included</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
