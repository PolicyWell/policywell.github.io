"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SiteNav } from "@/components/ui";
import { DEMO_USERS, buildDemoSeed } from "@/lib/seed";
import { createOnboardingState } from "@/lib/onboarding";
import {
  clearWorkspaceData,
  saveDocuments,
  saveOnboardingRaw,
  saveProfile,
  saveSession,
} from "@/lib/storage";
import { clearOnboardingBoot, notifyStore } from "@/lib/use-workspace";

const ANALYSIS_STEPS = [
  {
    label: "Reading policy PDF · Ingestion via Secure Insurance APIs",
    detail: "Ingesting pages, tables, riders, and carrier feeds",
  },
  { label: "Identifying carrier & product", detail: "Matching illustration to in-force record" },
  { label: "Extracting coverage terms", detail: "Face amount, premiums, cash value, riders" },
  { label: "Building household context", detail: "Dependents, mortgage, income, goals" },
  { label: "Scoring policy health", detail: "Lapse risk, funding gap, suitability" },
  { label: "Comparing similar policies", detail: "Benchmarking against peer portfolios" },
  { label: "Detecting opportunities", detail: "Gaps, upgrades, replacements, keep" },
  { label: "Generating recommendations", detail: "Grounded explanations with confidence" },
] as const;

const CAPABILITIES = [
  "Carrier APIs",
  "Policy PDFs",
  "Illustrations",
  "Annual statements",
  "Household context",
  "Financial goals",
  "Policy health scores",
  "Coverage gaps",
  "Product compare",
  "Replace / upgrade / keep",
  "Advisor reports",
  "Consumer reports",
  "Approval workflows",
  "Application submit",
  "Commission signals",
] as const;

const RECOMMENDATIONS = [
  {
    action: "Upgrade",
    title: "Increase death benefit to cover mortgage + education",
    reason: "Current face amount trails household liability by ~18%.",
    confidence: 92,
  },
  {
    action: "Maintain",
    title: "Keep existing IUL chassis; correct funding path",
    reason: "Product fit is strong; underfunding drives lapse risk.",
    confidence: 88,
  },
  {
    action: "Opportunity",
    title: "Add term rider for temporary education gap",
    reason: "Lower-cost bridge until cash value trajectory recovers.",
    confidence: 81,
  },
] as const;

const INTEGRATIONS = [
  { name: "REST APIs", desc: "Policies, scores, recs, applications" },
  { name: "CLI", desc: "Automate ingest & batch analysis" },
  { name: "CRM", desc: "Salesforce, HubSpot, agency CRMs" },
  { name: "Policy admin", desc: "Legacy PAS — no rip-and-replace" },
] as const;

const FLYWHEEL = [
  { title: "Ingest", copy: "Policies, statements, CRM signals" },
  { title: "Reason", copy: "Context across household & market" },
  { title: "Recommend", copy: "Explainable actions with confidence" },
  { title: "Approve", copy: "Advisor gate before client delivery" },
  { title: "Apply", copy: "Carrier workflows through producers" },
  { title: "Learn", copy: "Outcomes sharpen the next cycle" },
] as const;

