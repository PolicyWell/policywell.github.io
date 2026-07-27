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
}: {
  url: string;
  children: ReactNode;
  nav?: "overview" | "risk" | "market" | "claims" | "docs";
}) {
  const items = [
    { id: "overview", label: "Overview" },
    { id: "risk", label: "Risk" },
    { id: "market", label: "Market" },
    { id: "claims", label: "Claims" },
    { id: "docs", label: "Docs" },
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
        <aside className="pw-pt-side" aria-hidden>
          {items.map((item) => (
            <span
              key={item.id}
              className={`pw-pt-side-item${nav === item.id ? " is-active" : ""}`}
              title={item.label}
            >
              <span className="pw-pt-side-icon" />
            </span>
          ))}
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

export function RiskAssessmentMock() {
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
    <AppChrome url="app.policywell.ai/risk-assessment" nav="risk">
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

export function MarketComparisonMock() {
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
    <AppChrome url="app.policywell.ai/market" nav="market">
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

export function ClaimsTrackerMock() {
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
    <AppChrome url="app.policywell.ai/claims" nav="claims">
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

export function CrmMock() {
  const queues = [
    {
      id: "holders",
      title: "Policyholders",
      items: [
        { id: "alex", label: "Annual review due · Alex Rivera" },
        { id: "jordan", label: "Statement ready · Jordan Lee" },
      ],
    },
    {
      id: "gaps",
      title: "Gap / new coverage",
      items: [
        { id: "harbor", label: "Umbrella gap · Harbor Fab" },
        { id: "acme", label: "Cyber quote requested · Acme Retail" },
      ],
    },
    {
      id: "producers",
      title: "Producers",
      items: [
        { id: "casey", label: "Follow up · Casey (IMO)" },
        { id: "mutual-prod", label: "Submit pack · Mutual of Omaha" },
      ],
    },
  ];
  const [activeQueue, setActiveQueue] = useState("holders");
  const [activeItem, setActiveItem] = useState("alex");
  const current = queues.find((q) => q.id === activeQueue) ?? queues[0];
  const item =
    current.items.find((i) => i.id === activeItem) ??
    queues.flatMap((q) => q.items).find((i) => i.id === activeItem);

  return (
    <div className="pw-pt-crm">
      {queues.map((q) => (
        <div
          key={q.id}
          className={`pw-pt-card pw-pt-clickable-panel${
            activeQueue === q.id ? " is-selected" : ""
          }`}
        >
          <button
            type="button"
            className="pw-pt-panel-head"
            onClick={() => {
              setActiveQueue(q.id);
              setActiveItem(q.items[0].id);
            }}
          >
            <p className="pw-pt-card-title">{q.title}</p>
          </button>
          <ul className="pw-pt-crm-list pw-pt-docs-click">
            {q.items.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className={`pw-pt-square-btn${
                    activeItem === entry.id ? " is-selected" : ""
                  }`}
                  onClick={() => {
                    setActiveQueue(q.id);
                    setActiveItem(entry.id);
                  }}
                >
                  <strong>{entry.label}</strong>
                  <span>Open follow-up</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="pw-pt-inspect pw-pt-inspect-span" role="status">
        <strong>{current.title}</strong>
        {item ? ` · ${item.label}` : ""} — click any square to switch.
      </p>
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

type AppUploadMockProps = {
  /** Optional external progress (autoplay). Ignored once a policy is inserted. */
  progress?: number;
};

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

export function AppUploadMock({ progress = 0 }: AppUploadMockProps) {
  const [inserted, setInserted] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [draggingOver, setDraggingOver] = useState(false);
  const [draggingDoc, setDraggingDoc] = useState(false);

  const effective = inserted ? localProgress : progress;

  useEffect(() => {
    if (!inserted) return;
    setLocalProgress(8);
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - started) / 2400) * 100));
      setLocalProgress(pct);
      if (pct < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inserted]);

  function insertPolicy() {
    setInserted(true);
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
      insertPolicy();
    }
  }

  return (
    <div className="pw-pt-upload-scene">
      {!inserted ? (
        <div className="pw-pt-policy-source">
          <p className="pw-pt-policy-source-label">Sample policy</p>
          <div
            className="pw-pt-policy-drag"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            title="Drag this policy into the upload zone"
          >
            <PolicyDocument dragging={draggingDoc} />
            <span className="pw-pt-policy-hint">Drag into upload →</span>
          </div>
          <button
            type="button"
            className="pw-pt-action"
            onClick={insertPolicy}
          >
            Insert sample policy
          </button>
        </div>
      ) : (
        <div className="pw-pt-policy-source is-done">
          <p className="pw-pt-policy-source-label">Inserted</p>
          <PolicyDocument compact />
        </div>
      )}

      <div className="pw-pt-phone">
        <div className="pw-pt-phone-notch" />
        <div className="pw-pt-phone-screen">
          <p className="pw-pt-stat-label">PolicyWell</p>
          <h3>Upload a policy</h3>
          <div
            className={`pw-pt-upload${effective > 10 ? " is-active" : ""}${
              draggingOver ? " is-drop" : ""
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {inserted ? (
              <div className="pw-pt-upload-inserted">
                <PolicyDocument compact />
                <p>
                  {effective < 100
                    ? `Reading ${SAMPLE_POLICY.name}…`
                    : "Policy inserted · analysis ready"}
                </p>
              </div>
            ) : (
              <p>
                {draggingOver
                  ? "Drop policy here"
                  : "Drop the policy PDF here"}
              </p>
            )}
            <div className="pw-pt-bar-track">
              <span
                className="pw-pt-bar-fill tone-low"
                style={{ width: `${Math.min(effective, 100)}%` }}
              />
            </div>
          </div>
          <ul className="pw-pt-upload-steps">
            <li className={effective > 20 ? "is-done" : ""}>Capture / upload</li>
            <li className={effective > 50 ? "is-done" : ""}>Extract terms</li>
            <li className={effective > 80 ? "is-done" : ""}>Score &amp; explain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function TextVoiceAgentMock({
  mode,
  tick,
}: {
  mode: "text" | "voice";
  tick: number;
}) {
  const [localMode, setLocalMode] = useState<"text" | "voice">(mode);

  useEffect(() => {
    setLocalMode(mode);
  }, [mode]);

  const textTurns = [
    { who: "You", text: "What’s my lapse risk if I skip two premiums?" },
    {
      who: "Agent",
      text: "Based on your IUL cash value and funding ratio, lapse risk rises from 18% to ~34% within 9 months.",
    },
  ];
  const voiceTurns = [
    { who: "You", text: "“Compare my umbrella to peers in my revenue band.”" },
    {
      who: "Agent",
      text: "Your $1M umbrella sits below the peer median of $2M for similar commercial profiles.",
    },
  ];
  const turns = localMode === "text" ? textTurns : voiceTurns;
  const visible = tick > 30 ? turns : turns.slice(0, 1);

  return (
    <div className="pw-pt-agent-chat">
      <div className="pw-pt-agent-mode" role="tablist" aria-label="Agent mode">
        <button
          type="button"
          role="tab"
          className={localMode === "text" ? "is-on" : ""}
          aria-selected={localMode === "text"}
          onClick={() => setLocalMode("text")}
        >
          Text
        </button>
        <button
          type="button"
          role="tab"
          className={localMode === "voice" ? "is-on" : ""}
          aria-selected={localMode === "voice"}
          onClick={() => setLocalMode("voice")}
        >
          Voice
        </button>
      </div>
      {localMode === "voice" ? (
        <div className="pw-pt-voice-wave">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              style={{
                animationDelay: `${i * 0.08}s`,
                height: `${8 + ((tick + i * 7) % 18)}px`,
              }}
            />
          ))}
        </div>
      ) : null}
      <div className="pw-pt-chat-log">
        {visible.map((turn) => (
          <div
            key={turn.text}
            className={`pw-pt-bubble${turn.who === "You" ? " is-user" : ""}`}
          >
            <strong>{turn.who}</strong>
            <p>{turn.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
