import { describe, expect, it } from "vitest";
import { buildFirmAnalytics, buildFirmSeed, firmDemoUser } from "./firm";
import { assignTask, FIRM_ASSIGNEES } from "./tasks";

describe("firm / broker-dealer supervision", () => {
  it("seeds advisor books with households and sample owned tasks", () => {
    const { advisors, tasks } = buildFirmSeed();
    expect(advisors.length).toBe(3);
    expect(advisors.reduce((n, b) => n + b.households, 0)).toBe(3);
    expect(tasks.some((t) => t.assigneeId === "adv_jordan")).toBe(true);
    expect(tasks.some((t) => !t.assigneeId)).toBe(true);
  });

  it("builds firm analytics with suitability queue and assignment board", () => {
    const { advisors, tasks } = buildFirmSeed();
    const analytics = buildFirmAnalytics(advisors, tasks);
    expect(analytics.totals.advisors).toBe(3);
    expect(analytics.totals.households).toBe(3);
    expect(analytics.totals.openTasks).toBe(tasks.filter((t) => t.status === "open").length);
    expect(analytics.totals.unassignedTasks).toBeGreaterThanOrEqual(1);
    expect(analytics.suitabilityQueue.length).toBeGreaterThan(0);
    expect(analytics.taskBoard.some((r) => r.assigneeName === "Unassigned")).toBe(
      true,
    );
  });

  it("reassigns firm tasks and updates unassigned totals", () => {
    const { advisors, tasks } = buildFirmSeed();
    const unassigned = tasks.find((t) => !t.assigneeId)!;
    const devon = FIRM_ASSIGNEES.find((a) => a.id === "adv_devon")!;
    const next = assignTask(tasks, unassigned.id, devon);
    const analytics = buildFirmAnalytics(advisors, next);
    expect(analytics.totals.unassignedTasks).toBe(0);
    expect(
      analytics.taskBoard.find((r) => r.assigneeId === "adv_devon")?.open,
    ).toBeGreaterThanOrEqual(1);
  });

  it("exposes a broker-dealer demo user", () => {
    const user = firmDemoUser();
    expect(user.role).toBe("broker_dealer");
    expect(user.email).toBe("riley@firm.example");
  });
});
