"use client";

import type { ReactNode } from "react";

/** Lightweight CSS mock windows for the /product tour (no images/video). */

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
    <div className="pw-pt-window" aria-hidden>
      <div className="pw-pt-window-bar">
        <span className="pw-pt-dot" />
        <span className="pw-pt-dot" />
        <span className="pw-pt-dot" />
        <span className="pw-pt-url">{url}</span>
      </div>
      <div className="pw-pt-window-body">
        <aside className="pw-pt-side">
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

export function RiskAssessmentMock() {
  return (
    <AppChrome url="app.policywell.ai/risk-assessment" nav="risk">
      <div className="pw-pt-main-head">
        <div>
          <h3>
            Risk Assessment <span className="pw-pt-live">Live</span>
          </h3>
        </div>
        <p className="pw-pt-muted">Last updated: 2m ago</p>
      </div>
      <div className="pw-pt-stat-row">
        <div className="pw-pt-card pw-pt-score-card">
          <div className="pw-pt-score-ring">72</div>
          <p>Overall Score</p>
        </div>
        <div className="pw-pt-card">
          <p className="pw-pt-stat-label">Coverage gaps</p>
          <p className="pw-pt-stat-value is-warn">3</p>
        </div>
        <div className="pw-pt-card">
          <p className="pw-pt-stat-label">Policies</p>
          <p className="pw-pt-stat-value">4</p>
        </div>
      </div>
      <div className="pw-pt-split">
        <div className="pw-pt-card">
          <p className="pw-pt-card-title">Risk exposure by category</p>
          {[
            { label: "Property Damage", level: "High", pct: 82, tone: "high" },
            { label: "Liability Exposure", level: "Medium", pct: 64, tone: "mid" },
            { label: "Cyber Threat", level: "Low", pct: 45, tone: "low" },
            {
              label: "Business Interruption",
              level: "Medium",
              pct: 71,
              tone: "mid",
            },
          ].map((row) => (
            <div key={row.label} className="pw-pt-bar-row">
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
            </div>
          ))}
        </div>
        <div className="pw-pt-card">
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
        </div>
      </div>
    </AppChrome>
  );
}

export function MarketComparisonMock() {
  const rows = [
    { carrier: "Hartford Financial", premium: "$4,200", match: 94, best: true },
    { carrier: "Travelers Group", premium: "$4,850", match: 87 },
    { carrier: "Chubb Limited", premium: "$5,100", match: 82 },
    { carrier: "Liberty Mutual", premium: "$5,400", match: 76 },
    { carrier: "Nationwide", premium: "$5,650", match: 73 },
  ];

  return (
    <AppChrome url="app.policywell.ai/market" nav="market">
      <div className="pw-pt-main-head">
        <h3>Quotes / Market Comparison</h3>
        <p className="pw-pt-muted">20 of 40+ markets</p>
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
              {rows.map((row, i) => (
                <tr key={row.carrier} className={row.best ? "is-best" : ""}>
                  <td>{i + 1}</td>
                  <td>
                    {row.carrier}
                    {row.best ? <span className="pw-pt-best">Best</span> : null}
                  </td>
                  <td>{row.premium}</td>
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
              <dt>Quotes received</dt>
              <dd>20 of 40+</dd>
            </div>
            <div>
              <dt>Best premium</dt>
              <dd>$4,200 / year</dd>
            </div>
            <div>
              <dt>Coverage match</dt>
              <dd>94% top recommendation</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Received 20</dd>
            </div>
          </dl>
        </div>
      </div>
    </AppChrome>
  );
}

export function ClaimsTrackerMock() {
  return (
    <AppChrome url="app.policywell.ai/claims" nav="claims">
      <div className="pw-pt-main-head">
        <h3>Claims / Active Claims</h3>
        <p className="pw-pt-muted">CW-2026-0847</p>
      </div>
      <div className="pw-pt-card pw-pt-claims-hero">
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
      </div>
      <div className="pw-pt-split">
        <div className="pw-pt-card">
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
        </div>
        <div className="pw-pt-card">
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
        </div>
      </div>
    </AppChrome>
  );
}

export function CrmMock() {
  const queues = [
    {
      title: "Policyholders",
      items: ["Annual review due · Alex Rivera", "Statement ready · Jordan Lee"],
    },
    {
      title: "Gap / new coverage",
      items: ["Umbrella gap · Harbor Fab", "Cyber quote requested · Acme Retail"],
    },
    {
      title: "Producers",
      items: ["Follow up · Casey (IMO)", "Submit pack · Mutual of Omaha"],
    },
  ];

  return (
    <div className="pw-pt-crm" aria-hidden>
      {queues.map((q) => (
        <div key={q.title} className="pw-pt-card">
          <p className="pw-pt-card-title">{q.title}</p>
          <ul className="pw-pt-crm-list">
            {q.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className="pw-pt-action is-ghost">Open queue</span>
        </div>
      ))}
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

  return (
    <div className="pw-pt-analyzer" aria-hidden>
      {lenses.map((lens) => (
        <div key={lens.role} className="pw-pt-card">
          <p className="pw-pt-stat-label">{lens.role}</p>
          <p className="pw-pt-stat-value">{lens.score}</p>
          <p className="pw-pt-muted">{lens.note}</p>
        </div>
      ))}
    </div>
  );
}

export function AppUploadMock({ progress }: { progress: number }) {
  return (
    <div className="pw-pt-phone" aria-hidden>
      <div className="pw-pt-phone-notch" />
      <div className="pw-pt-phone-screen">
        <p className="pw-pt-stat-label">PolicyWell</p>
        <h3>Upload a policy</h3>
        <div className={`pw-pt-upload${progress > 10 ? " is-active" : ""}`}>
          <p>{progress < 40 ? "Drop PDF or photo" : "Reading policy…"}</p>
          <div className="pw-pt-bar-track">
            <span
              className="pw-pt-bar-fill tone-low"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        <ul className="pw-pt-upload-steps">
          <li className={progress > 20 ? "is-done" : ""}>Capture / upload</li>
          <li className={progress > 50 ? "is-done" : ""}>Extract terms</li>
          <li className={progress > 80 ? "is-done" : ""}>Score &amp; explain</li>
        </ul>
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
  const turns = mode === "text" ? textTurns : voiceTurns;
  const visible = tick > 30 ? turns : turns.slice(0, 1);

  return (
    <div className="pw-pt-agent-chat" aria-hidden>
      <div className="pw-pt-agent-mode">
        <span className={mode === "text" ? "is-on" : ""}>Text</span>
        <span className={mode === "voice" ? "is-on" : ""}>Voice</span>
      </div>
      {mode === "voice" ? (
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
