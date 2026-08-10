"use client";

export type ProposalThumbMeta = {
  id: string;
  index: number;
  label: string;
  preview: "premium" | "cohort" | "standard" | "status";
};

export function ProposalThumbnail({
  meta,
  active,
  onSelect,
}: {
  meta: ProposalThumbMeta;
  active: boolean;
  onSelect: () => void;
}) {
  const n = String(meta.index + 1).padStart(2, "0");
  return (
    <button
      type="button"
      role="tab"
      id={`pw-proposal-tab-${meta.id}`}
      aria-selected={active}
      aria-controls={`pw-proposal-panel-${meta.id}`}
      tabIndex={active ? 0 : -1}
      className={`pw-proposal-thumb${active ? " is-active" : ""}`}
      onClick={onSelect}
    >
      <span
        className={`pw-proposal-thumb-preview is-${meta.preview}`}
        aria-hidden="true"
      />
      <span className="pw-proposal-thumb-overlay">
        <span className="pw-proposal-thumb-num">{n}</span>
        <span className="pw-proposal-thumb-label">{meta.label}</span>
      </span>
    </button>
  );
}
