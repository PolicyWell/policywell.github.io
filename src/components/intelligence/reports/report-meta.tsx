import type { ReactNode } from "react";
import type { DataProvenance, SignalStatus } from "@/lib/intelligence/report-book";

export const STATUS_LABELS: Record<SignalStatus, string> = {
  healthy: "Healthy",
  monitor: "Monitor",
  attention: "Attention",
  critical: "Critical",
  unknown: "Unknown",
  na: "N/A",
};

export function ProvenanceTag({ provenance }: { provenance: DataProvenance }) {
  return (
    <span
      className={`pw-report-tag pw-report-tag-${provenance}`}
      title={
        provenance === "live"
          ? "From the current workspace / ingest"
          : "Simulated book-of-business demo data"
      }
    >
      {provenance === "live" ? "Live" : "Simulated"}
    </span>
  );
}

export function StatusPill({ status }: { status: SignalStatus }) {
  return (
    <span className={`pw-report-pill pw-report-pill-${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ReportHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <header className="pw-report-header">
      <p className="pw-report-eyebrow">Reports</p>
      <div className="pw-report-title-row">
        {icon ? <span className="pw-report-icon" aria-hidden="true">{icon}</span> : null}
        <h3 className="pw-report-title">{title}</h3>
      </div>
      {subtitle ? <p className="pw-report-subtitle">{subtitle}</p> : null}
    </header>
  );
}

export function MatrixIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="11" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="11" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="11" y="11" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
