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
  type Channel = "email" | "sms";
  type Audience = "consumer" | "producer";
  type Msg = { id: string; from: "you" | "them"; channel: Channel; body: string; at: string };

  type Thread = {
    id: string;
    name: string;
    role: string;
    audience: Audience;
    email: string;
    phone: string;
    preview: string;
    unread?: boolean;
    messages: Msg[];
  };

  const threads: Thread[] = [
    {
      id: "alex",
      name: "Alex Rivera",
      role: "Policyholder · IUL",
      audience: "consumer",
      email: "alex.rivera@email.com",
      phone: "(404) 555-0142",
      preview: "Can we move my review to Thursday?",
      unread: true,
      messages: [
        {
          id: "a1",
          from: "you",
          channel: "email",
          body: "Hi Alex — your annual IUL review is due next week. Want me to send the funding summary?",
          at: "Mon 9:12a",
        },
        {
          id: "a2",
          from: "them",
          channel: "email",
          body: "Yes please. Also, can we move my review to Thursday afternoon?",
          at: "Mon 10:04a",
        },
        {
          id: "a3",
          from: "you",
          channel: "sms",
          body: "Thursday 2:30pm works. I’ll text a calendar link.",
          at: "Mon 10:08a",
        },
        {
          id: "a4",
          from: "them",
          channel: "sms",
          body: "Perfect — thanks.",
          at: "Mon 10:09a",
        },
      ],
    },
    {
      id: "jordan",
      name: "Jordan Lee",
      role: "Policyholder · Term",
      audience: "consumer",
      email: "jordan.lee@email.com",
      phone: "(678) 555-0198",
      preview: "Statement looks good — any lapse risk?",
      messages: [
        {
          id: "j1",
          from: "you",
          channel: "email",
          body: "Jordan, your Q2 statement is ready. Cash value is up 3.1% vs prior quarter.",
          at: "Sun 4:20p",
        },
        {
          id: "j2",
          from: "them",
          channel: "email",
          body: "Statement looks good — any lapse risk if I skip August?",
          at: "Sun 5:01p",
        },
        {
          id: "j3",
          from: "you",
          channel: "sms",
          body: "Skipping August bumps lapse risk from 12% → ~28%. Want a short catch-up plan?",
          at: "Sun 5:06p",
        },
      ],
    },
    {
      id: "harbor",
      name: "Maya Chen",
      role: "Harbor Fab · Commercial",
      audience: "consumer",
      email: "maya@harborfab.com",
      phone: "(312) 555-0177",
      preview: "Umbrella quote — still under $1M?",
      unread: true,
      messages: [
        {
          id: "h1",
          from: "you",
          channel: "email",
          body: "Maya — peer median umbrella for your revenue band is $2M. You’re at $1M today.",
          at: "Fri 1:14p",
        },
        {
          id: "h2",
          from: "them",
          channel: "email",
          body: "Got it. Can you send the $2M umbrella quote — still under $1M premium delta?",
          at: "Fri 2:02p",
        },
        {
          id: "h3",
          from: "you",
          channel: "sms",
          body: "Draft quote is +$1,840/yr. Want me to email the full comparison pack?",
          at: "Fri 2:11p",
        },
      ],
    },
    {
      id: "casey",
      name: "Casey Nguyen",
      role: "Producer · IMO",
      audience: "producer",
      email: "casey@northpointimo.com",
      phone: "(470) 555-0110",
      preview: "Need Rivera illustration before Thursday.",
      unread: true,
      messages: [
        {
          id: "c1",
          from: "them",
          channel: "email",
          body: "Need the Rivera IUL illustration before Thursday’s review. Can you push the latest score?",
          at: "Mon 8:40a",
        },
        {
          id: "c2",
          from: "you",
          channel: "email",
          body: "Score is 78 KEEP IN FORCE. I’ll attach the education-rider note and funding chart.",
          at: "Mon 8:55a",
        },
        {
          id: "c3",
          from: "them",
          channel: "sms",
          body: "Thanks — text me when the pack is in the portal.",
          at: "Mon 9:01a",
        },
      ],
    },
    {
      id: "mutual-prod",
      name: "Sam Okonkwo",
      role: "Producer · Mutual of Omaha",
      audience: "producer",
      email: "sam.okonkwo@mutualofomaha.com",
      phone: "(402) 555-0163",
      preview: "Submit pack received — underwriting Qs.",
      messages: [
        {
          id: "m1",
          from: "you",
          channel: "email",
          body: "Sam — submit pack for Harbor Fab umbrella is uploaded. Appetite match looks clean.",
          at: "Thu 11:20a",
        },
        {
          id: "m2",
          from: "them",
          channel: "email",
          body: "Received. Two underwriting questions on contractor exposure — can you clarify by EOD?",
          at: "Thu 12:05p",
        },
        {
          id: "m3",
          from: "you",
          channel: "sms",
          body: "Clarifying now. I’ll email answers + loss runs within the hour.",
          at: "Thu 12:12p",
        },
      ],
    },
    {
      id: "priya",
      name: "Priya Shah",
      role: "Producer · Agency",
      audience: "producer",
      email: "priya@shahagency.com",
      phone: "(615) 555-0184",
      preview: "Client wants SMS reminders for premium.",
      messages: [
        {
          id: "p1",
          from: "them",
          channel: "sms",
          body: "Client wants SMS reminders 5 days before premium. Can PolicyWell own that thread?",
          at: "Wed 3:30p",
        },
        {
          id: "p2",
          from: "you",
          channel: "sms",
          body: "Yes — we’ll keep email for docs and SMS for reminders on the same contact.",
          at: "Wed 3:36p",
        },
        {
          id: "p3",
          from: "them",
          channel: "email",
          body: "Great. Please CC me on the first reminder so I can coach the conversation.",
          at: "Wed 3:48p",
        },
      ],
    },
  ];

  const drafts: Record<Channel, string> = {
    email:
      "Sharing the updated funding summary and Thursday hold. Reply here or text if timing changes.",
    sms: "Thursday 2:30pm confirmed. Calendar link incoming.",
  };

  const [activeId, setActiveId] = useState("alex");
  const [channel, setChannel] = useState<Channel>("email");
  const [audienceFilter, setAudienceFilter] = useState<"all" | Audience>("all");
  const [sent, setSent] = useState<Msg[]>([]);
  const [composer, setComposer] = useState(drafts.email);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];
  const filtered = threads.filter(
    (t) => audienceFilter === "all" || t.audience === audienceFilter,
  );
  const consumers = filtered.filter((t) => t.audience === "consumer");
  const producers = filtered.filter((t) => t.audience === "producer");

  const threadMessages = [
    ...active.messages.filter((m) => m.channel === channel),
    ...sent.filter((m) => m.id.startsWith(active.id) && m.channel === channel),
  ];

  function openThread(id: string) {
    setActiveId(id);
    setSent([]);
    const thread = threads.find((t) => t.id === id);
    const preferred =
      thread?.messages[thread.messages.length - 1]?.channel ?? "email";
    setChannel(preferred);
    setComposer(drafts[preferred]);
  }

  function switchChannel(next: Channel) {
    setChannel(next);
    setComposer(drafts[next]);
  }

  function sendMessage() {
    const body = composer.trim();
    if (!body) return;
    setSent((prev) => [
      ...prev,
      {
        id: `${active.id}-out-${prev.length + 1}`,
        from: "you",
        channel,
        body,
        at: "Just now",
      },
    ]);
    setComposer("");
  }

  function renderGroup(title: string, items: Thread[]) {
    if (items.length === 0) return null;
    return (
      <div className="pw-pt-msg-group">
        <p className="pw-pt-msg-group-title">{title}</p>
        <ul>
          {items.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`pw-pt-msg-thread${
                  activeId === t.id ? " is-selected" : ""
                }`}
                onClick={() => openThread(t.id)}
              >
                <span className="pw-pt-msg-thread-top">
                  <strong>{t.name}</strong>
                  {t.unread ? <span className="pw-pt-msg-unread" /> : null}
                </span>
                <em>{t.role}</em>
                <span className="pw-pt-msg-preview">{t.preview}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="pw-pt-msg">
      <aside className="pw-pt-msg-rail" aria-label="Conversations">
        <div className="pw-pt-msg-rail-head">
          <p className="pw-pt-card-title">Messaging</p>
          <div className="pw-pt-msg-filters" role="group" aria-label="Audience">
            {(
              [
                ["all", "All"],
                ["consumer", "Consumers"],
                ["producer", "Producers"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={audienceFilter === id ? "is-on" : ""}
                aria-pressed={audienceFilter === id}
                onClick={() => setAudienceFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {renderGroup("Consumers", consumers)}
        {renderGroup("Producers", producers)}
      </aside>

      <section className="pw-pt-msg-pane" aria-label="Conversation">
        <header className="pw-pt-msg-pane-head">
          <div>
            <h3>{active.name}</h3>
            <p>
              {active.role} ·{" "}
              {channel === "email" ? active.email : active.phone}
            </p>
          </div>
          <div className="pw-pt-msg-channels" role="tablist" aria-label="Channel">
            <button
              type="button"
              role="tab"
              className={channel === "email" ? "is-on" : ""}
              aria-selected={channel === "email"}
              onClick={() => switchChannel("email")}
            >
              Email
            </button>
            <button
              type="button"
              role="tab"
              className={channel === "sms" ? "is-on" : ""}
              aria-selected={channel === "sms"}
              onClick={() => switchChannel("sms")}
            >
              SMS
            </button>
          </div>
        </header>

        <div className="pw-pt-msg-log" role="log">
          {threadMessages.length === 0 ? (
            <p className="pw-pt-msg-empty">
              No {channel === "email" ? "email" : "SMS"} messages yet — start
              the thread below.
            </p>
          ) : (
            threadMessages.map((m) => (
              <div
                key={m.id}
                className={`pw-pt-msg-bubble${m.from === "you" ? " is-you" : ""}`}
              >
                <div className="pw-pt-msg-meta">
                  <strong>{m.from === "you" ? "You" : active.name}</strong>
                  <span>
                    {m.channel.toUpperCase()} · {m.at}
                  </span>
                </div>
                <p>{m.body}</p>
              </div>
            ))
          )}
        </div>

        <div className="pw-pt-msg-compose">
          <label className="pw-pt-msg-compose-label" htmlFor="pw-pt-msg-input">
            {channel === "email" ? "Email reply" : "SMS reply"}
          </label>
          <textarea
            id="pw-pt-msg-input"
            rows={3}
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder={
              channel === "email"
                ? "Write an email to this contact…"
                : "Write an SMS…"
            }
          />
          <div className="pw-pt-msg-compose-actions">
            <span className="pw-pt-msg-channel-hint">
              Sending via <strong>{channel === "email" ? "Email" : "SMS"}</strong>{" "}
              · same contact thread
            </span>
            <button
              type="button"
              className="pw-pt-action"
              onClick={sendMessage}
              disabled={!composer.trim()}
            >
              Send {channel === "email" ? "email" : "SMS"}
            </button>
          </div>
        </div>
      </section>
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
