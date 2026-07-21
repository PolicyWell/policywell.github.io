"use client";

import Link from "next/link";
import { AppNav } from "@/components/ui";
import {
  assignTask,
  FIRM_ASSIGNEES,
  isOverdue,
  taskSummary,
  tasksFromApprovedRecommendations,
  toggleTask,
} from "@/lib/tasks";
import {
  persistTasks,
  useRecommendations,
  useSession,
  useTasks,
} from "@/lib/use-workspace";

export default function TasksPage() {
  const session = useSession();
  const recommendations = useRecommendations();
  const tasks = useTasks();

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please <Link href="/login" className="underline">sign in</Link>.
        </p>
      </div>
    );
  }

  const summary = taskSummary(tasks);
  const approvedCount = recommendations.filter((r) => r.status === "approved").length;
  const newAvailable =
    approvedCount >
    tasks.filter((t) => recommendations.some((r) => r.id === t.sourceRecommendationId)).length;
  const canAssign =
    session.role === "advisor" ||
    session.role === "imo" ||
    session.role === "broker_dealer";

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 space-y-8">
        <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-pine">Follow-up tasks</h1>
            <p className="text-stone mt-2 max-w-2xl">
              Approved recommendations become dated tasks. Assign ownership across
              the firm roster so follow-through is accountable.
            </p>
          </div>
          <button
            type="button"
            className="pw-btn"
            disabled={approvedCount === 0}
            onClick={() =>
              persistTasks(tasksFromApprovedRecommendations(recommendations, tasks))
            }
          >
            Generate from approved ({approvedCount})
          </button>
        </div>

        <section className="grid sm:grid-cols-4 gap-3 animate-rise-delay">
          <Stat label="Open" value={summary.open} />
          <Stat label="Overdue" value={summary.overdue} tone={summary.overdue ? "warn" : undefined} />
          <Stat
            label="Unassigned"
            value={summary.unassigned}
            tone={summary.unassigned ? "warn" : undefined}
          />
          <Stat label="Completed" value={summary.completed} />
        </section>

        {tasks.length === 0 ? (
          <p className="text-stone animate-rise-delay">
            No tasks yet.{" "}
            {approvedCount === 0 ? (
              <>
                Approve recommendations in the{" "}
                <Link href="/workspace" className="underline">workspace</Link> first.
              </>
            ) : (
              "Generate them from your approved recommendations."
            )}
          </p>
        ) : (
          <ul className="space-y-3 animate-rise-delay">
            {tasks.map((t) => {
              const overdue = isOverdue(t);
              return (
                <li
                  key={t.id}
                  className="pw-panel p-4 flex flex-wrap items-start gap-4"
                >
                  <input
                    type="checkbox"
                    className="mt-1.5 h-4 w-4 accent-[var(--pine)]"
                    checked={t.status === "completed"}
                    onChange={() => persistTasks(toggleTask(tasks, t.id))}
                    aria-label={`Toggle ${t.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-medium ${
                        t.status === "completed" ? "text-stone line-through" : "text-ink"
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-xs text-stone mt-1">{t.rationale}</div>
                    {canAssign && (
                      <label className="mt-2 inline-flex items-center gap-2 text-xs text-stone">
                        Owner
                        <select
                          className="pw-input !py-1 !text-xs !w-auto"
                          value={t.assigneeId ?? ""}
                          onChange={(e) => {
                            const id = e.target.value;
                            const assignee =
                              FIRM_ASSIGNEES.find((a) => a.id === id) ?? null;
                            persistTasks(assignTask(tasks, t.id, assignee));
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
                    )}
                    {!canAssign && t.assigneeName && (
                      <div className="text-xs text-moss mt-2">
                        Owner: {t.assigneeName}
                      </div>
                    )}
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs ${
                      t.status === "completed"
                        ? "bg-ok/10 text-ok"
                        : overdue
                          ? "bg-danger/10 text-danger"
                          : "bg-mist text-stone"
                    }`}
                  >
                    {t.status === "completed" ? "done" : overdue ? `overdue · ${t.dueDate}` : `due ${t.dueDate}`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {newAvailable && tasks.length > 0 && (
          <p className="text-xs text-stone">
            New approved recommendations are available — generate again to add them (existing tasks are preserved).
          </p>
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
      <div className="text-xs uppercase tracking-wider text-stone mb-1">{label}</div>
      <div className={`font-display text-3xl ${tone === "warn" ? "text-danger" : "text-pine"}`}>
        {value}
      </div>
    </div>
  );
}
