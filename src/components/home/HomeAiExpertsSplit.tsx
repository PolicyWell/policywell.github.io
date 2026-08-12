import Link from "next/link";
import { WorkflowStepsShowcase } from "@/components/WorkflowStepsShowcase";

export function HomeAiExpertsSplit() {
  return (
    <section className="pw-wc-split" aria-label="How PolicyWell works">
      <div className="pw-shell pw-shell-wide pw-wc-split-grid">
        <article className="pw-wc-split-col">
          <h2 className="pw-wc-split-title">AI Analyzes.</h2>
          <p className="pw-wc-split-lede">
            Our intelligence layer ingests policies and books, compares coverage,
            flags gaps, and grounds every recommendation in extracted evidence —
            so your team can move faster with higher confidence.
          </p>
          <div className="pw-wc-split-panel">
            <div className="pw-wc-risk-card">
              <div className="pw-wc-risk-card-head">
                <span className="pw-wc-risk-check" aria-hidden>
                  ✓
                </span>
                <div>
                  <p className="pw-wc-risk-title">Risk assessment</p>
                  <p className="pw-wc-risk-meta">Live ingest · tool-grounded</p>
                </div>
              </div>
              <ul className="pw-wc-risk-list">
                <li>Scanning policy documents</li>
                <li>Comparing limits and forms</li>
                <li>Reviewing exclusions</li>
                <li>Detecting coverage gaps</li>
              </ul>
            </div>
            <div className="pw-wc-split-foot">
              <span>Coverage gaps surfaced</span>
              <span className="pw-wc-split-foot-meta">READY FOR EXPERT REVIEW</span>
            </div>
          </div>
        </article>

        <article className="pw-wc-split-col">
          <h2 className="pw-wc-split-title">Agents Advise</h2>
          <p className="pw-wc-split-lede">
            Meet Ope and the PolicyWell agent turn analysis into next steps —
            renewal priorities, funding paths, and meeting-ready recommendations
            that still require human approval before client delivery.
          </p>
          <div className="pw-wc-split-panel pw-wc-split-panel-light">
            <div className="pw-wc-advise-card">
              <p className="pw-wc-advise-kicker">Deductible / funding path</p>
              <p className="pw-wc-advise-change">
                <span>$50,000</span>
                <span aria-hidden> → </span>
                <strong>$10,000</strong>
              </p>
              <p className="pw-wc-advise-note">
                Grounded scenario for planning — not a guarantee. Approve before
                client delivery.
              </p>
              <div className="pw-wc-advise-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ope-mascot.png"
                  alt=""
                  width={36}
                  height={36}
                  className="pw-wc-advise-avatar"
                />
                <span>Ope</span>
                <Link href="/agent/" className="pw-wc-advise-chip">
                  POLICY AGENT
                </Link>
              </div>
            </div>
            <div className="pw-wc-split-foot">
              <span>Recommendation drafted</span>
              <span className="pw-wc-split-foot-meta">YOUR TEAM · OUR AGENTS</span>
            </div>
          </div>
        </article>
      </div>

      <div className="pw-wc-workflow-wrap">
        <WorkflowStepsShowcase />
      </div>
    </section>
  );
}