function useInView<T extends HTMLElement>(threshold = 0.22) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`pw-demo-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="pw-demo-score">
      <svg viewBox="0 0 100 100" className="pw-demo-score-svg" aria-hidden>
        <circle cx="50" cy="50" r={r} className="pw-demo-score-track" />
        <circle
          cx="50"
          cy="50"
          r={r}
          className="pw-demo-score-value"
          style={{
            strokeDasharray: c,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="pw-demo-score-center">
        <span className="pw-demo-score-num">{value}</span>
        <span className="pw-demo-score-label">{label}</span>
      </div>
    </div>
  );
}

export function DemoLifecycle() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(-1);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [launching, setLaunching] = useState(false);
  const analysisRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = analysisRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setAnalysisStarted(true);
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!analysisStarted || analysisDone) return;
    let i = 0;
    setActiveStep(0);
    const id = window.setInterval(() => {
      i += 1;
      if (i >= ANALYSIS_STEPS.length) {
        window.clearInterval(id);
        setActiveStep(ANALYSIS_STEPS.length);
        setAnalysisDone(true);
        return;
      }
      setActiveStep(i);
    }, 720);
    return () => window.clearInterval(id);
  }, [analysisStarted, analysisDone]);

  const openProduct = useCallback(() => {
    setLaunching(true);
    clearWorkspaceData();
    clearOnboardingBoot();
    const user = DEMO_USERS[0];
    const { profile, documents } = buildDemoSeed(user);
    saveSession(user);
    saveProfile(profile);
    saveDocuments(documents);
    const onboarding = createOnboardingState(
      user.id,
      user.role,
      user.name,
      user.email,
    );
    onboarding.profile = profile;
    onboarding.complete = true;
    onboarding.messages.push({
      id: "msg_demo",
      role: "assistant",
      content:
        "Household context is ready. Ask about lapse risk, funding, coverage gaps, or recommendations.",
      at: new Date().toISOString(),
    });
    saveOnboardingRaw(JSON.stringify(onboarding));
    notifyStore();
    router.push("/agent");
  }, [router]);

  const progress =
    activeStep < 0
      ? 0
      : Math.min(100, Math.round((activeStep / ANALYSIS_STEPS.length) * 100));

  return (
    <div className="pw-demo flex-1 flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="pw-demo-hero">
        <div className="pw-demo-hero-glow" aria-hidden />
        <div className="pw-shell pw-demo-hero-inner">
          <p className="pw-demo-eyebrow animate-rise">Product demo</p>
          <h1 className="pw-demo-h1 animate-rise-delay">
            Watch insurance
            <br />
            intelligence think.
          </h1>
          <p className="pw-demo-lede animate-rise-delay-2">
            Upload a policy. PolicyWell builds household context, reasons across
            the financial picture, and surfaces recommendations — with advisors
            in the loop.
          </p>
          <div className="pw-demo-hero-cta animate-rise-delay-2">
            <a href="#analysis" className="pw-btn">
              See the lifecycle
            </a>
            <button
              type="button"
              className="pw-btn pw-btn-secondary"
              onClick={openProduct}
              disabled={launching}
            >
              {launching ? "Opening…" : "Open the product"}
            </button>
          </div>
          <div className="pw-demo-flow animate-rise-delay-2" aria-hidden>
            {[
              "Upload",
              "Ingest",
              "Context",
              "Reason",
              "Recommend",
              "Approve",
              "Apply",
              "Learn",
            ].map((step, i, arr) => (
              <span key={step} className="pw-demo-flow-item">
                <span className="pw-demo-flow-label">{step}</span>
                {i < arr.length - 1 && (
                  <span className="pw-demo-flow-arrow">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Live AI Analysis */}
      <section
        id="analysis"
        ref={analysisRef}
        className="pw-demo-section pw-demo-analysis"
      >
        <div className="pw-shell">
          <Reveal>
            <p className="pw-demo-eyebrow">Live AI analysis</p>
            <h2 className="pw-demo-h2">The model is working.</h2>
            <p className="pw-demo-section-copy">
              From document to decision — visible reasoning, not a black box.
            </p>
          </Reveal>

          <Reveal delay={80} className="pw-demo-terminal">
            <div className="pw-demo-terminal-bar">
              <span className="pw-demo-dot" />
              <span className="pw-demo-dot" />
              <span className="pw-demo-dot" />
              <span className="pw-demo-terminal-title">policywell · analyze</span>
            </div>
            <div className="pw-demo-terminal-body">
              <div className="pw-demo-progress-track" aria-hidden>
                <div
                  className="pw-demo-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="pw-demo-terminal-status">
                {analysisDone
                  ? "Analysis complete"
                  : analysisStarted
                    ? "Ingesting policy…"
                    : "Waiting to start…"}
                <span className="pw-demo-terminal-pct">{progress}%</span>
              </p>
              <ul className="pw-demo-steps">
                {ANALYSIS_STEPS.map((step, i) => {
                  const done = i < activeStep || analysisDone;
                  const current = i === activeStep && !analysisDone;
                  return (
                    <li
                      key={step.label}
                      className={`pw-demo-step ${done ? "is-done" : ""} ${current ? "is-current" : ""}`}
                    >
                      <span className="pw-demo-step-mark" aria-hidden>
                        {done ? "✓" : current ? "●" : "○"}
                      </span>
                      <span className="pw-demo-step-text">
                        <span className="pw-demo-step-label">{step.label}</span>
                        <span className="pw-demo-step-detail">{step.detail}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Intelligence Dashboard */}
      <section className="pw-demo-section">
        <div className="pw-shell">
          <Reveal>
            <p className="pw-demo-eyebrow">Insurance intelligence</p>
            <h2 className="pw-demo-h2">One household. Full clarity.</h2>
            <p className="pw-demo-section-copy">
              Scores, gaps, and context in a single operating view.
            </p>
          </Reveal>

          <Reveal delay={100} className="pw-demo-dash">
            <div className="pw-demo-dash-top">
              <div>
                <p className="pw-demo-dash-kicker">Household</p>
                <h3 className="pw-demo-dash-title">Rivera family</h3>
                <p className="pw-demo-dash-meta">
                  Dual income · 3 dependents · primary residence
                </p>
              </div>
              <ScoreRing value={64} label="Health" />
            </div>

            <div className="pw-demo-dash-grid">
              <div className="pw-demo-metric">
                <span className="pw-demo-metric-label">Funding gap</span>
                <span className="pw-demo-metric-value">$800 / mo</span>
                <div className="score-bar mt-3">
                  <span style={{ width: "72%" }} />
                </div>
              </div>
              <div className="pw-demo-metric">
                <span className="pw-demo-metric-label">Lapse risk</span>
                <span className="pw-demo-metric-value text-amber">Elevated</span>
                <div className="score-bar mt-3">
                  <span style={{ width: "58%", background: "linear-gradient(90deg, var(--amber-water), #d4b56e)" }} />
                </div>
              </div>
              <div className="pw-demo-metric">
                <span className="pw-demo-metric-label">Coverage vs needs</span>
                <span className="pw-demo-metric-value">82%</span>
                <div className="score-bar mt-3">
                  <span style={{ width: "82%" }} />
                </div>
              </div>
              <div className="pw-demo-metric">
                <span className="pw-demo-metric-label">Peer comparison</span>
                <span className="pw-demo-metric-value">48 policies</span>
                <p className="pw-demo-metric-note">Benchmarked in-force universe</p>
              </div>
            </div>

            <div className="pw-demo-context">
              <p className="pw-demo-dash-kicker">Context graph</p>
              <div className="pw-demo-chips">
                {[
                  "Retirement target",
                  "Mortgage balance",
                  "College timeline",
                  "Income stability",
                  "Risk tolerance",
                  "Existing riders",
                ].map((c) => (
                  <span key={c} className="pw-demo-chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Recommendations */}
      <section className="pw-demo-section pw-demo-recs">
        <div className="pw-shell">
          <Reveal>
            <p className="pw-demo-eyebrow">Recommendations</p>
            <h2 className="pw-demo-h2">Actions with receipts.</h2>
            <p className="pw-demo-section-copy">
              Replace, upgrade, or maintain — every call is explained.
            </p>
          </Reveal>

          <div className="pw-demo-rec-list">
            {RECOMMENDATIONS.map((rec, i) => (
              <Reveal key={rec.title} delay={i * 90}>
                <article className="pw-demo-rec">
                  <div className="pw-demo-rec-head">
                    <span className="pw-demo-rec-action">{rec.action}</span>
                    <span className="pw-demo-rec-conf">{rec.confidence}% confidence</span>
                  </div>
                  <h3 className="pw-demo-rec-title">{rec.title}</h3>
                  <p className="pw-demo-rec-reason">{rec.reason}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="pw-demo-cap-cloud" aria-label="Capabilities">
              {CAPABILITIES.map((c) => (
                <span key={c} className="pw-demo-cap">
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Advisor Review */}
      <section className="pw-demo-section">
        <div className="pw-shell pw-demo-advisor">
          <Reveal className="pw-demo-advisor-copy">
            <p className="pw-demo-eyebrow">Advisor review</p>
            <h2 className="pw-demo-h2">Humans approve. Then clients see it.</h2>
            <p className="pw-demo-section-copy">
              Recommendations never reach the household until a licensed advisor
              signs off. Reports for advisors and consumers. Applications submit
              through the producer of record.
            </p>
          </Reveal>

          <Reveal delay={100} className="pw-demo-approve">
            <div className="pw-demo-approve-row">
              <div>
                <p className="pw-demo-approve-label">Pending review</p>
                <p className="pw-demo-approve-title">3 recommendations</p>
              </div>
              <span className="pw-demo-approve-badge">Advisor gate</span>
            </div>
            <ul className="pw-demo-approve-list">
              <li>
                <span>Upgrade death benefit</span>
                <span className="pw-demo-pill ok">Approve</span>
              </li>
              <li>
                <span>Correct funding path</span>
                <span className="pw-demo-pill ok">Approve</span>
              </li>
              <li>
                <span>Term rider bridge</span>
                <span className="pw-demo-pill hold">Hold</span>
              </li>
            </ul>
            <p className="pw-demo-approve-foot">
              Commission opportunity surfaced for advisor + PolicyWell on approved path.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Carrier Integration */}
      <section className="pw-demo-section pw-demo-integrate">
        <div className="pw-shell">
          <Reveal>
            <p className="pw-demo-eyebrow">Enterprise integration</p>
            <h2 className="pw-demo-h2">No rip-and-replace.</h2>
            <p className="pw-demo-section-copy">
              Carriers, agencies, IMOs, broker-dealers, and advisors plug PolicyWell
              into the stack they already run.
            </p>
          </Reveal>

          <div className="pw-demo-int-grid">
            {INTEGRATIONS.map((item, i) => (
              <Reveal key={item.name} delay={i * 70}>
                <div className="pw-demo-int">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <p className="pw-demo-int-note">
              Connect Carrier APIs · Import PDFs · Fit Existing Enterprise Workflows
            </p>
          </Reveal>
        </div>
      </section>

      {/* Continuous Learning */}
      <section className="pw-demo-section">
        <div className="pw-shell">
          <Reveal>
            <p className="pw-demo-eyebrow">Continuous learning</p>
            <h2 className="pw-demo-h2">Every outcome sharpens the next.</h2>
            <p className="pw-demo-section-copy">
              Approvals, applications, and in-force results feed the flywheel.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <ol className="pw-demo-flywheel">
              {FLYWHEEL.map((item, i) => (
                <li key={item.title} className="pw-demo-fly-item">
                  <span className="pw-demo-fly-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pw-demo-fly-title">{item.title}</span>
                  <span className="pw-demo-fly-copy">{item.copy}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="pw-demo-cta">
        <div className="pw-shell pw-demo-cta-inner">
          <Reveal>
            <h2 className="pw-demo-cta-title">
              Ready to run it on your book?
            </h2>
            <p className="pw-demo-cta-copy">
              Open the live product, or talk with us about carrier and IMO rollout.
            </p>
            <div className="pw-demo-hero-cta">
              <button
                type="button"
                className="pw-btn !bg-foam !text-pine hover:!bg-white"
                onClick={openProduct}
                disabled={launching}
              >
                {launching ? "Opening…" : "Open the product"}
              </button>
              <Link
                href="/deck"
                className="pw-btn pw-btn-secondary !border-foam/35 !text-foam hover:!bg-foam/10"
              >
                View the deck
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
