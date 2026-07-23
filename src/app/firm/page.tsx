"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppNav } from "@/components/ui";
import {
  buildFirmAnalytics,
  buildFirmSeed,
  type FirmAdvisorBook,
} from "@/lib/firm";
import { assignTask, FIRM_ASSIGNEES, type FollowUpTask } from "@/lib/tasks";
import { persistTasks, useSession, useTasks } from "@/lib/use-workspace";

export default function FirmPage() {
  const session = useSession();
  const workspaceTasks = useTasks();
  const [books, setBooks] = useState<FirmAdvisorBook[] | null>(null);
  const [seedTasks, setSeedTasks] = useState<FollowUpTask[] | null>(null);

  const tasks = seedTasks ?? workspaceTasks;
  const analytics = useMemo(
    () => (books ? buildFirmAnalytics(books, tasks) : null),
    [books, tasks],
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

  if (session.role !== "broker_dealer" && session.role !== "imo") {
    return (
      <div className="flex-1 flex flex-col">
        <AppNav role={session.role} />
        <main className="pw-shell py-16">
          <h1 className="font-display text-4xl text-pine mb-3">
            Firm / broker-dealer
          </h1>
          <p className="text-stone max-w-xl">
            This view is for broker-dealer and financial-institution supervision.
            Sign in as riley@firm.example to load the partner firm console.
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
            <h1 className="font-display text-4xl text-pine">
              Firm supervision
            </h1>
            <p className="text-stone mt-2 max-w-2xl">
              Broker-dealer / FI view across advisor books: household coverage,
              suitability flags, and owned follow-up tasks — all from the same
              deterministic PolicyWell engines.
            </p>
          </div>
          <button
            type="button"
            className="pw-btn pw-btn-secondary"
            onClick={() => {
              const seed = buildFirmSeed();
              setBooks(seed.advisors);
              setSeedTasks(seed.tasks);
              persistTasks(seed.tasks);
            }}
          >
            {books ? "Reset sample firm" : "Load sample firm"}
          </button>
        </div>

        {!analytics ? (
          <p className="text-stone animate-rise-delay">
            Load the firm demo to see advisor books, the suitability queue, and
            the assignment board.
          </p>
        ) : (
          <>
            <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 animate-rise-delay">
              <Stat label="Advisors" value={analytics.totals.advisors} />
              <Stat label="Households" value={analytics.totals.households} />
              <Stat label="Open tasks" value={analytics.totals.openTasks} />
              <Stat
                label="Overdue"
                value={analytics.totals.overdueTasks}
                tone={analytics.totals.overdueTasks ? "warn" : undefined}
              />
              <Stat
                label="Unassigned"
                value={analytics.totals.unassignedTasks}
                tone={analytics.totals.unassignedTasks ? "warn" : undefined}
              />
              <Stat
                label="Suitability flags"
                value={analytics.totals.suitabilityFlags}
              />
            </section>

            <section className="space-y-3 animate-rise-delay">
              <h2 className="font-display text-2xl text-pine">Advisor books</h2>
              <ul className="space-y-3">
                {analytics.advisors.map((book) => (
                  <li key={book.advisor.id} className="pw-panel p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-ink">
                          {book.advisor.name}
                        </div>
                        <div className="text-xs text-stone mt-1">
                          {book.advisor.email} · {book.households} households ·
                          avg policy health {book.avgPolicyHealth}
                        </div>
                      </div>
                      <div className="text-xs text-stone">
                        {book.openTasks} open · {book.overdueTasks} overdue
                      </div>
                    </div>
                    {book.clients.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-stone">
                        {book.clients.map((c) => (
                          <li key={c.id}>
                            <span className="text-ink">{c.label}</span> —{" "}
                            {c.summary}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3 animate-rise-delay">
              <h2 className="font-display text-2xl text-pine">
                Assignment board
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {analytics.taskBoard.map((row) => (
                  <div key={row.assigneeName} className="pw-panel p-4">
                    <div className="text-sm font-medium text-ink">
                      {row.assigneeName}
                    </div>
                    <div className="text-xs text-stone mt-1">
                      {row.open} open · {row.overdue} overdue
                    </div>
                  </div>
                ))}
              </div>
              <ul className="space-y-3 pt-2">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="pw-panel p-4 flex flex-wrap items-center gap-3 justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">
                        {t.title}
                      </div>
                      <div className="text-xs text-stone mt-1">
                        due {t.dueDate} · {t.rationale}
                      </div>
                    </div>
                    <label className="text-xs text-stone flex items-center gap-2">
                      Owner
                      <select
                        className="pw-input !py-1.5 !text-xs !w-auto"
                        value={t.assigneeId ?? ""}
                        onChange={(e) => {
                          const id = e.target.value;
                          const assignee =
                            FIRM_ASSIGNEES.find((a) => a.id === id) ?? null;
                          const next = assignTask(tasks, t.id, assignee);
                          setSeedTasks(next);
                          persistTasks(next);
                        }}
                      >
                        <option value="">Unassigned</option>
                        {FIRM_ASSIGNEES.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3 animate-rise-delay">
              <h2 className="font-display text-2xl text-pine">
                Suitability & compliance queue
              </h2>
              {analytics.suitabilityQueue.length === 0 ? (
                <p className="text-sm text-ok">No open suitability flags.</p>
              ) : (
                <ul className="space-y-2">
                  {analytics.suitabilityQueue.map((f, i) => (
                    <li
                      key={`${f.clientId}_${i}`}
                      className="pw-panel p-4 text-sm"
                    >
                      <div className="flex flex-wrap gap-2 items-center justify-between">
                        <span className="font-medium text-ink">
                          {f.clientName}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                            f.severity === "warning"
                              ? "bg-danger/10 text-danger"
                              : "bg-moss/15 text-moss"
                          }`}
                        >
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-stone mt-1">{f.message}</p>
                      <p className="text-xs text-stone mt-1">
                        Advisor: {f.advisorName}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warn";
}) {
  return (
    <div className="pw-panel p-4">
      <div className="text-xs uppercase tracking-wider text-stone mb-1">
        {label}
      </div>
      <div
        className={`font-display text-3xl ${
          tone === "warn" ? "text-danger" : "text-pine"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
