"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export function MeetOpeWidget() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent | TouchEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`pw-ope${open ? " is-open" : ""}`}
      data-ope-widget
    >
      {open && (
        <div
          id={panelId}
          className="pw-ope-panel"
          role="dialog"
          aria-label="Meet Ope"
        >
          <div className="pw-ope-panel-head">
            <img
              src="/ope-mascot.png"
              alt=""
              width={56}
              height={56}
              className="pw-ope-panel-avatar"
              decoding="async"
            />
            <div className="min-w-0">
              <p className="pw-ope-kicker">Meet Ope</p>
              <h2 className="pw-ope-title">Your PolicyWell guide</h2>
            </div>
            <button
              type="button"
              className="pw-ope-close"
              aria-label="Close Meet Ope"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <p className="pw-ope-copy">
            Ope helps you explore policy intelligence, ask grounded questions,
            and get to human-reviewed next steps - without the jargon.
          </p>
          <div className="pw-ope-actions">
            <Link
              href="/agent"
              className="pw-btn !py-2.5 !px-4 text-sm w-full justify-center"
              onClick={() => setOpen(false)}
            >
              Chat with Ope
            </Link>
            <Link
              href="/demo"
              className="pw-btn pw-btn-secondary !py-2.5 !px-4 text-sm w-full justify-center"
              onClick={() => setOpen(false)}
            >
              See the product
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        className="pw-ope-fab"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close Meet Ope" : "Meet Ope"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pw-ope-fab-ring" aria-hidden />
        <img
          src="/ope-mascot.png"
          alt=""
          width={64}
          height={64}
          className="pw-ope-fab-img"
          decoding="async"
        />
        <span className="pw-ope-fab-label">Meet Ope</span>
      </button>
    </div>
  );
}
