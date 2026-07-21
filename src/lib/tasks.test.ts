import { describe, expect, it } from "vitest";
import {
  generateMeetingPrep,
  meetingPrepToMarkdown,
} from "@/lib/meeting-prep";
import {
  decideRecommendation,
  generateRecommendations,
} from "@/lib/recommendations";
import { buildDemoSeed } from "@/lib/seed";
import {
  assignTask,
  DUE_DAYS_BY_RULE,
  FIRM_ASSIGNEES,
  isOverdue,
  taskSummary,
  tasksFromApprovedRecommendations,
  tasksGroupedByAssignee,
  toggleTask,
} from "@/lib/tasks";

const NOW = "2026-07-21T12:00:00.000Z";

function approvedRecs() {
  const { profile, documents } = buildDemoSeed();
  let recs = generateRecommendations(profile, documents);
  for (const r of recs) {
    recs = decideRecommendation(recs, r.id, "approved");
  }
  return { recs, profile, documents };
}

describe("follow-up task workflow", () => {
  it("creates dated tasks only from approved recommendations", () => {
    const { profile, documents } = buildDemoSeed();
    const pending = generateRecommendations(profile, documents);
    expect(tasksFromApprovedRecommendations(pending, [], NOW)).toHaveLength(0);

    const { recs } = approvedRecs();
    const tasks = tasksFromApprovedRecommendations(recs, [], NOW);
    expect(tasks.length).toBe(recs.length);
    for (const t of tasks) {
      expect(t.status).toBe("open");
      expect(t.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.assigneeId ?? null).toBeNull();
    }
    // Sorted by due date ascending
    const dates = tasks.map((t) => t.dueDate);
    expect([...dates].sort()).toEqual(dates);
  });

  it("applies documented per-rule due timelines", () => {
    const { recs } = approvedRecs();
    const tasks = tasksFromApprovedRecommendations(recs, [], NOW);
    const fund = tasks.find((t) => t.sourceRecommendationId === "rec_fund_to_target");
    expect(fund).toBeTruthy();
    expect(fund!.dueDate).toBe("2026-08-04"); // +14 days
    expect(DUE_DAYS_BY_RULE.rec_verify_docs).toBe(7);
  });

  it("is idempotent — regenerating preserves existing tasks", () => {
    const { recs } = approvedRecs();
    const first = tasksFromApprovedRecommendations(recs, [], NOW);
    const second = tasksFromApprovedRecommendations(recs, first, NOW);
    expect(second).toHaveLength(first.length);
  });

  it("toggles completion and tracks overdue", () => {
    const { recs } = approvedRecs();
    let tasks = tasksFromApprovedRecommendations(recs, [], NOW);
    const id = tasks[0].id;
    tasks = toggleTask(tasks, id, NOW);
    expect(tasks.find((t) => t.id === id)!.status).toBe("completed");
    tasks = toggleTask(tasks, id, NOW);
    expect(tasks.find((t) => t.id === id)!.status).toBe("open");

    expect(isOverdue(tasks[0], "2030-01-01")).toBe(true);
    expect(isOverdue(tasks[0], "2026-07-21")).toBe(false);
    const summary = taskSummary(tasks, "2030-01-01");
    expect(summary.overdue).toBe(tasks.length);
  });

  it("assigns ownership across the firm roster", () => {
    const { recs } = approvedRecs();
    let tasks = tasksFromApprovedRecommendations(recs, [], NOW);
    const id = tasks[0].id;
    const jordan = FIRM_ASSIGNEES.find((a) => a.id === "adv_jordan")!;
    tasks = assignTask(tasks, id, jordan, NOW);
    expect(tasks.find((t) => t.id === id)!.assigneeId).toBe("adv_jordan");
    expect(tasks.find((t) => t.id === id)!.assigneeName).toBe("Jordan Lee");
    expect(taskSummary(tasks).unassigned).toBe(tasks.length - 1);

    tasks = assignTask(tasks, id, null, NOW);
    expect(tasks.find((t) => t.id === id)!.assigneeId).toBeNull();
    expect(tasksGroupedByAssignee(tasks).some((g) => g.assigneeId == null)).toBe(
      true,
    );
  });
});

describe("meeting preparation pack", () => {
  it("builds pack from context with only approved recommendations", () => {
    const { profile, documents } = buildDemoSeed();
    let recs = generateRecommendations(profile, documents);
    recs = decideRecommendation(recs, recs[0].id, "approved");
    recs = decideRecommendation(recs, recs[1].id, "rejected");

    const pack = generateMeetingPrep(profile, documents, recs);
    expect(pack.clientName).toBe(profile.displayName);
    expect(pack.approvedRecommendations).toHaveLength(1);
    expect(pack.agenda.length).toBeGreaterThan(3);
    expect(pack.scenarioSummary.length).toBe(3);
    expect(pack.documentsOnFile[0]).toMatch(/Mutual/i);
    expect(pack.assumptions.length).toBeGreaterThan(0);
  });

  it("exports well-formed markdown", () => {
    const { recs, profile, documents } = approvedRecs();
    const tasks = tasksFromApprovedRecommendations(recs, [], NOW);
    const pack = generateMeetingPrep(profile, documents, recs, tasks);
    const md = meetingPrepToMarkdown(pack);

    expect(md).toContain(`# Meeting preparation — ${profile.displayName}`);
    expect(md).toContain("## Agenda");
    expect(md).toContain("## Approved recommendations");
    expect(md).toContain("- [ ] ");
    expect(md).toContain("## Funding scenarios");
    expect(md).toContain("human approval");
  });
});
