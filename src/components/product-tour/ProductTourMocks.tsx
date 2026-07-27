"use client";

import {
  useEffect,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";

const SAMPLE_POLICY = {
  id: "pw-sample-policy",
  name: "Alex Rivera · IUL in-force.pdf",
  meta: "Mutual of Omaha · $1.25M face · 42 pages",
  insured: "Alex Rivera",
  product: "Indexed Universal Life",
  carrier: "Mutual of Omaha",
  policyNo: "IUL-2048-9183",
  face: "$1,250,000",
  premium: "$412 / mo",
  issueDate: "Mar 14, 2022",
  pages: 42,
};

type CarrierType = "Life" | "P&C" | "Specialty";

const CARRIER_TYPES: CarrierType[] = ["Life", "P&C", "Specialty"];

const MARKET_CARRIERS = [
  { id: "mutual", carrier: "Mutual of Omaha", type: "Life" as const, premium: 4944, match: 96, best: true },
  { id: "pacific", carrier: "Pacific Life", type: "Life" as const, premium: 5120, match: 91 },
  { id: "nationwide-life", carrier: "Nationwide Life", type: "Life" as const, premium: 5280, match: 88 },
  { id: "lincoln", carrier: "Lincoln Financial", type: "Life" as const, premium: 5410, match: 85 },
  { id: "prudential", carrier: "Prudential", type: "Life" as const, premium: 5560, match: 82 },
  { id: "john-hancock", carrier: "John Hancock", type: "Life" as const, premium: 5690, match: 79 },
  { id: "hartford", carrier: "Hartford Financial", type: "P&C" as const, premium: 4200, match: 94 },
  { id: "travelers", carrier: "Travelers Group", type: "P&C" as const, premium: 4850, match: 87 },
  { id: "chubb", carrier: "Chubb Limited", type: "P&C" as const, premium: 5100, match: 82 },
  { id: "liberty", carrier: "Liberty Mutual", type: "P&C" as const, premium: 5400, match: 76 },
  { id: "nationwide", carrier: "Nationwide", type: "P&C" as const, premium: 5650, match: 73 },
  { id: "cna", carrier: "CNA Financial", type: "P&C" as const, premium: 5900, match: 70 },
  { id: "zurich", carrier: "Zurich Insurance", type: "P&C" as const, premium: 6100, match: 68 },
  { id: "progressive", carrier: "Progressive Commercial", type: "P&C" as const, premium: 6500, match: 63 },
  { id: "aig", carrier: "AIG Commercial", type: "P&C" as const, premium: 6720, match: 61 },
  { id: "cincinnati", carrier: "Cincinnati Insurance", type: "P&C" as const, premium: 6980, match: 58 },
  { id: "berkshire", carrier: "Berkshire Hathaway", type: "Specialty" as const, premium: 6350, match: 65 },
  { id: "markel", carrier: "Markel Specialty", type: "Specialty" as const, premium: 7200, match: 55 },
  { id: "hiscox", carrier: "Hiscox", type: "Specialty" as const, premium: 7480, match: 52 },
  { id: "beazley", carrier: "Beazley", type: "Specialty" as const, premium: 7710, match: 49 },
] as const;

function AppChrome({
  url,
  children,
  nav = "risk",
  onNavigate,
}: {
  url: string;
  children: ReactNode;
  nav?: "overview" | "risk" | "market" | "claims" | "docs";
  onNavigate?: (section: "risk" | "market" | "claims") => void;
}) {
  const items = [
    { id: "overview", label: "Overview", jump: null },
    { id: "risk", label: "Risk", jump: "risk" as const },
    { id: "market", label: "Market", jump: "market" as const },
    { id: "claims", label: "Claims", jump: "claims" as const },
    { id: "docs", label: "Docs", jump: null },
  ] as const;

  return (
    <div className="pw-pt-window">
      <div className="pw-pt-window-bar">
        <span className="pw-pt-dot" />
        <span className="pw-pt-dot" />
        <span className="pw-pt-dot" />
        <span className="pw-pt-url">{url}</span>
      </div>
      <div className="pw-pt-window-body">
        <aside className="pw-pt-side" aria-label="Web product sections">
          {items.map((item) => {
            const canJump = item.jump != null && onNavigate;
            const active = nav === item.id;
            if (canJump && item.jump) {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`pw-pt-side-item is-nav${
                    active ? " is-active" : ""
                  }`}
                  title={`${item.label} — open section`}
                  aria-label={`Open ${item.label}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onNavigate(item.jump)}
                >
                  <span className={`pw-pt-side-icon is-${item.id}`} />
                </button>
              );
            }
            return (
              <span
                key={item.id}
                className={`pw-pt-side-item${active ? " is-active" : ""}`}
                title={item.label}
                aria-hidden
              >
                <span className={`pw-pt-side-icon is-${item.id}`} />
              </span>
            );
          })}
          <span className="pw-pt-side-avatar">JD</span>
        </aside>
        <div className="pw-pt-main">{children}</div>
      </div>
    </div>
  );
}

function money(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

type WebSectionNav = (section: "risk" | "market" | "claims") => void;

export function RiskAssessmentMock({
  onNavigate,
}: {
  onNavigate?: WebSectionNav;
} = {}) {
  const [selected, setSelected] = useState<
    | "score"
    | "gaps"
    | "policies"
    | "property"
    | "liability"
    | "cyber"
    | "bi"
    | "act-review"
    | "act-gap"
    | "act-coverage"
    | null
  >("score");

  const exposure = [
    { id: "property" as const, label: "Property Damage", level: "High", pct: 82, tone: "high" },
    { id: "liability" as const, label: "Liability Exposure", level: "Medium", pct: 64, tone: "mid" },
    { id: "cyber" as const, label: "Cyber Threat", level: "Low", pct: 45, tone: "low" },
    { id: "bi" as const, label: "Business Interruption", level: "Medium", pct: 71, tone: "mid" },
  ];

  const activity = [
    {
      id: "act-review" as const,
      label: "Policy review completed",
      when: "2h ago",
      detail: "Annual review closed with no funding flags.",
    },
    {
      id: "act-gap" as const,
      label: "New gap identified",
      when: "4h ago",
      detail: "Umbrella limit sits $1M below peer median.",
    },
    {
      id: "act-coverage" as const,
      label: "Coverage updated",
      when: "1d ago",
      detail: "GL endorsement applied for contractor exposure.",
    },
  ];

  const detail =
    selected === "score"
      ? "Overall score blends coverage adequacy, funding health, and peer benchmarks. Click another tile to inspect it."
      : selected === "gaps"
        ? "3 open gaps: umbrella limit, cyber sublimit, and BI waiting period."
        : selected === "policies"
          ? "4 in-force policies: GL, Property, Auto, and Workers' Comp."
          : activity.find((a) => a.id === selected)
            ? `${activity.find((a) => a.id === selected)!.label}: ${activity.find((a) => a.id === selected)!.detail}`
            : exposure.find((e) => e.id === selected)
              ? `${exposure.find((e) => e.id === selected)!.label}: ${exposure.find((e) => e.id === selected)!.level} exposure at ${exposure.find((e) => e.id === selected)!.pct}%.`
              : "Select a tile to inspect.";

  return (
    <AppChrome
      url="app.policywell.ai/risk-assessment"
      nav="risk"
      onNavigate={onNavigate}
    >
      <div className="pw-pt-main-head">
        <div>
          <h3>
            Risk Assessment <span className="pw-pt-live">Live</span>
          </h3>
        </div>
        <p className="pw-pt-muted">Last updated: 2m ago · tiles are clickable</p>
      </div>
      <div className="pw-pt-stat-row">
        <button
          type="button"
          className={`pw-pt-card pw-pt-score-card pw-pt-clickable${
            selected === "score" ? " is-selected" : ""
          }`}
          onClick={() => setSelected("score")}
        >
          <div className="pw-pt-score-ring">72</div>
          <p>Overall Score</p>
        </button>
        <button
          type="button"
          className={`pw-pt-card pw-pt-clickable${
            selected === "gaps" ? " is-selected" : ""
          }`}
          onClick={() => setSelected("gaps")}
        >
          <p className="pw-pt-stat-label">Coverage gaps</p>
          <p className="pw-pt-stat-value is-warn">3</p>
        </button>
        <button
          type="button"
          className={`pw-pt-card pw-pt-clickable${
            selected === "policies" ? " is-selected" : ""
          }`}
          onClick={() => setSelected("policies")}
        >
          <p className="pw-pt-stat-label">Policies</p>
          <p className="pw-pt-stat-value">4</p>
        </button>
      </div>
      <div className="pw-pt-split">
        <div className="pw-pt-card">
          <p className="pw-pt-card-title">Risk exposure by category</p>
          {exposure.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`pw-pt-bar-row pw-pt-clickable-row${
                selected === row.id ? " is-selected" : ""
              }`}
              onClick={() => setSelected(row.id)}
            >
              <div className="pw-pt-bar-meta">
                <span>{row.label}</span>
                <span>
                  {row.level} {row.pct}%
                </span>
              </div>
              <div className="pw-pt-bar-track">
                <span
                  className={`pw-pt-bar-fill tone-${row.tone}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </button>
          ))}
        </div>
        <div className="pw-pt-card">
          <p className="pw-pt-card-title">Recent activity</p>
          <ul className="pw-pt-activity pw-pt-docs-click">
            {activity.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`pw-pt-square-btn${
                    selected === item.id ? " is-selected" : ""
                  }`}
                  onClick={() => setSelected(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.when}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="pw-pt-inspect" role="status">
        {detail}
      </p>
    </AppChrome>
  );
}

export function MarketComparisonMock({
  onNavigate,
}: {
  onNavigate?: WebSectionNav;
} = {}) {
  const [typeOn, setTypeOn] = useState<Set<CarrierType>>(
    () => new Set(CARRIER_TYPES),
  );
  const [selected, setSelected] = useState<Set<string>>(
    () =>
      new Set([
        "mutual",
        "pacific",
        "hartford",
        "travelers",
        "chubb",
        "liberty",
        "nationwide",
        "markel",
      ]),
  );
  const [focused, setFocused] = useState("mutual");

  function toggleType(type: CarrierType) {
    setTypeOn((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) return prev;
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function toggleCarrier(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setFocused(id);
  }

  const visibleCarriers = MARKET_CARRIERS.filter((c) => typeOn.has(c.type));
  const ranked = visibleCarriers
    .filter((c) => selected.has(c.id))
    .sort((a, b) => b.match - a.match);
  const best = ranked[0];
  const focusedRow =
    ranked.find((c) => c.id === focused) ?? best ?? ranked[0];
  const avgMatch =
    ranked.length === 0
      ? 0
      : Math.round(ranked.reduce((s, c) => s + c.match, 0) / ranked.length);

  return (
    <AppChrome
      url="app.policywell.ai/market"
      nav="market"
      onNavigate={onNavigate}
    >
      <div className="pw-pt-main-head">
        <h3>Quotes / Market Comparison</h3>
        <p className="pw-pt-muted">
          Toggle carrier types &amp; carriers · {ranked.length} in compare
        </p>
      </div>

      <div className="pw-pt-type-toggles" role="group" aria-label="Carrier types">
        {CARRIER_TYPES.map((type) => {
          const on = typeOn.has(type);
          const count = MARKET_CARRIERS.filter((c) => c.type === type).length;
          return (
            <button
              key={type}
              type="button"
              className={`pw-pt-type-chip${on ? " is-on" : ""}`}
              aria-pressed={on}
              onClick={() => toggleType(type)}
            >
              <strong>{type}</strong>
              <span>{count} carriers</span>
            </button>
          );
        })}
      </div>

      <div className="pw-pt-carrier-toggles" role="group" aria-label="Carriers">
        {visibleCarriers.map((c) => {
          const on = selected.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className={`pw-pt-carrier-chip${on ? " is-on" : ""}${
                focused === c.id ? " is-focus" : ""
              }`}
              aria-pressed={on}
              onClick={() => toggleCarrier(c.id)}
            >
              <em>{c.type}</em>
              {c.carrier}
            </button>
          );
        })}
      </div>

      <div className="pw-pt-split">
        <div className="pw-pt-card pw-pt-table-wrap">
          <table className="pw-pt-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Carrier</th>
                <th>Type</th>
                <th>Premium</th>
                <th>Match</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row, i) => (
                <tr
                  key={row.id}
                  className={`${row.id === best?.id ? "is-best" : ""} is-row-click${
                    focused === row.id ? " is-focus" : ""
                  }`}
                  onClick={() => toggleCarrier(row.id)}
                >
                  <td>{i + 1}</td>
                  <td>
                    {row.carrier}
                    {row.id === best?.id ? (
                      <span className="pw-pt-best">Best</span>
                    ) : null}
                  </td>
                  <td>
                    <span className="pw-pt-type-tag">{row.type}</span>
                  </td>
                  <td>{money(row.premium)}</td>
                  <td>
                    <div className="pw-pt-match">
                      <span>{row.match}%</span>
                      <span className="pw-pt-bar-track is-inline">
                        <span
                          className="pw-pt-bar-fill tone-low"
                          style={{ width: `${row.match}%` }}
                        />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pw-pt-card pw-pt-summary">
          <p className="pw-pt-card-title">Quote summary</p>
          <dl>
            <div>
              <dt>Carriers compared</dt>
              <dd>
                {ranked.length} of {MARKET_CARRIERS.length}
              </dd>
            </div>
            <div>
              <dt>Types on</dt>
              <dd>{[...typeOn].join(" · ") || "—"}</dd>
            </div>
            <div>
              <dt>Best premium</dt>
              <dd>{best ? `${money(best.premium)} / year` : "—"}</dd>
            </div>
            <div>
              <dt>Focused carrier</dt>
              <dd>
                {focusedRow
                  ? `${focusedRow.carrier} · ${focusedRow.match}%`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Avg match</dt>
              <dd>{ranked.length ? `${avgMatch}%` : "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </AppChrome>
  );
}

export function ClaimsTrackerMock({
  onNavigate,
}: {
  onNavigate?: WebSectionNav;
} = {}) {
  const timeline = [
    {
      id: "submitted",
      title: "Claim submitted",
      detail: "Today · intake complete",
      state: "done" as const,
    },
    {
      id: "assigned",
      title: "Adjuster assigned",
      detail: "Day 1 · Sarah M.",
      state: "done" as const,
    },
    {
      id: "review",
      title: "Documentation review",
      detail: "Pending your upload · Day 2",
      state: "now" as const,
    },
    {
      id: "payout",
      title: "Resolution & payout",
      detail: "Est. $24,500 · Day 3–5",
      state: "pending" as const,
    },
  ];
  const docs = [
    { id: "form", name: "Claim form.pdf" },
    { id: "photos", name: "Photos.zip" },
    { id: "police", name: "Police report.pdf" },
  ];

  const [selected, setSelected] = useState<string>("review");

  const status =
    selected === "hero"
      ? "Claim CW-2026-0847 is in progress with medium priority."
      : timeline.find((t) => t.id === selected)
        ? `${timeline.find((t) => t.id === selected)!.title}: ${timeline.find((t) => t.id === selected)!.detail}`
        : docs.find((d) => d.id === selected)
          ? `${docs.find((d) => d.id === selected)!.name} selected — open or replace in the claim file.`
          : "Select a panel or square to inspect.";

  return (
    <AppChrome
      url="app.policywell.ai/claims"
      nav="claims"
      onNavigate={onNavigate}
    >
      <div className="pw-pt-main-head">
        <h3>Claims / Active Claims</h3>
        <p className="pw-pt-muted">CW-2026-0847 · panels &amp; squares are clickable</p>
      </div>
      <button
        type="button"
        className={`pw-pt-card pw-pt-claims-hero pw-pt-clickable${
          selected === "hero" ? " is-selected" : ""
        }`}
        onClick={() => setSelected("hero")}
      >
        <div>
          <p className="pw-pt-card-title">
            Claims Tracker <span className="pw-pt-pill">In Progress</span>
          </p>
          <p className="pw-pt-muted">Commercial property damage</p>
        </div>
        <div className="pw-pt-meta-row">
          <span>Resolution &lt; 48 hours</span>
          <span>Priority: Medium</span>
          <span>Sarah M. · Adjuster</span>
        </div>
      </button>
      <div className="pw-pt-split">
        <div className="pw-pt-card">
          <p className="pw-pt-card-title">Claim timeline</p>
          <ol className="pw-pt-timeline">
            {timeline.map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  className={`pw-pt-square-btn${
                    step.state === "done" ? " is-done" : ""
                  }${step.state === "now" ? " is-now" : ""}${
                    selected === step.id ? " is-selected" : ""
                  }`}
                  onClick={() => setSelected(step.id)}
                >
                  <strong>{step.title}</strong>
                  <span>{step.detail}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="pw-pt-card">
          <p className="pw-pt-card-title">Documents</p>
          <ul className="pw-pt-docs pw-pt-docs-click">
            {docs.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  className={`pw-pt-square-btn${
                    selected === doc.id ? " is-selected" : ""
                  }`}
                  onClick={() => setSelected(doc.id)}
                >
                  <strong>{doc.name}</strong>
                  <span>Tap to inspect</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="pw-pt-actions">
            <span className="pw-pt-action">Upload Document</span>
            <span className="pw-pt-action is-ghost">Message Adjuster</span>
          </div>
        </div>
      </div>
      <p className="pw-pt-inspect" role="status">
        {status}
      </p>
    </AppChrome>
  );
}

const ADVISOR = {
  firstName: "Jordan",
  fullName: "Jordan Hale",
  license: "GA-482917",
} as const;

type SuitabilityStatus =
  | "Active in force"
  | "Pending"
  | "Undergoing underwriting"
  | "App submitted"
  | "App outstanding"
  | "Medical underwriting ongoing"
  | "Lapsed"
  | "Risk of lapse";

type CrmCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  policy: string;
  status: SuitabilityStatus;
};

const CRM_CUSTOMERS: CrmCustomer[] = [
  {
    id: "alex",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@email.com",
    phone: "(404) 555-0142",
    policy: "IUL · $1.25M · Mutual of Omaha",
    status: "Active in force",
  },
  {
    id: "jordan",
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan.lee@email.com",
    phone: "(678) 555-0198",
    policy: "Term 20 · $500k · Pacific Life",
    status: "Risk of lapse",
  },
  {
    id: "maya",
    firstName: "Maya",
    lastName: "Chen",
    email: "maya@harborfab.com",
    phone: "(312) 555-0177",
    policy: "Commercial umbrella · $1M",
    status: "Pending",
  },
  {
    id: "sam",
    firstName: "Sam",
    lastName: "Okoro",
    email: "sam.okoro@email.com",
    phone: "(470) 555-0166",
    policy: "IUL · $750k · Nationwide",
    status: "Undergoing underwriting",
  },
  {
    id: "riley",
    firstName: "Riley",
    lastName: "Nguyen",
    email: "riley.nguyen@email.com",
    phone: "(615) 555-0133",
    policy: "Whole life · $250k · Guardian",
    status: "App submitted",
  },
  {
    id: "casey",
    firstName: "Casey",
    lastName: "Brooks",
    email: "casey.brooks@email.com",
    phone: "(404) 555-0190",
    policy: "IUL · $1M · Lincoln",
    status: "App outstanding",
  },
  {
    id: "priya",
    firstName: "Priya",
    lastName: "Shah",
    email: "priya.shah@email.com",
    phone: "(770) 555-0181",
    policy: "Term 30 · $1M · Prudential",
    status: "Medical underwriting ongoing",
  },
  {
    id: "devon",
    firstName: "Devon",
    lastName: "Walsh",
    email: "devon.walsh@email.com",
    phone: "(706) 555-0124",
    policy: "IUL · $400k · John Hancock",
    status: "Lapsed",
  },
];

const STATUS_TONE: Record<SuitabilityStatus, string> = {
  "Active in force": "ok",
  Pending: "mid",
  "Undergoing underwriting": "mid",
  "App submitted": "mid",
  "App outstanding": "warn",
  "Medical underwriting ongoing": "mid",
  Lapsed: "bad",
  "Risk of lapse": "warn",
};

function greetingFor(c: CrmCustomer) {
  return `Hello ${c.firstName}, this is ${ADVISOR.fullName}, your advisor (license # ${ADVISOR.license}). I’m checking in on your ${c.policy.split(" · ")[0]} coverage — do you have 10 minutes this week for a quick review?`;
}

function statusSlug(status: SuitabilityStatus) {
  return STATUS_TONE[status];
}

export function CrmMock() {
  type Channel = "email" | "sms";
  type View = "book" | "followup";

  const [view, setView] = useState<View>("book");
  const [statusFilter, setStatusFilter] = useState<"all" | SuitabilityStatus>(
    "all",
  );
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(["jordan", "maya", "devon"]),
  );
  const [activeId, setActiveId] = useState("jordan");
  const [channel, setChannel] = useState<Channel>("email");
  const [draft, setDraft] = useState(() =>
    greetingFor(CRM_CUSTOMERS.find((c) => c.id === "jordan")!),
  );
  const [sentNote, setSentNote] = useState<string | null>(null);

  const filtered = CRM_CUSTOMERS.filter(
    (c) => statusFilter === "all" || c.status === statusFilter,
  );
  const active = CRM_CUSTOMERS.find((c) => c.id === activeId) ?? filtered[0];

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (filtered.every((c) => selected.has(c.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  }

  function openOutreach(c: CrmCustomer) {
    setActiveId(c.id);
    setDraft(greetingFor(c));
    setView("followup");
    setSentNote(null);
  }

  function openMassFollowUp() {
    const targets = CRM_CUSTOMERS.filter((c) => selected.has(c.id));
    if (targets.length === 0) return;
    const first = targets[0];
    setActiveId(first.id);
    setDraft(
      `Hello {first name}, this is ${ADVISOR.fullName}, your advisor (license # ${ADVISOR.license}). I’m following up on your coverage status — reply here or tap my calendar link to book a quick review.`,
    );
    setView("followup");
    setSentNote(null);
  }

  function sendFollowUp() {
    const targets =
      draft.includes("{first name}")
        ? CRM_CUSTOMERS.filter((c) => selected.has(c.id))
        : active
          ? [active]
          : [];
    if (targets.length === 0) return;
    const via = channel === "email" ? "email" : "SMS";
    setSentNote(
      `Sent ${via} follow-up to ${targets.length} contact${
        targets.length === 1 ? "" : "s"
      }: ${targets.map((t) => t.firstName).join(", ")}.`,
    );
  }

  return (
    <div className="pw-pt-crm-shell">
      <div className="pw-pt-crm-tabs" role="tablist" aria-label="CRM views">
        <button
          type="button"
          role="tab"
          className={view === "book" ? "is-on" : ""}
          aria-selected={view === "book"}
          onClick={() => setView("book")}
        >
          Customer book
        </button>
        <button
          type="button"
          role="tab"
          className={view === "followup" ? "is-on" : ""}
          aria-selected={view === "followup"}
          onClick={() => setView("followup")}
        >
          Send / mass follow-up
        </button>
      </div>

      {view === "book" ? (
        <div className="pw-pt-crm-book">
          <div className="pw-pt-crm-toolbar">
            <div>
              <p className="pw-pt-card-title">Customers</p>
              <p className="pw-pt-muted">
                Advisor {ADVISOR.fullName} · license #{ADVISOR.license}
              </p>
            </div>
            <div className="pw-pt-crm-toolbar-actions">
              <label className="pw-pt-crm-filter">
                <span>Suitability</span>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | SuitabilityStatus,
                    )
                  }
                >
                  <option value="all">All statuses</option>
                  {(Object.keys(STATUS_TONE) as SuitabilityStatus[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <button
                type="button"
                className="pw-pt-action"
                disabled={selected.size === 0}
                onClick={openMassFollowUp}
              >
                Mass follow-up ({selected.size})
              </button>
            </div>
          </div>

          <div className="pw-pt-crm-table-wrap">
            <table className="pw-pt-crm-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        filtered.every((c) => selected.has(c.id))
                      }
                      onChange={toggleAll}
                      aria-label="Select all visible customers"
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Current policy / coverage</th>
                  <th>Protection suitability</th>
                  <th>Advisor greeting</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const greeting = `Hello ${c.firstName}, … this is your advisor license # ${ADVISOR.license}`;
                  return (
                    <tr
                      key={c.id}
                      className={`${selected.has(c.id) ? "is-checked" : ""}${
                        activeId === c.id ? " is-active" : ""
                      }`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggleRow(c.id)}
                          aria-label={`Select ${c.firstName} ${c.lastName}`}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="pw-pt-crm-name"
                          onClick={() => openOutreach(c)}
                        >
                          {c.firstName} {c.lastName}
                        </button>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.policy}</td>
                      <td>
                        <span
                          className={`pw-pt-crm-status is-${statusSlug(c.status)}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="pw-pt-crm-greeting"
                          onClick={() => openOutreach(c)}
                          title="Open personalized follow-up"
                        >
                          {greeting}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="pw-pt-inspect" role="status">
            Click a name or greeting to personalize outreach. Select rows for
            mass follow-up.
          </p>
        </div>
      ) : (
        <div className="pw-pt-crm-followup">
          <div className="pw-pt-crm-followup-head">
            <div>
              <p className="pw-pt-card-title">
                {draft.includes("{first name}")
                  ? `Mass follow-up · ${selected.size} selected`
                  : `Follow-up · ${active?.firstName} ${active?.lastName}`}
              </p>
              <p className="pw-pt-muted">
                From {ADVISOR.fullName} · license #{ADVISOR.license}
              </p>
            </div>
            <div className="pw-pt-msg-channels" role="tablist" aria-label="Channel">
              <button
                type="button"
                role="tab"
                className={channel === "email" ? "is-on" : ""}
                aria-selected={channel === "email"}
                onClick={() => setChannel("email")}
              >
                Email
              </button>
              <button
                type="button"
                role="tab"
                className={channel === "sms" ? "is-on" : ""}
                aria-selected={channel === "sms"}
                onClick={() => setChannel("sms")}
              >
                SMS
              </button>
            </div>
          </div>

          <div className="pw-pt-crm-followup-grid">
            <div className="pw-pt-crm-recipients">
              <p className="pw-pt-card-title">Recipients</p>
              <ul>
                {(draft.includes("{first name}")
                  ? CRM_CUSTOMERS.filter((c) => selected.has(c.id))
                  : active
                    ? [active]
                    : []
                ).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={activeId === c.id ? "is-on" : ""}
                      onClick={() => {
                        setActiveId(c.id);
                        if (!draft.includes("{first name}")) {
                          setDraft(greetingFor(c));
                        }
                        setSentNote(null);
                      }}
                    >
                      <strong>
                        {c.firstName} {c.lastName}
                      </strong>
                      <span className={`pw-pt-crm-status is-${statusSlug(c.status)}`}>
                        {c.status}
                      </span>
                      <em>{channel === "email" ? c.email : c.phone}</em>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pw-pt-crm-compose">
              <label htmlFor="pw-pt-crm-draft">Message</label>
              <textarea
                id="pw-pt-crm-draft"
                rows={7}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <p className="pw-pt-crm-preview-note">
                {draft.includes("{first name}")
                  ? "{first name} personalizes per selected row on send."
                  : `Preview opens with Hello ${active?.firstName}… license # ${ADVISOR.license}`}
              </p>
              <div className="pw-pt-crm-compose-actions">
                <button
                  type="button"
                  className="pw-pt-action is-ghost"
                  onClick={() => setView("book")}
                >
                  Back to book
                </button>
                <button
                  type="button"
                  className="pw-pt-action"
                  onClick={sendFollowUp}
                  disabled={!draft.trim()}
                >
                  Send {channel === "email" ? "email" : "SMS"}
                  {draft.includes("{first name}")
                    ? ` to ${selected.size}`
                    : ""}
                </button>
              </div>
              {sentNote ? (
                <p className="pw-pt-inspect" role="status">
                  {sentNote}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalyzerMock() {
  const lenses = [
    { role: "Policyholder", score: 78, note: "KEEP IN FORCE · education rider review" },
    { role: "Carrier", score: 84, note: "Appetite match · clean loss history" },
    { role: "IMO", score: 71, note: "Producer follow-up in 12 days" },
    { role: "Commercial", score: 61, note: "GL limit short vs revenue band" },
  ];
  const [active, setActive] = useState(lenses[0].role);
  const current = lenses.find((l) => l.role === active) ?? lenses[0];

  return (
    <div className="pw-pt-analyzer">
      {lenses.map((lens) => (
        <button
          key={lens.role}
          type="button"
          className={`pw-pt-card pw-pt-clickable${
            active === lens.role ? " is-selected" : ""
          }`}
          onClick={() => setActive(lens.role)}
        >
          <p className="pw-pt-stat-label">{lens.role}</p>
          <p className="pw-pt-stat-value">{lens.score}</p>
          <p className="pw-pt-muted">{lens.note}</p>
        </button>
      ))}
      <p className="pw-pt-inspect pw-pt-inspect-span" role="status">
        <strong>{current.role}</strong> lens · score {current.score} —{" "}
        {current.note}
      </p>
    </div>
  );
}

function PolicyDocument({
  dragging,
  compact,
}: {
  dragging?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`pw-pt-policy-doc${compact ? " is-compact" : ""}${
        dragging ? " is-dragging" : ""
      }`}
    >
      <div className="pw-pt-policy-doc-bar">
        <span>PDF</span>
        <em>
          {SAMPLE_POLICY.pages} pages · {SAMPLE_POLICY.name}
        </em>
      </div>
      <div className="pw-pt-policy-doc-page">
        <p className="pw-pt-policy-doc-brand">{SAMPLE_POLICY.carrier}</p>
        <h4>In-force policy illustration</h4>
        <dl>
          <div>
            <dt>Insured</dt>
            <dd>{SAMPLE_POLICY.insured}</dd>
          </div>
          <div>
            <dt>Product</dt>
            <dd>{SAMPLE_POLICY.product}</dd>
          </div>
          <div>
            <dt>Policy #</dt>
            <dd>{SAMPLE_POLICY.policyNo}</dd>
          </div>
          <div>
            <dt>Face amount</dt>
            <dd>{SAMPLE_POLICY.face}</dd>
          </div>
          <div>
            <dt>Premium</dt>
            <dd>{SAMPLE_POLICY.premium}</dd>
          </div>
          <div>
            <dt>Issue date</dt>
            <dd>{SAMPLE_POLICY.issueDate}</dd>
          </div>
        </dl>
        <div className="pw-pt-policy-doc-lines" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

type AppUploadMockProps = {
  /** Autoplay progress 0–100 through ingest → text Q&A. */
  progress?: number;
  onContinueToVoice?: () => void;
};

function IosPhone({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="pw-pt-ios">
      <div className="pw-pt-ios-speaker" aria-hidden />
      <div className="pw-pt-ios-screen">
        <div className="pw-pt-ios-status" aria-hidden>
          <span>9:41</span>
          <span className="pw-pt-ios-island" />
          <span>5G · 84%</span>
        </div>
        {title ? <p className="pw-pt-ios-app-title">{title}</p> : null}
        <div className="pw-pt-ios-body">{children}</div>
        <div className="pw-pt-ios-home" aria-hidden />
      </div>
    </div>
  );
}

function CashValueChart() {
  return (
    <figure className="pw-pt-cv-chart" aria-label="Cash value projection chart">
      <svg viewBox="0 0 280 120" role="img">
        <title>Cash value: current funding vs overfunded path to $285k</title>
        <line x1="28" y1="10" x2="28" y2="100" className="pw-pt-cv-axis" />
        <line x1="28" y1="100" x2="268" y2="100" className="pw-pt-cv-axis" />
        <polyline
          className="pw-pt-cv-line is-base"
          fill="none"
          points="28,88 70,82 112,74 154,68 196,62 238,58 268,54"
        />
        <polyline
          className="pw-pt-cv-line is-over"
          fill="none"
          points="28,88 70,78 112,62 154,48 196,34 238,22 268,14"
        />
        <circle cx="268" cy="14" r="3.5" className="pw-pt-cv-dot" />
        <text x="232" y="12" className="pw-pt-cv-label">
          $285k
        </text>
        <text x="28" y="114" className="pw-pt-cv-label">
          Now
        </text>
        <text x="240" y="114" className="pw-pt-cv-label">
          Yr 20
        </text>
      </svg>
      <figcaption>
        <span className="is-base">Current funding</span>
        <span className="is-over">Overfund to $285k CV</span>
      </figcaption>
    </figure>
  );
}

type IngestMode = "upload" | "api" | null;
type TextPromptId = "lapse" | "overfund" | null;

export function AppUploadMock({
  progress = 0,
  onContinueToVoice,
}: AppUploadMockProps) {
  const [ingest, setIngest] = useState<IngestMode>(null);
  const [ingestPct, setIngestPct] = useState(0);
  const [prompt, setPrompt] = useState<TextPromptId>(null);
  const [draggingOver, setDraggingOver] = useState(false);
  const [draggingDoc, setDraggingDoc] = useState(false);

  const autoIngested = progress >= 22;
  const autoPrompt: TextPromptId =
    progress >= 72 ? "overfund" : progress >= 48 ? "lapse" : null;

  const linked = ingest != null || autoIngested;
  const activePrompt = prompt ?? autoPrompt;
  const showChat = linked && (ingestPct >= 100 || autoIngested);

  useEffect(() => {
    if (!ingest) return;
    setIngestPct(6);
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - started) / 1800) * 100));
      setIngestPct(pct);
      if (pct < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ingest]);

  function startIngest(mode: IngestMode) {
    if (!mode) return;
    setIngest(mode);
    setPrompt(null);
  }

  function onDragStart(e: DragEvent) {
    e.dataTransfer.setData("text/pw-policy", SAMPLE_POLICY.id);
    e.dataTransfer.setData("text/plain", SAMPLE_POLICY.name);
    e.dataTransfer.effectAllowed = "copy";
    setDraggingDoc(true);
  }

  function onDragEnd() {
    setDraggingDoc(false);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDraggingOver(true);
  }

  function onDragLeave() {
    setDraggingOver(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDraggingOver(false);
    setDraggingDoc(false);
    const id = e.dataTransfer.getData("text/pw-policy");
    const name = e.dataTransfer.getData("text/plain");
    if (id === SAMPLE_POLICY.id || name === SAMPLE_POLICY.name) {
      startIngest("upload");
    }
  }

  const sourceLabel =
    ingest === "api" ? "Live in-force API" : "Document upload";

  return (
    <div className="pw-pt-upload-scene pw-pt-ios-scene">
      {!linked ? (
        <div className="pw-pt-policy-source">
          <p className="pw-pt-policy-source-label">Sample in-force PDF</p>
          <div
            className="pw-pt-policy-drag"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            title="Drag into the iPhone upload zone"
          >
            <PolicyDocument dragging={draggingDoc} />
            <span className="pw-pt-policy-hint">Drag into iPhone →</span>
          </div>
        </div>
      ) : (
        <div className="pw-pt-policy-source is-done">
          <p className="pw-pt-policy-source-label">Linked via {sourceLabel}</p>
          <PolicyDocument compact />
        </div>
      )}

      <IosPhone title="PolicyWell">
        {!showChat ? (
          <>
            <h3 className="pw-pt-ios-h">Connect your policy</h3>
            <p className="pw-pt-ios-lede">
              Upload a document or connect a live in-force feed.
            </p>
            <div className="pw-pt-ios-ingest-grid">
              <button
                type="button"
                className={`pw-pt-ios-ingest-card${
                  ingest === "upload" ? " is-on" : ""
                }${draggingOver ? " is-drop" : ""}`}
                onClick={() => startIngest("upload")}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <strong>Upload PDF</strong>
                <span>Ingest illustration / in-force statement</span>
              </button>
              <button
                type="button"
                className={`pw-pt-ios-ingest-card${
                  ingest === "api" ? " is-on" : ""
                }`}
                onClick={() => startIngest("api")}
              >
                <strong>Live API</strong>
                <span>Connect carrier in-force policy feed</span>
              </button>
            </div>
            {linked ? (
              <div className="pw-pt-ios-progress">
                <p>
                  {ingest === "api"
                    ? "Syncing live in-force values…"
                    : `Reading ${SAMPLE_POLICY.name}…`}
                </p>
                <div className="pw-pt-bar-track">
                  <span
                    className="pw-pt-bar-fill tone-low"
                    style={{
                      width: `${Math.max(ingestPct, progress)}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="pw-pt-ios-policy-chip">
              <strong>{SAMPLE_POLICY.insured}</strong>
              <span>
                {SAMPLE_POLICY.product} · {SAMPLE_POLICY.face}
              </span>
            </div>
            <div className="pw-pt-ios-chat" role="log">
              <div className="pw-pt-ios-bubble is-agent">
                <p>
                  Policy linked via{" "}
                  <strong>
                    {ingest === "api" ? "live API" : "document ingest"}
                  </strong>
                  . Ask anything about funding, lapse, or cash value.
                </p>
              </div>

              {activePrompt === "lapse" || activePrompt === "overfund" ? (
                <>
                  <div className="pw-pt-ios-bubble is-user">
                    <p>Will my policy lapse?</p>
                  </div>
                  <div className="pw-pt-ios-bubble is-agent">
                    <p>
                      Not if you keep the planned $412/mo. Current lapse risk is{" "}
                      <strong>18%</strong> over 12 months. Skipping two premiums
                      lifts that to ~34% within 9 months.
                    </p>
                  </div>
                </>
              ) : null}

              {activePrompt === "overfund" ? (
                <>
                  <div className="pw-pt-ios-bubble is-user">
                    <p>
                      How can I overfund my policy to create $285k in cash value
                      for retirement?
                    </p>
                  </div>
                  <div className="pw-pt-ios-bubble is-agent">
                    <p>
                      Raise planned premium to ~$780/mo (MEC-safe) for 12 years,
                      then reduce. Illustrated path reaches about{" "}
                      <strong>$285k CV by year 20</strong>.
                    </p>
                    <CashValueChart />
                  </div>
                </>
              ) : null}
            </div>

            <div className="pw-pt-ios-prompts" role="group" aria-label="Ask">
              <button
                type="button"
                className={activePrompt === "lapse" ? "is-on" : ""}
                onClick={() => setPrompt("lapse")}
              >
                Will my policy lapse?
              </button>
              <button
                type="button"
                className={activePrompt === "overfund" ? "is-on" : ""}
                onClick={() => setPrompt("overfund")}
              >
                Overfund for $285k retirement CV?
              </button>
            </div>

            {activePrompt === "overfund" && onContinueToVoice ? (
              <button
                type="button"
                className="pw-pt-action pw-pt-ios-continue"
                onClick={onContinueToVoice}
              >
                Ask by voice →
              </button>
            ) : null}
          </>
        )}
      </IosPhone>
    </div>
  );
}

const IUL_OPTIONS = [
  {
    id: "max-cv",
    name: "Max cash-value IUL",
    note: "Higher AG / lower COI · best for overfund CV build",
    match: "94% match",
    cvLabel: "$312k CV",
    dbLabel: "$1.25M DB",
    summary:
      "Fastest illustrated cash-value climb — overfund premiums compound into ~$312k CV by year 20 while holding $1.25M death benefit.",
    /** SVG polyline points for CV growth (x,y in 280×130 viewBox) */
    cvPoints: "28,96 70,86 112,68 154,48 196,32 238,20 268,12",
    dbPoints: "28,42 70,40 112,38 154,36 196,34 238,32 268,30",
    areaPath:
      "M28,96 L70,86 L112,68 L154,48 L196,32 L238,20 L268,12 L268,110 L28,110 Z",
  },
  {
    id: "balanced",
    name: "Balanced protection IUL",
    note: "Death benefit + CV blend · MEC headroom intact",
    match: "88% match",
    cvLabel: "$248k CV",
    dbLabel: "$1.5M DB",
    summary:
      "Balanced path — cash value grows to ~$248k by year 20 with a higher $1.5M death benefit and MEC headroom for flexible funding.",
    cvPoints: "28,96 70,88 112,76 154,62 196,50 238,40 268,34",
    dbPoints: "28,36 70,34 112,32 154,30 196,28 238,26 268,24",
    areaPath:
      "M28,96 L70,88 L112,76 L154,62 L196,50 L238,40 L268,34 L268,110 L28,110 Z",
  },
  {
    id: "legacy",
    name: "Legacy / DB-focused IUL",
    note: "Stronger guarantee · slower CV path",
    match: "71% match",
    cvLabel: "$168k CV",
    dbLabel: "$2.0M DB",
    summary:
      "Legacy-first illustration — slower CV to ~$168k by year 20, but a stronger $2.0M death-benefit guarantee for heirs.",
    cvPoints: "28,96 70,92 112,86 154,78 196,70 238,64 268,58",
    dbPoints: "28,28 70,26 112,24 154,22 196,20 238,18 268,16",
    areaPath:
      "M28,96 L70,92 L112,86 L154,78 L196,70 L238,64 L268,58 L268,110 L28,110 Z",
  },
] as const;

type IulOptionId = (typeof IUL_OPTIONS)[number]["id"];

function IulGrowthIllustration({ optionId }: { optionId: IulOptionId }) {
  const opt = IUL_OPTIONS.find((o) => o.id === optionId) ?? IUL_OPTIONS[0];

  return (
    <figure
      className="pw-pt-iul-illus"
      aria-label={`${opt.name} growth illustration`}
    >
      <div className="pw-pt-iul-illus-head">
        <strong>{opt.name}</strong>
        <span>
          {opt.cvLabel} · {opt.dbLabel} @ yr 20
        </span>
      </div>
      <svg viewBox="0 0 280 130" role="img">
        <title>
          {opt.name}: cash value to {opt.cvLabel}, death benefit {opt.dbLabel}
        </title>
        <defs>
          <linearGradient id={`pw-iul-fill-${opt.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f6f55" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2f6f55" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1="28" y1="12" x2="28" y2="110" className="pw-pt-cv-axis" />
        <line x1="28" y1="110" x2="268" y2="110" className="pw-pt-cv-axis" />
        <path
          d={opt.areaPath}
          fill={`url(#pw-iul-fill-${opt.id})`}
          className="pw-pt-iul-area"
        />
        <polyline
          className="pw-pt-cv-line is-db"
          fill="none"
          points={opt.dbPoints}
        />
        <polyline
          className="pw-pt-cv-line is-over"
          fill="none"
          points={opt.cvPoints}
        />
        <circle
          cx="268"
          cy={Number(opt.cvPoints.split(" ").at(-1)?.split(",")[1] ?? 12)}
          r="3.5"
          className="pw-pt-cv-dot"
        />
        <text x="210" y="14" className="pw-pt-cv-label">
          {opt.cvLabel}
        </text>
        <text x="28" y="124" className="pw-pt-cv-label">
          Now
        </text>
        <text x="238" y="124" className="pw-pt-cv-label">
          Yr 20
        </text>
      </svg>
      <figcaption>
        <span className="is-over">Cash value growth</span>
        <span className="is-db">Death benefit</span>
      </figcaption>
      <p className="pw-pt-iul-illus-copy">{opt.summary}</p>
    </figure>
  );
}

export function TextVoiceAgentMock({
  mode,
  tick,
  onConnectBroker,
}: {
  mode: "text" | "voice";
  tick: number;
  onConnectBroker?: () => void;
}) {
  const [asked, setAsked] = useState(false);
  const [picked, setPicked] = useState<IulOptionId | null>(null);
  const [brokerSent, setBrokerSent] = useState(false);

  useEffect(() => {
    if (mode === "voice" && tick > 18) setAsked(true);
    if (tick > 55) setPicked((p) => p ?? "max-cv");
  }, [mode, tick]);

  const showOptions = asked || tick > 35;
  const showBroker = showOptions && (picked != null || tick > 55);
  const selected = picked
    ? IUL_OPTIONS.find((o) => o.id === picked) ?? null
    : null;

  return (
    <div className="pw-pt-ios-scene pw-pt-ios-scene-solo">
      <IosPhone title="PolicyWell Voice">
        <div className="pw-pt-ios-voice-head">
          <div className="pw-pt-ios-orb" aria-hidden>
            <span />
          </div>
          <p className="pw-pt-ios-voice-label">
            {asked ? "Listening complete" : "Voice assistant"}
          </p>
          <div className="pw-pt-voice-wave pw-pt-ios-wave">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                style={{
                  animationDelay: `${i * 0.07}s`,
                  height: `${8 + ((tick + i * 7) % 20)}px`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="pw-pt-ios-chat" role="log">
          <div className="pw-pt-ios-bubble is-user is-voice">
            <p>
              “What are the best coverage options for an overfunded IUL?”
            </p>
          </div>

          {asked ? (
            <div className="pw-pt-ios-bubble is-agent">
              <p>
                For your overfund goal, I’d prioritize products with strong
                indexed AG and room under MEC. Here are three fits — tap one to
                see the illustrated growth, then I can connect you with a
                broker.
              </p>
            </div>
          ) : (
            <p className="pw-pt-ios-listening">Transcribing your question…</p>
          )}

          {showOptions ? (
            <div className="pw-pt-ios-options" role="list">
              {IUL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="listitem"
                  className={`pw-pt-ios-option${
                    picked === opt.id ? " is-on" : ""
                  }`}
                  onClick={() => setPicked(opt.id)}
                >
                  <strong>{opt.name}</strong>
                  <span>{opt.note}</span>
                  <em>{opt.match}</em>
                </button>
              ))}
            </div>
          ) : null}

          {picked ? (
            <div className="pw-pt-ios-bubble is-agent pw-pt-ios-bubble-illus">
              <p>
                Here’s the illustrated growth for{" "}
                <strong>{selected?.name}</strong> — cash value vs death benefit
                over 20 years.
              </p>
              <IulGrowthIllustration optionId={picked} />
            </div>
          ) : null}

          {showBroker ? (
            <div className="pw-pt-ios-bubble is-agent">
              <p>
                {picked
                  ? `Great — ${selected?.name} is a strong fit for your overfund goal.`
                  : "Any of these can work with a broker review."}{" "}
                I can introduce you to a licensed broker to compare full
                carrier illustrations and place the case.
              </p>
              <button
                type="button"
                className="pw-pt-action"
                onClick={() => {
                  setBrokerSent(true);
                  onConnectBroker?.();
                }}
              >
                {brokerSent ? "Broker intro sent" : "Connect with a broker"}
              </button>
            </div>
          ) : null}
        </div>

        {!asked ? (
          <button
            type="button"
            className="pw-pt-action pw-pt-ios-continue"
            onClick={() => setAsked(true)}
          >
            Ask about overfunded IUL options
          </button>
        ) : null}
      </IosPhone>
    </div>
  );
}
