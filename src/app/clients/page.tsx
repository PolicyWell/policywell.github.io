"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/ui";
import { buildAdvisorRoster } from "@/lib/clients";
import { computePolicyWellScores } from "@/lib/scoring";
import {
  activateClient,
  persistClients,
  useActiveClientId,
  useClients,
  useSession,
} from "@/lib/use-workspace";

export default function ClientsPage() {
  const router = useRouter();
  const session = useSession();
  const clients = useClients();
  const activeId = useActiveClientId();

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please <Link href="/login" className="underline">sign in</Link>.
        </p>
      </div>
    );
  }

  if (session.role !== "advisor" && session.role !== "imo") {
    return (
      <div className="flex-1 flex flex-col">
        <AppNav role={session.role} />
        <main className="pw-shell py-16">
          <h1 className="font-display text-4xl text-pine mb-3">Clients</h1>
          <p className="text-stone">
            The client roster is an advisor capability. Sign in as
            jordan@advisors.example to use it.
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
            <h1 className="font-display text-4xl text-pine">Client roster</h1>
            <p className="text-stone mt-2 max-w-2xl">
              Select a household to load its full context — profile, documents,
              scores — into the shared intelligence workspace.
            </p>
          </div>
          <button
            type="button"
            className="pw-btn pw-btn-secondary"
            onClick={() => persistClients(buildAdvisorRoster())}
          >
            {clients.length ? "Reset sample roster" : "Load sample roster"}
          </button>
        </div>

        {!clients.length ? (
          <p className="text-stone animate-rise-delay">
            No clients yet — load the demo roster to begin.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-5 animate-rise-delay">
            {clients.map((c) => {
              const scores = computePolicyWellScores(c.profile, c.documents);
              const isActive = c.id === activeId;
              return (
                <div
                  key={c.id}
                  className={`pw-panel p-5 flex flex-col gap-3 ${
                    isActive ? "ring-2 ring-moss" : ""
                  }`}
                >
                  <div>
                    <h2 className="font-display text-2xl text-pine">{c.label}</h2>
                    <p className="text-sm text-stone mt-1">{c.summary}</p>
                  </div>
                  <div className="text-sm space-y-1">
                    <ScoreLine label="Overall" value={scores.overallIntelligenceScore} />
                    <ScoreLine label="Policy health" value={scores.policyHealthScore} />
                    <ScoreLine label="Review priority" value={scores.reviewPriorityScore} />
                  </div>
                  <div className="text-xs text-stone">
                    {c.documents.length} document{c.documents.length === 1 ? "" : "s"} ·{" "}
                    {c.documents.filter((d) => d.verified).length} verified
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="pw-btn !py-2 text-sm"
                      onClick={() => {
                        activateClient(c);
                        router.push("/workspace");
                      }}
                    >
                      Open workspace
                    </button>
                    <button
                      type="button"
                      className="pw-btn pw-btn-secondary !py-2 text-sm"
                      onClick={() => {
                        activateClient(c);
                        router.push("/report");
                      }}
                    >
                      Report
                    </button>
                  </div>
                  {isActive && (
                    <p className="text-xs text-ok">Active in workspace</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-stone w-28">{label}</span>
      <div className="score-bar flex-1">
        <span style={{ width: `${value}%` }} />
      </div>
      <span className="text-ink w-8 text-right">{value}</span>
    </div>
  );
}
