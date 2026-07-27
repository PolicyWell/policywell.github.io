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
};

const MARKET_CARRIERS = [
  { id: "hartford", carrier: "Hartford Financial", premium: 4200, match: 94, best: true },
  { id: "travelers", carrier: "Travelers Group", premium: 4850, match: 87 },
  { id: "chubb", carrier: "Chubb Limited", premium: 5100, match: 82 },
  { id: "liberty", carrier: "Liberty Mutual", premium: 5400, match: 76 },
  { id: "nationwide", carrier: "Nationwide", premium: 5650, match: 73 },
  { id: "cna", carrier: "CNA Financial", premium: 5900, match: 70 },
  { id: "zurich", carrier: "Zurich Insurance", premium: 6100, match: 68 },
  { id: "berkshire", carrier: "Berkshire Hathaway", premium: 6350, match: 65 },
  { id: "progressive", carrier: "Progressive Commercial", premium: 6500, match: 63 },
  { id: "aig", carrier: "AIG Commercial", premium: 6720, match: 61 },
  { id: "cincinnati", carrier: "Cincinnati Insurance", premium: 6980, match: 58 },
  { id: "markel", carrier: "Markel Specialty", premium: 7200, match: 55 },
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
    "score" | "gaps" | "policies" | "property" | "liability" | "cyber" | "bi" | "activity" | null
  >("score");

  const exposure = [
    { id: "property" as const, label: "Property Damage", level: "High", pct: 82, tone: "high" },
    { id: "liability" as const, label: "Liability Exposure", level: "Medium", pct: 64, tone: "mid" },
    { id: "cyber" as const, label: "Cyber Threat", level: "Low", pct: 45, tone: "low" },
    { id: "bi" as const, label: "Business Interruption", level: "Medium", pct: 71, tone: "mid" },
  ];

  const detail =
    selected === "score"
      ? "Overall score blends coverage adequacy, funding health, and peer benchmarks. Click another tile to inspect it."
      : selected === "gaps"
        ? "3 open gaps: umbrella limit, cyber sublimit, and BI waiting period."
        : selected === "policies"
          ? "4 in-force policies: GL, Property, Auto, and Workers' Comp."
          : selected === "activity"
            ? "Latest: policy review completed 2h ago · new gap 4h ago · coverage updated 1d ago."
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
        <button
          type="button"
          className={`pw-pt-card pw-pt-clickable${
            selected === "activity" ? " is-selected" : ""
          }`}
          onClick={() => setSelected("activity")}
        >
          <p className="pw-pt-card-title">Recent activity</p>
          <ul className="pw-pt-activity">
            <li>
              <span>Policy review completed</span>
              <span>2h ago</span>
            </li>
            <li>
              <span>New gap identified</span>
              <span>4h ago</span>
            </li>
            <li>
              <span>Coverage updated</span>
              <span>1d ago</span>
            </li>
          </ul>
        </button>
      </div>
      <p className="pw-pt-inspect" role="status">
        {detail}
      </p>
    </AppChrome>
  );
}

