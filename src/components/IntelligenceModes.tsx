import Link from "next/link";

const MODES = [
  { href: "/workspace", label: "Household Intelligence", id: "household" },
  { href: "/commercial", label: "Commercial Risk", id: "commercial" },
  { href: "/agent", label: "Underwriting", id: "underwriting" },
  { href: "/imo", label: "Distribution Intelligence", id: "distribution" },
  { href: "/carrier", label: "Carrier Intelligence", id: "carrier" },
] as const;

export type IntelligenceModeId = (typeof MODES)[number]["id"];

/** Shared role-aware workspace mode strip - one product, multiple lenses. */
export function IntelligenceModes({
  active,
}: {
  active: IntelligenceModeId;
}) {
  return (
    <nav
      className="flex flex-wrap gap-2 text-xs"
      aria-label="Intelligence workspace modes"
    >
      {MODES.map((mode) => {
        const isActive = mode.id === active;
        return (
          <Link
            key={mode.id}
            href={mode.href}
            className={
              isActive
                ? "rounded-full border border-pine/30 bg-pine/10 px-3 py-1.5 text-pine font-medium"
                : "rounded-full border border-pine/10 bg-white/50 px-3 py-1.5 text-stone hover:border-pine/25 hover:text-ink"
            }
            aria-current={isActive ? "page" : undefined}
          >
            {mode.label}
          </Link>
        );
      })}
    </nav>
  );
}
