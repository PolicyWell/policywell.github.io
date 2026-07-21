import type { Recommendation } from "./recommendations";

export type TaskStatus = "open" | "completed";

export interface FollowUpTask {
  id: string;
  title: string;
  sourceRecommendationId: string;
  rationale: string;
  dueDate: string; // ISO date
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

/** Days until due, per recommendation rule. Documented, deterministic. */
export const DUE_DAYS_BY_RULE: Record<string, number> = {
  rec_verify_docs: 7,
  rec_complete_profile: 7,
  rec_fund_to_target: 14,
  rec_loan_review: 21,
  rec_beneficiary: 21,
  rec_coverage_gap: 30,
  rec_schedule_review: 30,
};

const DEFAULT_DUE_DAYS = 14;

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Convert human-approved recommendations into dated follow-up tasks.
 * Only approved recommendations may become tasks (Manual §4: Human Approval
 * precedes action). Existing tasks for the same recommendation are preserved.
 */
export function tasksFromApprovedRecommendations(
  recommendations: Recommendation[],
  existing: FollowUpTask[] = [],
  now = new Date().toISOString(),
): FollowUpTask[] {
  const existingBySource = new Map(
    existing.map((t) => [t.sourceRecommendationId, t]),
  );
  const out: FollowUpTask[] = [...existing];

  for (const rec of recommendations) {
    if (rec.status !== "approved") continue;
    if (existingBySource.has(rec.id)) continue;
    const dueDays = DUE_DAYS_BY_RULE[rec.id] ?? DEFAULT_DUE_DAYS;
    out.push({
      id: `task_${rec.id}`,
      title: rec.title,
      sourceRecommendationId: rec.id,
      rationale: rec.rationale,
      dueDate: addDays(now, dueDays),
      status: "open",
      createdAt: now,
    });
  }

  return out.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function toggleTask(
  tasks: FollowUpTask[],
  id: string,
  now = new Date().toISOString(),
): FollowUpTask[] {
  return tasks.map((t) => {
    if (t.id !== id) return t;
    return t.status === "open"
      ? { ...t, status: "completed" as const, completedAt: now }
      : { ...t, status: "open" as const, completedAt: undefined };
  });
}

export function isOverdue(task: FollowUpTask, today = new Date().toISOString().slice(0, 10)): boolean {
  return task.status === "open" && task.dueDate < today;
}

export function taskSummary(tasks: FollowUpTask[], today?: string): {
  open: number;
  completed: number;
  overdue: number;
} {
  return {
    open: tasks.filter((t) => t.status === "open").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => isOverdue(t, today)).length,
  };
}