export function MarketComparisonMock() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(["hartford", "travelers", "chubb", "liberty", "nationwide"]),
  );

  function toggle(id: string) {
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
  }

  const ranked = MARKET_CARRIERS.filter((c) => selected.has(c.id)).sort(
    (a, b) => b.match - a.match,
  );
  const best = ranked[0];
  const avgMatch =
    ranked.length === 0
      ? 0
      : Math.round(ranked.reduce((s, c) => s + c.match, 0) / ranked.length);

  return (
    <AppChrome url="app.policywell.ai/market" nav="market">
      <div className="pw-pt-main-head">
        <h3>Quotes / Market Comparison</h3>
        <p className="pw-pt-muted">
          {selected.size} of {MARKET_CARRIERS.length} carriers selected · click
          to toggle
        </p>
      </div>

      <div className="pw-pt-carrier-toggles" role="group" aria-label="Carriers">
        {MARKET_CARRIERS.map((c) => {
          const on = selected.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className={`pw-pt-carrier-chip${on ? " is-on" : ""}`}
              aria-pressed={on}
              onClick={() => toggle(c.id)}
            >
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
                <th>Premium</th>
                <th>Match</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row, i) => (
                <tr
                  key={row.id}
                  className={`${row.id === best?.id ? "is-best" : ""} is-row-click`}
                  onClick={() => toggle(row.id)}
                >
                  <td>{i + 1}</td>
                  <td>
                    {row.carrier}
                    {row.id === best?.id ? (
                      <span className="pw-pt-best">Best</span>
                    ) : null}
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
              <dt>Best premium</dt>
              <dd>{best ? `${money(best.premium)} / year` : "—"}</dd>
            </div>
            <div>
              <dt>Top match</dt>
              <dd>{best ? `${best.match}% · ${best.carrier}` : "—"}</dd>
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
  const [selected, setSelected] = useState<
    "hero" | "timeline" | "docs" | null
  >("timeline");

  return (
    <AppChrome url="app.policywell.ai/claims" nav="claims">
      <div className="pw-pt-main-head">
        <h3>Claims / Active Claims</h3>
        <p className="pw-pt-muted">CW-2026-0847 · panels are clickable</p>
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
        <button
          type="button"
          className={`pw-pt-card pw-pt-clickable${
            selected === "timeline" ? " is-selected" : ""
          }`}
          onClick={() => setSelected("timeline")}
        >
          <p className="pw-pt-card-title">Claim timeline</p>
          <ol className="pw-pt-timeline">
            <li className="is-done">
              <strong>Claim submitted</strong>
              <span>Today</span>
            </li>
            <li className="is-done">
              <strong>Adjuster assigned</strong>
              <span>Day 1</span>
            </li>
            <li className="is-now">
              <strong>Documentation review</strong>
              <span>Pending your upload · Day 2</span>
            </li>
            <li>
              <strong>Resolution &amp; payout</strong>
              <span>Est. $24,500 · Day 3–5</span>
            </li>
          </ol>
        </button>
        <button
          type="button"
          className={`pw-pt-card pw-pt-clickable${
            selected === "docs" ? " is-selected" : ""
          }`}
          onClick={() => setSelected("docs")}
        >
          <p className="pw-pt-card-title">Documents</p>
          <ul className="pw-pt-docs">
            <li>Claim form.pdf</li>
            <li>Photos.zip</li>
            <li>Police report.pdf</li>
          </ul>
          <div className="pw-pt-actions">
            <span className="pw-pt-action">Upload Document</span>
            <span className="pw-pt-action is-ghost">Message Adjuster</span>
          </div>
        </button>
      </div>
      <p className="pw-pt-inspect" role="status">
        {selected === "hero"
          ? "Claim CW-2026-0847 is in progress with medium priority."
          : selected === "docs"
            ? "3 documents on file. Upload more evidence to unblock review."
            : "Documentation review is the current step — awaiting your upload."}
      </p>
    </AppChrome>
  );
}

export function CrmMock() {
  const queues = [
    {
      id: "holders",
      title: "Policyholders",
      items: ["Annual review due · Alex Rivera", "Statement ready · Jordan Lee"],
    },
    {
      id: "gaps",
      title: "Gap / new coverage",
      items: ["Umbrella gap · Harbor Fab", "Cyber quote requested · Acme Retail"],
    },
    {
      id: "producers",
      title: "Producers",
      items: ["Follow up · Casey (IMO)", "Submit pack · Mutual of Omaha"],
    },
  ];
  const [active, setActive] = useState("holders");
  const current = queues.find((q) => q.id === active) ?? queues[0];

  return (
    <div className="pw-pt-crm">
      {queues.map((q) => (
        <button
          key={q.id}
          type="button"
          className={`pw-pt-card pw-pt-clickable${
            active === q.id ? " is-selected" : ""
          }`}
          onClick={() => setActive(q.id)}
        >
          <p className="pw-pt-card-title">{q.title}</p>
          <ul className="pw-pt-crm-list">
            {q.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className="pw-pt-action is-ghost">
            {active === q.id ? "Selected" : "Open queue"}
          </span>
        </button>
      ))}
      <p className="pw-pt-inspect pw-pt-inspect-span" role="status">
        Viewing <strong>{current.title}</strong> — {current.items.length} open
        follow-ups.
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

export function AppUploadMock({ progress = 0 }: AppUploadMockProps) {
  const [inserted, setInserted] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [draggingOver, setDraggingOver] = useState(false);

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
    const id = e.dataTransfer.getData("text/pw-policy");
    const name = e.dataTransfer.getData("text/plain");
    if (id === SAMPLE_POLICY.id || name === SAMPLE_POLICY.name) {
      insertPolicy();
    }
  }

  return (
    <div className="pw-pt-upload-scene">
      <div
        className="pw-pt-policy-chip"
        draggable
        onDragStart={onDragStart}
        title="Drag into the upload zone"
      >
        <span className="pw-pt-policy-icon" aria-hidden>
          PDF
        </span>
        <span className="pw-pt-policy-copy">
          <strong>{SAMPLE_POLICY.name}</strong>
          <em>{SAMPLE_POLICY.meta}</em>
        </span>
        <span className="pw-pt-policy-hint">Drag me →</span>
      </div>

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
            <p>
              {inserted
                ? effective < 100
                  ? `Reading ${SAMPLE_POLICY.name}…`
                  : "Policy inserted · analysis ready"
                : draggingOver
                  ? "Drop policy here"
                  : "Drop PDF or photo"}
            </p>
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
          {!inserted ? (
            <button
              type="button"
              className="pw-pt-action"
              onClick={insertPolicy}
            >
              Insert sample policy
            </button>
          ) : null}
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
