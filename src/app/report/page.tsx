"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppNav } from "@/components/ui";
import { generateAgentReport } from "@/lib/context-engine";
import {
  generateMeetingPrep,
  meetingPrepToMarkdown,
} from "@/lib/meeting-prep";
import { approvedForReport } from "@/lib/recommendations";
import {
  useDocuments,
  useProfile,
  useRecommendations,
  useSession,
  useTasks,
} from "@/lib/use-workspace";

export default function ReportPage() {
  const session = useSession();
  const profile = useProfile();
  const docs = useDocuments();

  const recommendations = useRecommendations();
  const tasks = useTasks();
  const approved = approvedForReport(recommendations);
  const pendingCount = recommendations.filter((r) => r.status === "pending").length;

  function downloadMeetingPrep() {
    if (!profile) return;
    const pack = generateMeetingPrep(profile, docs, recommendations, tasks);
    const md = meetingPrepToMarkdown(pack);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-prep-${profile.displayName.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const report = useMemo(
    () => (profile ? generateAgentReport(profile, docs) : null),
    [profile, docs],
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

  if (!profile || !report) {
    return (
      <div className="flex-1 flex flex-col">
        <AppNav role={session.role} />
        <main className="pw-shell py-16">
          <h1 className="font-display text-4xl text-pine mb-3">Reports</h1>
          <p className="text-stone mb-6">Complete onboarding or open the product demo first.</p>
          <Link href="/demo" className="pw-btn">Product demo</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 space-y-6">
        <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-pine">Meeting preparation</h1>
            <p className="text-stone mt-2">
              Advisor receives client summary, advisor summary, questions, warnings, and recommended follow-up.
            </p>
            <p className="text-xs text-stone mt-1">
              Generated {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
          <button type="button" className="pw-btn" onClick={downloadMeetingPrep}>
            Download meeting pack (.md)
          </button>
        </div>

        <section className="pw-panel p-6 animate-rise-delay">
          <h2 className="font-display text-2xl text-pine mb-3">Client summary</h2>
          <p className="text-ink leading-relaxed">{report.clientSummary}</p>
        </section>

        <section className="pw-panel p-6 animate-rise-delay">
          <h2 className="font-display text-2xl text-pine mb-3">Advisor summary</h2>
          <p className="text-ink leading-relaxed">{report.advisorSummary}</p>
        </section>

        <div className="grid md:grid-cols-3 gap-5">
          <ListBlock title="Questions" items={report.questions} />
          <ListBlock title="Warnings" items={report.warnings} tone="warn" />
          <ListBlock title="Recommended follow-up" items={report.recommendedFollowUp} />
        </div>

        <section className="pw-panel p-6 animate-rise-delay-2">
          <h2 className="font-display text-2xl text-pine mb-2">
            Approved recommendations
          </h2>
          <p className="text-xs text-stone mb-4">
            Only human-approved recommendations appear here.
            {pendingCount > 0 && (
              <> {pendingCount} pending item{pendingCount === 1 ? "" : "s"} await approval in the workspace.</>
            )}
          </p>
          {approved.length === 0 ? (
            <p className="text-sm text-stone">
              No approved recommendations yet — review the queue in the{" "}
              <Link href="/workspace" className="underline">workspace</Link>.
            </p>
          ) : (
            <ul className="space-y-3">
              {approved.map((r) => (
                <li key={r.id} className="text-sm">
                  <span className="text-ink font-medium">{r.title}</span>
                  <span className="block text-xs text-stone mt-0.5">{r.rationale}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "warn";
}) {
  return (
    <section className="pw-panel p-5 animate-rise-delay-2">
      <h3 className="font-display text-xl text-pine mb-3">{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.length ? (
          items.map((item) => (
            <li
              key={item}
              className={tone === "warn" ? "text-danger" : "text-stone"}
            >
              {item}
            </li>
          ))
        ) : (
          <li className="text-stone">None</li>
        )}
      </ul>
    </section>
  );
}
