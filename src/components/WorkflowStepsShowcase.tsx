"use client";

import { useCallback, useEffect, useId, useState } from "react";

const STEPS = [
  {
    id: "analyze",
    label: "Analyze",
    url: "app.policywell.ai/risk-assessment",
    crumbs: "Policies / Risk Assessment",
  },
  {
    id: "shop",
    label: "Shop",
    url: "app.policywell.ai/market",
    crumbs: "Quotes / Market Comparison",
  },
  {
    id: "manage",
    label: "Manage",
    url: "app.policywell.ai/claims",
    crumbs: "Claims / Active Claims",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const OVERALL_SCORE = 74;

const EXPOSURE = [
  { label: "General Liability", level: "Medium", pct: 62, tone: "mid" },
  { label: "Cyber Liability", level: "High", pct: 91, tone: "high" },
  { label: "Property Damage", level: "Medium", pct: 58, tone: "mid" },
] as const;

const QUOTES = [
  { carrier: "Pacific Crest Mutual", premium: "$3,840", best: true },
  { carrier: "Summit Oak Insurance", premium: "$4,125", best: false },
  { carrier: "Northline Specialty", premium: "$5,690", best: false },
  { carrier: "Rivermark Assurance", premium: "$5,975", best: false },
] as const;

const QUOTES_RECEIVED = 14;
const BEST_QUOTE = QUOTES.find((q) => q.best) ?? QUOTES[0];

const CLAIM = {
  id: "PW-4817-3095",
  resolution: "< 48 hours",
  priority: "High",
  advisors: [
    { initials: "JL", name: "Jordan Lee", role: "Lead" },
    { initials: "PN", name: "Priya Nair", role: "Ops" },
  ],
} as const;

function moneyRingScore() {
  return {
    background: `conic-gradient(var(--moss) ${OVERALL_SCORE * 3.6}deg, rgba(15, 47, 40, 0.08) 0)`,
  };
}

function AnalyzePanel() {
  return (
    <div className="pw-wf-panel-body">
      <div className="pw-wf-panel-head">
        <div>
          <p className="pw-wf-crumbs">Policies / Risk Assessment</p>
          <h3 className="pw-wf-panel-title">
            <span className="pw-wf-title-mark" aria-hidden />
            Risk Assessment
          </h3>
        </div>
      </div>
      <div className="pw-wf-analyze-grid">
        <div className="pw-wf-score">
          <div className="pw-wf-score-ring" style={moneyRingScore()}>
            <div className="pw-wf-score-inner">
              <strong>{OVERALL_SCORE}</strong>
              <span>Overall Score</span>
            </div>
          </div>
        </div>
        <div className="pw-wf-exposure">
          <p className="pw-wf-section-label">Risk Exposure by Category</p>
          <ul>
            {EXPOSURE.map((row) => (
              <li key={row.label}>
                <div className="pw-wf-bar-meta">
                  <span>{row.label}</span>
                  <span>
                    {row.level} · {row.pct}%
                  </span>
                </div>
                <div className="pw-wf-bar-track">
                  <span
                    className={`pw-wf-bar-fill is-${row.tone}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ShopPanel() {
  return (
    <div className="pw-wf-panel-body">
      <div className="pw-wf-panel-head pw-wf-panel-head-split">
        <div>
          <p className="pw-wf-crumbs">Quotes / Market Comparison</p>
          <h3 className="pw-wf-panel-title">Market Comparison</h3>
        </div>
        <span className="pw-wf-filter-chip">All carriers</span>
      </div>
      <div className="pw-wf-shop-grid">
        <ul className="pw-wf-quote-list">
          {QUOTES.map((q) => (
            <li key={q.carrier} className={q.best ? "is-best" : undefined}>
              <div>
                <strong>{q.carrier}</strong>
                {q.best ? <span className="pw-wf-best">BEST</span> : null}
              </div>
              <span className="pw-wf-premium">{q.premium}</span>
            </li>
          ))}
        </ul>
        <aside className="pw-wf-quote-summary">
          <p className="pw-wf-section-label">Quotes received</p>
          <p className="pw-wf-summary-stat">{QUOTES_RECEIVED}</p>
          <p className="pw-wf-section-label">Best premium</p>
          <p className="pw-wf-summary-premium">{BEST_QUOTE.premium}</p>
          <p className="pw-wf-summary-note">{BEST_QUOTE.carrier} · annual</p>
        </aside>
      </div>
    </div>
  );
}

function ManagePanel() {
  return (
    <div className="pw-wf-panel-body">
      <div className="pw-wf-panel-head pw-wf-panel-head-split">
        <div>
          <p className="pw-wf-crumbs">Claims / Active Claims</p>
          <h3 className="pw-wf-panel-title">
            Claims Tracker{" "}
            <span className="pw-wf-status-pill">
              <i /> In Progress
            </span>
          </h3>
        </div>
        <span className="pw-wf-support-btn">Get Support</span>
      </div>
      <div className="pw-wf-manage-meta">
        <div>
          <span className="pw-wf-meta-label">Claim #</span>
          <strong>{CLAIM.id}</strong>
        </div>
        <div>
          <span className="pw-wf-meta-label">Resolution</span>
          <strong className="is-accent">{CLAIM.resolution}</strong>
        </div>
        <div>
          <span className="pw-wf-meta-label">Priority</span>
          <strong>
            <span className="pw-wf-priority-dot" aria-hidden /> {CLAIM.priority}
          </strong>
        </div>
        <div className="pw-wf-advisors">
          <span className="pw-wf-meta-label">Advisors</span>
          {CLAIM.advisors.map((advisor, index) => (
            <div key={advisor.initials} className="pw-wf-advisor-row">
              <span
                className={`pw-wf-avatar${index > 0 ? " is-alt" : ""}`}
              >
                {advisor.initials}
              </span>
              <span>
                {advisor.name} <em>{advisor.role}</em>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="pw-wf-timeline">
        <p className="pw-wf-section-label">Claim timeline</p>
        <ol>
          <li className="is-done">
            <span className="pw-wf-check" aria-hidden>
              ✓
            </span>
            Claim submitted
          </li>
          <li className="is-done">
            <span className="pw-wf-check" aria-hidden>
              ✓
            </span>
            Adjuster assigned
          </li>
          <li className="is-now">
            <span className="pw-wf-now-dot" aria-hidden />
            Documentation review
          </li>
          <li>
            <span className="pw-wf-pending-dot" aria-hidden />
            Resolution &amp; payout
          </li>
        </ol>
      </div>
    </div>
  );
}

function PanelFor({ id }: { id: StepId }) {
  if (id === "analyze") return <AnalyzePanel />;
  if (id === "shop") return <ShopPanel />;
  return <ManagePanel />;
}

/** Homepage Analyze → Shop → Manage product walkthrough with slide transitions. */
export function WorkflowStepsShowcase() {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused, prefersReducedMotion]);

  const select = useCallback((index: number) => {
    setActive(index);
    setPaused(true);
  }, []);

  const step = STEPS[active];

  return (
    <section
      className="pw-wf"
      aria-labelledby={`${baseId}-heading`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pw-shell pw-wf-inner">
        <div className="pw-wf-intro">
          <p className="pw-wf-eyebrow">How PolicyWell works</p>
          <h2 id={`${baseId}-heading`} className="pw-wf-heading">
            Analyze. Shop. Manage.
          </h2>
          <p className="pw-wf-lede">
            One operating system for coverage intelligence, marketplace
            shopping, and claims workflows — with advisors at the forefront of
            the loop.
          </p>
        </div>

        <div
          className="pw-wf-steps"
          role="tablist"
          aria-label="PolicyWell workflow steps"
        >
          {STEPS.map((s, index) => {
            const selected = index === active;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${s.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                className={`pw-wf-step${selected ? " is-active" : ""}${
                  selected && !paused && !prefersReducedMotion
                    ? " is-autoplay"
                    : ""
                }`}
                onClick={() => select(index)}
              >
                <span
                  key={`${s.id}-${selected ? active : "idle"}-${paused}`}
                  className="pw-wf-step-progress"
                  aria-hidden
                />
                <span className="pw-wf-step-num">
                  STEP {String(index + 1).padStart(2, "0")}
                </span>
                <span className="pw-wf-step-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        <div
          className="pw-wf-stage"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${step.id}`}
        >
          <div className="pw-wf-window">
            <div className="pw-wf-chrome">
              <div className="pw-wf-traffic" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <p className="pw-wf-url">{step.url}</p>
            </div>
            <div className="pw-wf-viewport">
              <div
                className="pw-wf-track"
                style={{
                  transform: `translateX(-${active * 100}%)`,
                  transition: prefersReducedMotion
                    ? "none"
                    : "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {STEPS.map((s) => (
                  <div key={s.id} className="pw-wf-slide" aria-hidden={s.id !== step.id}>
                    <PanelFor id={s.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
