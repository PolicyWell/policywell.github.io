import { comparePolicies } from "./comparison";
import type { ClientRecord } from "./clients";
import { buildAdvisorRoster } from "./clients";
import { computePolicyWellScores } from "./scoring";
import {
  FIRM_ASSIGNEES,
  isOverdue,
  taskSummary,
  type FollowUpTask,
  type FirmAssignee,
} from "./tasks";
import type { SessionUser } from "./types";

export interface FirmAdvisorBook {
  advisor: FirmAssignee;
  clients: ClientRecord[];
  openTasks: number;
  overdueTasks: number;
  households: number;
  avgPolicyHealth: number;
}

export interface SuitabilityFlag {
  clientId: string;
  clientName: string;
  advisorName: string;
  severity: "info" | "warning";
  message: string;
}

export interface FirmAnalytics {
  firmName: string;
  advisors: FirmAdvisorBook[];
  totals: {
    advisors: number;
    households: number;
    openTasks: number;
    overdueTasks: number;
    unassignedTasks: number;
    suitabilityFlags: number;
  };
  suitabilityQueue: SuitabilityFlag[];
  taskBoard: {
    assigneeId: string | null;
    assigneeName: string;
    open: number;
    overdue: number;
  }[];
}

/** Seeded firm books: three advisors with the Sprint 2 client households. */
export function buildFirmSeed(): {
  advisors: FirmAdvisorBook[];
  tasks: FollowUpTask[];
} {
  const seedClients = buildAdvisorRoster();
  const jordan = FIRM_ASSIGNEES.find((a) => a.id === "adv_jordan")!;
  const samira = FIRM_ASSIGNEES.find((a) => a.id === "adv_samira")!;
  const devon = FIRM_ASSIGNEES.find((a) => a.id === "adv_devon")!;

  const books: FirmAdvisorBook[] = [
    {
      advisor: jordan,
      clients: seedClients.slice(0, 2),
      openTasks: 0,
      overdueTasks: 0,
      households: 2,
      avgPolicyHealth: 0,
    },
    {
      advisor: samira,
      clients: seedClients.slice(2, 3),
      openTasks: 0,
      overdueTasks: 0,
      households: 1,
      avgPolicyHealth: 0,
    },
    {
      advisor: devon,
      clients: [],
      openTasks: 0,
      overdueTasks: 0,
      households: 0,
      avgPolicyHealth: 0,
    },
  ];

  const now = "2026-07-21T12:00:00.000Z";
  const tasks: FollowUpTask[] = [
    {
      id: "firm_task_fund",
      title: "Fund IUL to target premium",
      sourceRecommendationId: "rec_fund_to_target",
      rationale: "Current premium below target on Alex Rivera IUL.",
      dueDate: "2026-08-04",
      status: "open",
      createdAt: now,
      assigneeId: jordan.id,
      assigneeName: jordan.name,
      assignedAt: now,
    },
    {
      id: "firm_task_verify",
      title: "Verify in-force ledger",
      sourceRecommendationId: "rec_verify_docs",
      rationale: "Document confidence below firm threshold.",
      dueDate: "2026-07-28",
      status: "open",
      createdAt: now,
      assigneeId: samira.id,
      assigneeName: samira.name,
      assignedAt: now,
    },
    {
      id: "firm_task_review",
      title: "Schedule annual review",
      sourceRecommendationId: "rec_schedule_review",
      rationale: "No review on file in the last 12 months.",
      dueDate: "2026-07-15",
      status: "open",
      createdAt: now,
      assigneeId: null,
      assigneeName: null,
    },
  ];

  return { advisors: enrichBooks(books, tasks), tasks };
}

