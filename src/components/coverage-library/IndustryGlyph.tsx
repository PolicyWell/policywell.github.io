import type { IndustryMeta } from "@/lib/coverage-library/industry-meta";

const PATHS: Record<IndustryMeta["glyph"], string> = {
  leaf: "M12 3c-2 4-6 6-8 10 4 1 7-1 9-4 2 3 5 5 9 4-2-4-6-6-8-10z M12 7v10",
  hardhat:
    "M4 14h16v2H4zm2-2a6 6 0 0 1 12 0H6zm4-6h4v3h-4z",
  school: "M3 10l9-5 9 5-9 5-9-5zm2 3v4l7 3 7-3v-4",
  bank: "M3 10l9-6 9 6H3zm1 2h16v7H4zm-1 7h18",
  cup: "M6 8h10v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8zm10 1h2a2 2 0 0 1 0 4h-2",
  civic: "M5 20V9l7-4 7 4v11H5zm3-2h3v-4H8v4zm5 0h3v-4h-3v4z",
  home: "M4 11l8-6 8 6v9H4v-9zm4 9v-5h8v5",
  heart:
    "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z",
  hotel: "M4 20V7h16v13H4zm3-3h3v-4H7v4zm7 0h3v-4h-3v4zM8 7V5h8v2",
  factory: "M3 20V9l5 3V9l5 3V8l5 3v9H3z",
  briefcase: "M8 7V5h8v2h4v12H4V7h4zm0 0h8",
  cart: "M3 5h2l2 12h12l2-8H7m0 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  truck: "M2 15V8h11v7H2zm11 0h4l3 3v-3h1v5H3v-2m2 2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  chip: "M8 4h8v2h2v12h-2v2H8v-2H6V6h2V4zm2 4v8h4V8h-4z",
  wrench:
    "M14.5 4.5a4 4 0 0 0-5.6 5.6L4 15l3 3 4.9-4.9a4 4 0 0 0 2.6-8.6z",
  generic: "M6 6h12v12H6z",
};

export function IndustryGlyph({
  glyph,
  className,
}: {
  glyph: IndustryMeta["glyph"];
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[glyph]} />
    </svg>
  );
}
