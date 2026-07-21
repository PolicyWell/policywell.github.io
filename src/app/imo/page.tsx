"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppNav } from "@/components/ui";
import {
  buildImoAnalytics,
  buildImoSeed,
  generateAnnualReviewChecklist,
  type AdvisorRoster,
} from "@/lib/imo";
import { useSession } from "@/lib/use-workspace";

export default function ImoDashboardPage() {
  const session = useSession();
  const [rosters, setRosters] = useState<AdvisorRoster[] | null>(null);
  const [checklistClientId, setChecklistClientId] = useState<string | null>(null);

  const analytics = useMemo(
    () => (rosters ? buildImoAnalytics(rosters) : null),
    [rosters],
  );

  const allClients = useMemo(
    () => (rosters ? rosters.flatMap((r) => r.clients) : []),
    [rosters],
  );
  const checklistClient =
    allClients.find((c) => c.id === checklistClientId) ?? null;
  const checklist = useMemo(
    () => (checklistClient ? generateAnnualReviewChecklist(checklistClient) : null),
    [checklistClient],
  );

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please <Link href="/login" className="underline">sign in</Link>.
        </p>
      </div>
    );
  }

  if (session.role !== "imo") {
    return (
      <div className="flex-1 flex flex-col">
        <AppNav role={session.role} />
        <main className="pw-shell py-16">
          <h1 className="font-display text-4xl text-pine mb-3">IMO dashboard</h1>
          <p className="text-stone">
            This view is an IMO capability. Sign in as casey@imo.example to use it.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 space-y-8">
        <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-pine">IMO dashboard</h1>
            <p className="text-stone mt-2 max-w-2xl">
              Advisor activity, carrier analytics, and a standardized annual
              review pipeline — all derived from the deterministic score engine.
            </p>
          </div>
          <button
            type="button"
            className="pw-btn pw-btn-secondary"
            onClick={() => setRosters(buildImoSeed())}
          >
            {rosters ? "Reset demo data" : "Load demo data"}
          </button>
        </div>

        {!analytics ? (
          <p className="text-stone animate-rise-delay">
            No advisor data loaded — load the demo data to begin.
          </p>
        ) : (
          <>
            <section className="grid sm:grid-cols-4 gap-3 animate-rise-delay">
              <Stat label="Advisors" value={analytics.totals.advisors} />
              <Stat label="Clients" value={analytics.totals.clients} />
              <Stat label="Documents" value={analytics.totals.documents} />
              <Stat
                label="Verified"
                value={`${analytics.totals.verifiedDocuments}/${analytics.totals.documents}`}
              />
            </section>

            <section className="pw-panel p-6 animate-rise-delay">
              <h2 className="font-display text-2xl text-pine mb-4">Advisor activity</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-stone border-b border-pine/10">
                      <th className="py-2 pr-4 font-normal">Advisor</th>
                      <th className="py-2 pr-4 font-normal">Clients</th>
                      <th className="py-2 pr-4 font-normal">Docs ingested</th>
                      <th className="py-2 pr-4 font-normal">Verified rate</th>
                      <th className="py-2 pr-4 font-normal">Avg policy health</th>
                      <th className="py-2 font-normal">High-priority clients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.advisors.map((a) => (
                      <tr key={a.advisorName} className="border-b border-pine/5">
                        <td className="py-2 pr-4 text-ink font-medium">{a.advisorName}</td>
                        <td className="py-2 pr-4">{a.clientCount}</td>
                        <td className="py-2 pr-4">{a.documentsIngested}</td>
                        <td className="py-2 pr-4">{Math.round(a.verifiedRate * 100)}%</td>
                        <td className="py-2 pr-4">{a.avgPolicyHealth}</td>
                        <td className={`py-2 ${a.highPriorityClients ? "text-danger" : "text-ok"}`}>
                          {a.highPriorityClients}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-6">
              <section className="pw-panel p-6 animate-rise-delay space-y-3">
                <h2 className="font-display text-2xl text-pine">Carrier analytics</h2>
                {analytics.carrierDistribution.map((c) => {
                  const max = analytics.carrierDistribution[0].policies;
                  return (
                    <div key={c.carrier} className="flex items-center gap-3 text-sm">
                      <span className="w-44 text-stone">{c.carrier}</span>
                      <div className="score-bar flex-1">
                        <span style={{ width: `${(c.policies / max) * 100}%` }} />
                      </div>
                      <span className="w-6 text-right text-ink">{c.policies}</span>
                    </div>
                  );
                })}
              </section>

              <section className="pw-panel p-6 animate-rise-delay space-y-3">
                <h2 className="font-display text-2xl text-pine">Review pipeline</h2>
                <ul className="space-y-2 text-sm">
                  {analytics.reviewPipeline.map((item) => (
                    <li
                      key={`${item.advisorName}-${item.clientLabel}`}
                      className="flex items-center justify-between gap-3 border-b border-pine/5 pb-2"
                    >
                      <span className="text-ink">{item.clientLabel}</span>
                      <span className="text-stone text-xs">{item.advisorName}</span>
                      <StatusBadge status={item.status} score={item.reviewPriorityScore} />
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-stone">
                  {analytics.assumptions.join(" · ")}
                </p>
              </section>
            </div>

            <section className="pw-panel p-6 animate-rise-delay-2 space-y-4">
              <h2 className="font-display text-2xl text-pine">
                Standardized annual review checklist
              </h2>
              <div className="flex flex-wrap gap-2">
                {allClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChecklistClientId(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      c.id === checklistClientId
                        ? "bg-pine text-foam border-pine"
                        : "border-pine/15 text-stone hover:text-pine"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {checklist && checklistClient ? (
                <ul className="space-y-2">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                          item.done ? "bg-ok/15 text-ok" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {item.done ? "✓" : "!"}
                      </span>
                      <span>
                        <span className="text-ink font-medium">{item.label}</span>
                        <span className="block text-xs text-stone">{item.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone">Select a client to run the standardized checklist.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="pw-panel p-4">
      <div className="text-xs uppercase tracking-wider text-stone mb-1">{label}</div>
      <div className="font-display text-3xl text-pine">{value}</div>
    </div>
  );
}

function StatusBadge({ status, score }: { status: string; score: number }) {
  const tone =
    status === "overdue"
      ? "bg-danger/10 text-danger"
      : status === "due"
        ? "bg-amber/15 text-amber"
        : "bg-ok/10 text-ok";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${tone}`}>
      {status} · {score}
    </span>
  );
}