function enrichBooks(
  books: FirmAdvisorBook[],
  tasks: FollowUpTask[],
): FirmAdvisorBook[] {
  return books.map((book) => {
    const mine = tasks.filter((t) => t.assigneeId === book.advisor.id);
    const healthScores = book.clients.map(
      (c) => computePolicyWellScores(c.profile, c.documents).policyHealthScore,
    );
    const avgPolicyHealth = healthScores.length
      ? Math.round(
          healthScores.reduce((a, b) => a + b, 0) / healthScores.length,
        )
      : 0;
    return {
      ...book,
      households: book.clients.length,
      openTasks: mine.filter((t) => t.status === "open").length,
      overdueTasks: mine.filter((t) => isOverdue(t)).length,
      avgPolicyHealth,
    };
  });
}

export function buildFirmAnalytics(
  books: FirmAdvisorBook[],
  tasks: FollowUpTask[],
  firmName = "PolicyWell Partner Firm",
): FirmAnalytics {
  const enriched = enrichBooks(books, tasks);
  const summary = taskSummary(tasks);
  const suitabilityQueue = collectSuitabilityFlags(enriched);

  const boardMap = new Map<
    string,
    {
      assigneeId: string | null;
      assigneeName: string;
      open: number;
      overdue: number;
    }
  >();
  for (const a of FIRM_ASSIGNEES.filter((x) => x.role === "advisor")) {
    boardMap.set(a.id, {
      assigneeId: a.id,
      assigneeName: a.name,
      open: 0,
      overdue: 0,
    });
  }
  boardMap.set("__unassigned__", {
    assigneeId: null,
    assigneeName: "Unassigned",
    open: 0,
    overdue: 0,
  });
  for (const t of tasks) {
    const key = t.assigneeId ?? "__unassigned__";
    const row = boardMap.get(key) ?? {
      assigneeId: t.assigneeId ?? null,
      assigneeName: t.assigneeName ?? "Unassigned",
      open: 0,
      overdue: 0,
    };
    if (t.status === "open") row.open += 1;
    if (isOverdue(t)) row.overdue += 1;
    boardMap.set(key, row);
  }

  return {
    firmName,
    advisors: enriched,
    totals: {
      advisors: enriched.length,
      households: enriched.reduce((n, b) => n + b.households, 0),
      openTasks: summary.open,
      overdueTasks: summary.overdue,
      unassignedTasks: summary.unassigned,
      suitabilityFlags: suitabilityQueue.length,
    },
    suitabilityQueue,
    taskBoard: [...boardMap.values()].sort((a, b) => {
      if (a.assigneeId == null) return 1;
      if (b.assigneeId == null) return -1;
      return a.assigneeName.localeCompare(b.assigneeName);
    }),
  };
}

function collectSuitabilityFlags(books: FirmAdvisorBook[]): SuitabilityFlag[] {
  const flags: SuitabilityFlag[] = [];
  for (const book of books) {
    for (const client of book.clients) {
      const docs = client.documents ?? [];
      if (docs.length >= 2) {
        const comparison = comparePolicies(docs[0], docs[1], client.profile);
        for (const w of comparison.warnings) {
          flags.push({
            clientId: client.id,
            clientName: client.profile.displayName,
            advisorName: book.advisor.name,
            severity: "warning",
            message: w,
          });
        }
      }
      const scores = computePolicyWellScores(client.profile, docs);
      if (scores.reviewPriorityScore >= 70) {
        flags.push({
          clientId: client.id,
          clientName: client.profile.displayName,
          advisorName: book.advisor.name,
          severity: "info",
          message: `Review priority ${scores.reviewPriorityScore} — schedule compliance check.`,
        });
      }
      const unverified = docs.filter((d) => !d.verified).length;
      if (unverified > 0) {
        flags.push({
          clientId: client.id,
          clientName: client.profile.displayName,
          advisorName: book.advisor.name,
          severity: "warning",
          message: `${unverified} unverified document(s) on file.`,
        });
      }
    }
  }
  return flags;
}

export function firmDemoUser(): SessionUser {
  return {
    id: "user_riley",
    email: "riley@firm.example",
    name: "Riley Quinn",
    role: "broker_dealer",
  };
}
