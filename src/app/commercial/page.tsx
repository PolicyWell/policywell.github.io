"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IntelligenceModes } from "@/components/IntelligenceModes";
import { AppNav, ConfidenceBadge } from "@/components/ui";
import { LOB_LABELS } from "@/lib/commercial-types";
import { buildCommercialWorkspaceSnapshot } from "@/lib/commercial-seed";
import { tasksFromCommercialSignals } from "@/lib/tasks";
import { persistTasks, useSession, useTasks } from "@/lib/use-workspace";

const SCORE_CARDS = [
  { key: "overallRiskScore", label: "Overall Risk Score" },
  { key: "coverageAdequacyScore", label: "Coverage Adequacy Score" },
  { key: "underinsuredScore", label: "Underinsured Score" },
  { key: "businessHealthScore", label: "Business Health Score" },
] as const;

export default function CommercialRiskPage() {
  const session = useSession();
  const tasks = useTasks();
  const [loaded, setLoaded] = useState(true);
  const snapshot = useMemo(
    () =>
      buildCommercialWorkspaceSnapshot(session?.id ?? "user_guest"),
    [session?.id],
  );

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please{" "}
          <Link href="/login" className="underline">
            sign in
          </Link>{" "}
          to open the Commercial Risk Workspace.
        </p>
      </div>
    );
  }

  const { business, scores, gaps, mitigations, appetiteMatches, underwritingPreview } =
    snapshot;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AppNav role={session.role} />
      <main className="pw-shell py-8 md:py-10 space-y-8">
        <header className="space-y-3 animate-rise">
          <p className="text-xs uppercase tracking-[0.2em] text-moss">
            Commercial Risk Workspace
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl md:text-4xl text-pine">
                {business.legalName}
              </h1>
              <p className="text-stone mt-2">
                Explainable commercial risk, coverage gaps, and preliminary
                underwriting intelligence - with licensed humans in control.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ConfidenceBadge value={scores.confidence} />
              <button
                type="button"
                className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
                onClick={() => setLoaded((v) => !v)}
              >
                {loaded ? "Hide demo business" : "Load Harbor Fab demo"}
              </button>
              <Link href="/agent" className="pw-btn !py-2 !px-3 text-xs">
                Ask the agent
              </Link>
              <button
                type="button"
                className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
                onClick={() =>
                  persistTasks(
                    tasksFromCommercialSignals({
                      gaps,
                      renewalWithinDays: business.renewalWithinDays,
                      certificatesExpiringSoon: business.certificatesExpiringSoon,
                      missingRequirements: [
                        ...scores.missingData,
                        ...underwritingPreview.missingRequirements,
                      ],
                      existing: tasks,
                    }),
                  )
                }
              >
                Generate tasks
              </button>
              <Link href="/tasks" className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs">
                View tasks
              </Link>
            </div>
          </div>
          <IntelligenceModes active="commercial" />
        </header>

        {!loaded ? (
          <section className="pw-panel p-8 text-center space-y-3">
            <p className="text-stone">
              Load the illustrative Harbor Fabrication demo to explore commercial
              scores, gaps, appetite matching, and renewal readiness.
            </p>
            <button
              type="button"
              className="pw-btn"
              onClick={() => setLoaded(true)}
            >
              Load demo business
            </button>
          </section>
        ) : (
          <>
            <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 animate-rise">
              {SCORE_CARDS.map((card) => (
                <div key={card.key} className="pw-panel p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-moss">
                    {card.label}
                  </p>
                  <p className="font-display text-3xl text-pine mt-2">
                    {scores[card.key]}
                  </p>
                </div>
              ))}
            </section>

            <section className="grid lg:grid-cols-2 gap-5">
              <div className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">Business profile</h2>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-stone text-xs">Industry</dt>
                    <dd>{business.industryDescription.value}</dd>
                  </div>
                  <div>
                    <dt className="text-stone text-xs">NAICS</dt>
                    <dd>{business.naics.value}</dd>
                  </div>
                  <div>
                    <dt className="text-stone text-xs">Revenue</dt>
                    <dd>
                      ${(business.annualRevenue.value ?? 0).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone text-xs">Payroll</dt>
                    <dd>
                      ${(business.annualPayroll.value ?? 0).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone text-xs">Employees</dt>
                    <dd>{business.employeeCount.value}</dd>
                  </div>
                  <div>
                    <dt className="text-stone text-xs">Vehicles</dt>
                    <dd>{business.vehiclesCount.value}</dd>
                  </div>
                  <div>
                    <dt className="text-stone text-xs">Renewal window</dt>
                    <dd>{business.renewalWithinDays} days</dd>
                  </div>
                  <div>
                    <dt className="text-stone text-xs">COIs expiring</dt>
                    <dd>{business.certificatesExpiringSoon}</dd>
                  </div>
                </dl>
                <MissingList fields={business.missingFields} />
              </div>

              <div className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">
                  Score explanations
                </h2>
                <ul className="space-y-3">
                  {scores.explanations.map((e) => (
                    <li key={e.label} className="text-sm border-b border-pine/10 pb-3">
                      <p className="font-medium text-pine">
                        {e.label}: {e.value}
                      </p>
                      <p className="text-stone mt-1">{e.rationale}</p>
                      <p className="text-[11px] text-moss mt-1">
                        Inputs: {e.inputs.join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-stone">
                  Model {scores.modelVersion} · Rules {scores.rulesVersion}
                </p>
              </div>
            </section>

            <section className="grid lg:grid-cols-2 gap-5">
              <div className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">Policies & limits</h2>
                <ul className="space-y-3">
                  {business.policies.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-xl border border-pine/10 bg-white/50 p-3 text-sm"
                    >
                      <p className="font-medium text-pine">
                        {LOB_LABELS[p.line]} · {p.carrier.value}
                      </p>
                      <p className="text-stone mt-1">
                        Limit ${(p.limit.value ?? 0).toLocaleString()} · Deductible $
                        {(p.deductible.value ?? 0).toLocaleString()} · Exp{" "}
                        {p.expirationDate.value}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">
                  Claims / loss timeline
                </h2>
                <ul className="space-y-3">
                  {business.lossHistory.map((l) => (
                    <li key={l.id} className="text-sm">
                      <p className="text-pine font-medium">
                        {l.date} · {l.line.replace(/_/g, " ")}
                      </p>
                      <p className="text-stone">
                        {l.description}
                        {l.amount != null
                          ? ` · $${l.amount.toLocaleString()}`
                          : ""}{" "}
                        · {l.status}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="pw-panel p-5 space-y-3">
              <h2 className="font-display text-xl text-pine">Coverage gaps</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {gaps.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-pine/10 bg-white/60 p-4"
                  >
                    <p className="text-[11px] uppercase tracking-wider text-moss">
                      {g.severity} · {LOB_LABELS[g.line]}
                    </p>
                    <p className="font-medium text-pine mt-1">{g.title}</p>
                    <p className="text-sm text-stone mt-1">{g.rationale}</p>
                    <p className="text-[11px] text-moss mt-2">
                      Missing: {g.missingRequirements.join(", ")} · Confidence{" "}
                      {Math.round(g.confidence * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid lg:grid-cols-2 gap-5">
              <div className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">
                  Risk-mitigation recommendations
                </h2>
                <p className="text-xs text-stone">
                  Pending human approval before client or carrier delivery.
                </p>
                <ul className="space-y-3">
                  {mitigations.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-xl border border-pine/10 p-3 text-sm"
                    >
                      <p className="font-medium text-pine">{m.title}</p>
                      <p className="text-stone mt-1">{m.summary}</p>
                      <p className="text-[11px] text-moss mt-2">
                        {m.priority} · {m.humanReviewStatus} ·{" "}
                        {Math.round(m.confidence * 100)}% confidence
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">
                  Carrier appetite matches
                </h2>
                <p className="text-xs text-stone">
                  Illustrative fits only - never guaranteed eligibility or premium.
                </p>
                <ul className="space-y-3">
                  {appetiteMatches.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-xl border border-pine/10 p-3 text-sm"
                    >
                      <p className="font-medium text-pine">
                        {a.carrier} · {a.productOrCoverage}
                      </p>
                      <p className="text-stone mt-1">
                        Fit: {a.appetiteFit}
                        {a.financialStrength
                          ? ` · ${a.financialStrength.rating} (${a.financialStrength.source}, ${a.financialStrength.asOf})`
                          : ""}
                      </p>
                      <p className="text-[11px] text-moss mt-2">
                        Why: {a.matchReasons.join("; ")}
                      </p>
                      {a.nonFitReasons.length > 0 && (
                        <p className="text-[11px] text-danger mt-1">
                          Watch: {a.nonFitReasons.join("; ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="pw-panel p-5 space-y-3">
              <h2 className="font-display text-xl text-pine">
                Preliminary underwriting intelligence
              </h2>
              <p className="text-sm text-stone">{underwritingPreview.disclaimer}</p>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-stone">Risk tier</dt>
                  <dd className="text-pine font-medium">
                    {underwritingPreview.preliminaryRiskTier}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-stone">Pathway</dt>
                  <dd>{underwritingPreview.likelyPathway}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-stone">Missing requirements</dt>
                  <dd>
                    {underwritingPreview.missingRequirements.join(", ") || "None flagged"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-stone">Additional evidence</dt>
                  <dd>{underwritingPreview.additionalEvidenceNeeded.join(" · ")}</dd>
                </div>
              </dl>
            </section>

            <section className="pw-panel p-5">
              <h2 className="font-display text-xl text-pine">Locations</h2>
              <ul className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                {business.locations.map((loc) => (
                  <li key={loc.id} className="rounded-xl border border-pine/10 p-3">
                    <p className="font-medium text-pine">{loc.label}</p>
                    <p className="text-stone mt-1">
                      {loc.address}, {loc.city}, {loc.state} {loc.zip}
                    </p>
                    <p className="text-[11px] text-moss mt-1">
                      Employees {loc.employees ?? "—"} · Sq ft{" "}
                      {loc.squareFootage?.toLocaleString() ?? "—"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function MissingList({ fields }: { fields: string[] }) {
  if (!fields.length) {
    return <p className="text-sm text-ok">No critical commercial gaps listed.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2 pt-1">
      {fields.map((f) => (
        <li
          key={f}
          className="text-xs px-2.5 py-1 rounded-full bg-danger/10 text-danger"
        >
          Missing: {f}
        </li>
      ))}
    </ul>
  );
}
