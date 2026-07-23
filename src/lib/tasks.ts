import type { Recommendation } from "./recommendations";

export type TaskStatus = "open" | "completed";

export interface FirmAssignee {
  id: string;
  name: string;
  email: string;
  role: "advisor" | "ops";
}

/** Seeded multi-advisor firm roster for assignment demos. */
export const FIRM_ASSIGNEES: FirmAssignee[] = [
  {
    id: "adv_jordan",
    name: "Jordan Lee",
    email: "jordan@advisors.example",
    role: "advisor",
  },
  {
    id: "adv_samira",
    name: "Samira Ortiz",
    email: "samira@advisors.example",
    role: "advisor",
  },
  {
    id: "adv_devon",
    name: "Devon Park",
    email: "devon@advisors.example",
    role: "advisor",
  },
  {
    id: "ops_riley",
    name: "Riley Quinn",
    email: "riley@firm.example",
    role: "ops",
  },
];

export interface FollowUpTask {
  id: string;
  title: string;
  sourceRecommendationId: string;
  rationale: string;
  dueDate: string; // ISO date
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  /** Firm ownership - who is accountable for follow-through. */
  assigneeId?: string | null;
  assigneeName?: string | null;
  assignedAt?: string;
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
      assigneeId: null,
      assigneeName: null,
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

/** Assign (or clear) ownership on a follow-up task. */
export function assignTask(
  tasks: FollowUpTask[],
  taskId: string,
  assignee: FirmAssignee | null,
  now = new Date().toISOString(),
): FollowUpTask[] {
  return tasks.map((t) => {
    if (t.id !== taskId) return t;
    if (!assignee) {
      return {
        ...t,
        assigneeId: null,
        assigneeName: null,
        assignedAt: undefined,
      };
    }
    return {
      ...t,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      assignedAt: now,
    };
  });
}

export function isOverdue(
  task: FollowUpTask,
  today = new Date().toISOString().slice(0, 10),
): boolean {
  return task.status === "open" && task.dueDate < today;
}

export function taskSummary(
  tasks: FollowUpTask[],
  today?: string,
): {
  open: number;
  completed: number;
  overdue: number;
  unassigned: number;
} {
  return {
    open: tasks.filter((t) => t.status === "open").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => isOverdue(t, today)).length,
    unassigned: tasks.filter((t) => t.status === "open" && !t.assigneeId)
      .length,
  };
}

export function tasksGroupedByAssignee(tasks: FollowUpTask[]): {
  assigneeId: string | null;
  assigneeName: string;
  tasks: FollowUpTask[];
  open: number;
  overdue: number;
}[] {
  const groups = new Map<
    string,
    {
      assigneeId: string | null;
      assigneeName: string;
      tasks: FollowUpTask[];
    }
  >();

  for (const t of tasks) {
    const key = t.assigneeId ?? "__unassigned__";
    const existing = groups.get(key);
    if (existing) {
      existing.tasks.push(t);
    } else {
      groups.set(key, {
        assigneeId: t.assigneeId ?? null,
        assigneeName: t.assigneeName ?? "Unassigned",
        tasks: [t],
      });
    }
  }

  return [...groups.values()]
    .map((g) => ({
      ...g,
      open: g.tasks.filter((t) => t.status === "open").length,
      overdue: g.tasks.filter((t) => isOverdue(t)).length,
    }))
    .sort((a, b) => {
      if (a.assigneeId == null) return 1;
      if (b.assigneeId == null) return -1;
      return a.assigneeName.localeCompare(b.assigneeName);
    });
}
