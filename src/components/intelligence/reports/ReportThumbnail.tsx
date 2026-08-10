"use client";

export type ReportThumbMeta = {
  id: string;
  index: number;
  label: string;
  preview: "matrix" | "gaps" | "book" | "funding" | "risk" | "ops";
};

export function ReportThumbnail({
  meta,
  active,
  onSelect,
}: {
  meta: ReportThumbMeta;
  active: boolean;
  onSelect: () => void;
}) {
  const n = String(meta.index + 1).padStart(2, "0");
  return (
    <button
      type="button"
      role="tab"
      id={`pw-report-tab-${meta.id}`}
      aria-selected={active}
      aria-controls={`pw-report-panel-${meta.id}`}
      tabIndex={active ? 0 : -1}
      className={`pw-report-thumb${active ? " is-active" : ""}`}
      onClick={onSelect}
    >
      <span className={`pw-report-thumb-preview is-${meta.preview}`} aria-hidden="true" />
      <span className="pw-report-thumb-overlay">
        <span className="pw-report-thumb-num">{n}</span>
        <span className="pw-report-thumb-label">{meta.label}</span>
      </span>
    </button>
  );
}
