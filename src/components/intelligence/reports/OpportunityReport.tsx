"use client";

import type { ReportBook, ReportPolicyRow } from "@/lib/intelligence/report-book";
import { ProvenanceTag, ReportHeader } from "./report-meta";

type OpportunityRow = {
  id: string;
  client: string;
  policy: string;
  signal: string;
  why: string;
  confidence: number;
  action: string;
  provenance: ReportPolicyRow["provenance"];
  source: ReportPolicyRow;
  priority: "high" | "medium" | "standard";
};

function mapSignal(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("illustration") || t.includes("verif")) {
    return "Updated in-force illustration";
  }
  if (t.includes("premium") || t.includes("fund")) return "Funding review";
  if (t.includes("coverage") || t.includes("protection")) return "Coverage review";
  if (t.includes("rider")) return "Rider review";
  if (t.includes("beneficiary")) return "Beneficiary review";
  if (t.includes("loan")) return "Loan review";
  if (t.includes("1035") || t.includes("replace")) {
    return "Potential replacement review";
  }
  if (t.includes("review")) return "Funding review";
  return "Market matching";
}

export function OpportunityReport({
  book,
  onSelectPolicy,
}: {
  book: ReportBook;
  onSelectPolicy: (row: ReportPolicyRow) => void;
}) {
  const opportunities: OpportunityRow[] = book.rows
    .flatMap((row) =>
      row.recommendations.map((rec) => {
        const signal = mapSignal(rec.title);
        // Never surface replacement without stronger product evidence.
        const safeSignal =
          signal === "Potential replacement review" &&
          !row.recommendations.some((r) => /1035|fia|quote/i.test(r.title))
            ? "Coverage review"
            : signal;
        return {
          id: `${row.id}:${rec.id}`,
          client: row.clientName,
          policy: row.policyName,
          signal: safeSignal,
          why: rec.rationale,
          confidence: rec.confidence,
          action: rec.title,
          provenance: row.provenance,
          source: row,
          priority:
            rec.confidence >= 0.85
              ? ("high" as const)
              : rec.confidence >= 0.75
                ? ("medium" as const)
                : ("standard" as const),
        };
      }),
    )
    .sort((a, b) => b.confidence - a.confidence);

  const high = opportunities.filter((o) => o.priority === "high").length;

  return (
    <div className="pw-report-body">
      <ReportHeader
        title="Actionable Opportunities"
        subtitle="Producer-facing signals grounded in deterministic rules — human approval still required."
      />

      <div className="pw-report-summary">
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Policies analyzed</span>
          <strong className="pw-report-stat-value">{book.rows.length}</strong>
        </div>
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Signals found</span>
          <strong className="pw-report-stat-value">{opportunities.length}</strong>
        </div>
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">High priority</span>
          <strong className="pw-report-stat-value">{high}</strong>
        </div>
        <div className="pw-report-stat">
          <span className="pw-report-stat-label">Estimated actions</span>
          <strong className="pw-report-stat-value">{opportunities.length}</strong>
        </div>
      </div>

      <div className="pw-report-opp-list">
        {opportunities.length === 0 ? (
          <p className="pw-report-empty">No actionable signals from current evidence.</p>
        ) : (
          opportunities.map((opp, index) => (
            <article key={opp.id} className="pw-report-opp-card">
              <div className="pw-report-opp-rank">{String(index + 1).padStart(2, "0")}</div>
              <div className="pw-report-opp-main">
                <div className="pw-report-opp-top">
                  <h4>{opp.signal}</h4>
                  <span className={`pw-report-priority is-${opp.priority}`}>
                    {opp.priority}
                  </span>
                </div>
                <p className="pw-report-opp-meta">
                  <button
                    type="button"
                    className="pw-report-link"
                    onClick={() => onSelectPolicy(opp.source)}
                  >
                    {opp.client}
                  </button>
                  {" · "}
                  {opp.policy} <ProvenanceTag provenance={opp.provenance} />
                </p>
                <p className="pw-report-opp-why">
                  <span className="pw-report-kicker">Why it matters</span>
                  {opp.why}
                </p>
                <div className="pw-report-opp-foot">
                  <span className="pw-report-mono">
                    Confidence {Math.round(opp.confidence * 100)}%
                  </span>
                  <span>{opp.action}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
