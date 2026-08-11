export type BobTone =
  | "default"
  | "command"
  | "success"
  | "muted"
  | "warn"
  | "accent"
  | "dim"
  | "money"
  | "danger"
  | "blank";

export type BobSegment = {
  text: string;
  tone?: BobTone;
};

export type BobLine = {
  /** Whole-line tone when segments are omitted. */
  text?: string;
  tone?: BobTone;
  /** Mixed-color segments within one line. */
  segments?: BobSegment[];
  delayMs?: number;
};

export type BobScene = {
  id: string;
  label: string;
  cwd: string;
  lines: BobLine[];
};

function line(text: string, tone: BobTone = "default", delayMs?: number): BobLine {
  return { text, tone, delayMs };
}

function blank(delayMs = 40): BobLine {
  return { text: "", tone: "blank", delayMs };
}

function rich(segments: BobSegment[], delayMs?: number): BobLine {
  return { segments, delayMs };
}

export const BOOK_OF_BUSINESS_SCENES: BobScene[] = [
  {
    id: "ingest",
    label: "ingest",
    cwd: "~/book-of-business",
    lines: [
      line("$ cd ~/book-of-business", "command", 80),
      line("~/book-of-business", "dim"),
      blank(),
      line("$ policywell ingest", "command", 120),
      blank(60),
      line("Ingesting commercial book…", "muted"),
      line("  ▸ HOA packages          scanning", "dim", 70),
      line("  ▸ Trucking fleets       scanning", "dim", 70),
      line("  ▸ Business packages     scanning", "dim", 70),
      blank(),
      line("✓ Documents classified", "success", 90),
      line("✓ Clients resolved", "success", 70),
      line("✓ Policies linked", "success", 70),
      blank(80),
      line("Book funnel", "accent"),
      rich(
        [
          { text: "  ", tone: "default" },
          { text: "2,500", tone: "accent" },
          { text: " documents", tone: "default" },
          { text: "  →  ", tone: "dim" },
          { text: "800", tone: "accent" },
          { text: " clients", tone: "default" },
          { text: "  →  ", tone: "dim" },
          { text: "1,100", tone: "accent" },
          { text: " policies", tone: "default" },
        ],
        110,
      ),
      rich(
        [
          { text: "  ", tone: "default" },
          { text: "180", tone: "warn" },
          { text: " review signals", tone: "default" },
          { text: "  →  ", tone: "dim" },
          { text: "60", tone: "warn" },
          { text: " opportunities", tone: "default" },
          { text: "  →  ", tone: "dim" },
          { text: "12", tone: "money" },
          { text: " actions that matter", tone: "success" },
        ],
        130,
      ),
      blank(),
      line("Vertical mix", "muted"),
      rich([
        { text: "  HOA                  ", tone: "default" },
        { text: "312", tone: "accent" },
        { text: " policies", tone: "dim" },
      ]),
      rich([
        { text: "  Trucking             ", tone: "default" },
        { text: "268", tone: "accent" },
        { text: " policies", tone: "dim" },
      ]),
      rich([
        { text: "  Business packages    ", tone: "default" },
        { text: "520", tone: "accent" },
        { text: " policies", tone: "dim" },
      ]),
      blank(),
      rich([
        { text: "⚠ Lapse / non-renewal pressure  ", tone: "danger" },
        { text: "27 accounts", tone: "danger" },
      ]),
      rich([
        { text: "  Premium at risk               ", tone: "muted" },
        { text: "$4.8M", tone: "money" },
      ]),
      blank(),
      line("✓ Ingest complete — ready for opportunities", "success", 100),
    ],
  },
  {
    id: "opportunities",
    label: "opportunities",
    cwd: "~/book-of-business",
    lines: [
      line("$ policywell opportunities", "command", 100),
      blank(50),
      line("Intelligent insights — prioritized actions", "accent"),
      blank(70),
      line("── 01  HOA ─────────────────────────────────", "muted"),
      rich([
        { text: "  Call  ", tone: "muted" },
        { text: "Oakridge HOA Board", tone: "accent" },
      ]),
      rich([
        { text: "  Why   ", tone: "muted" },
        { text: "D&O + property limit gap before renew", tone: "default" },
      ]),
      rich([
        { text: "  Risk  ", tone: "muted" },
        { text: "Lapse window opens in 18 days", tone: "danger" },
      ]),
      rich([
        { text: "  Do    ", tone: "muted" },
        { text: "Send board brief · schedule renewal call", tone: "success" },
      ]),
      rich([
        { text: "  Econ  ", tone: "muted" },
        { text: "$42,600", tone: "money" },
        { text: " premium  ·  ", tone: "dim" },
        { text: "$6,390", tone: "money" },
        { text: " est. commission", tone: "dim" },
      ]),
      blank(60),
      line("── 02  Trucking ────────────────────────────", "muted"),
      rich([
        { text: "  Call  ", tone: "muted" },
        { text: "Summit Regional Freight", tone: "accent" },
      ]),
      rich([
        { text: "  Why   ", tone: "muted" },
        { text: "Auto liability below lane-standard after fleet add", tone: "default" },
      ]),
      rich([
        { text: "  Risk  ", tone: "muted" },
        { text: "Non-renewal signal on primary auto", tone: "danger" },
      ]),
      rich([
        { text: "  Do    ", tone: "muted" },
        { text: "Quote excess AL · review driver schedule", tone: "success" },
      ]),
      rich([
        { text: "  Econ  ", tone: "muted" },
        { text: "$186,000", tone: "money" },
        { text: " premium  ·  ", tone: "dim" },
        { text: "$22,320", tone: "money" },
        { text: " est. commission", tone: "dim" },
      ]),
      blank(60),
      line("── 03  Business ────────────────────────────", "muted"),
      rich([
        { text: "  Call  ", tone: "muted" },
        { text: "Harbor Fabrication LLC", tone: "accent" },
      ]),
      rich([
        { text: "  Why   ", tone: "muted" },
        { text: "Umbrella short vs. contract requirements", tone: "default" },
      ]),
      rich([
        { text: "  Risk  ", tone: "muted" },
        { text: "Certificate request blocked — coverage gap", tone: "danger" },
      ]),
      rich([
        { text: "  Do    ", tone: "muted" },
        { text: "Propose ", tone: "success" },
        { text: "$5M", tone: "money" },
        { text: " umbrella · attach loss summary", tone: "success" },
      ]),
      rich([
        { text: "  Econ  ", tone: "muted" },
        { text: "$71,400", tone: "money" },
        { text: " premium  ·  ", tone: "dim" },
        { text: "$10,710", tone: "money" },
        { text: " est. commission", tone: "dim" },
      ]),
      blank(),
      line("Today’s book", "accent"),
      rich([
        { text: "  12 actions  ·  ", tone: "default" },
        { text: "$1.20M", tone: "money" },
        { text: " actionable premium  ·  ", tone: "dim" },
        { text: "3 lapses to prevent", tone: "danger" },
      ]),
      blank(),
      line("✓ Opportunity queue ready", "success"),
    ],
  },
];

/** Combined ingest → opportunities session for /pear2 */
export function getPear2CombinedScene(): BobScene {
  const ingest = BOOK_OF_BUSINESS_SCENES.find((s) => s.id === "ingest");
  const opportunities = BOOK_OF_BUSINESS_SCENES.find(
    (s) => s.id === "opportunities",
  );
  if (!ingest || !opportunities) {
    throw new Error("Book of business scenes missing");
  }
  return {
    id: "pear2",
    label: "pear2",
    cwd: "~/book-of-business",
    lines: [
      ...ingest.lines,
      blank(100),
      line("── pear2 · unified intelligence ────────────", "accent", 90),
      blank(60),
      ...opportunities.lines,
    ],
  };
}
