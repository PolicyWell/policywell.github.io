"use client";

import type { ReactNode } from "react";

export function ReportSlide({
  active,
  labelledBy,
  children,
}: {
  active: boolean;
  labelledBy: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`pw-report-slide${active ? " is-active" : ""}`}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-hidden={!active}
      inert={!active ? true : undefined}
    >
      <div className="pw-report-canvas">{children}</div>
    </div>
  );
}
