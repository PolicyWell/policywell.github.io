import { describe, expect, it } from "vitest";
import { runAgentTurn } from "@/lib/agent";
import { createEmptyProfile } from "@/lib/profile";
import { buildDemoSeed } from "@/lib/seed";
import type { AgentWorkspace } from "@/lib/agent/tools";

function emptyWorkspace(): AgentWorkspace {
  const user = {
    id: "u1",
    email: "a@x.com",
    name: "Alex Rivera",
    role: "policyholder" as const,
  };
  return {
    user,
    profile: createEmptyProfile(user.id, user.role, user.name, user.email),
    documents: [],
    recommendations: [],
    tasks: [],
  };
}

describe("Insurance Intelligence Agent", () => {
  it("updates context from conversational facts before answering", () => {
    const result = runAgentTurn(
      "I'm married with three kids in TX and worried about my policy lapsing.",
      emptyWorkspace(),
    );
    expect(result.toolResults.some((t) => t.tool === "update_context" && t.ok)).toBe(
      true,
    );
    expect(result.workspace.profile.household.maritalStatus.value).toBe("married");
    expect(result.workspace.profile.household.dependentsCount.value).toBe(3);
    expect(result.workspace.profile.household.state.value).toBe("TX");
    expect(result.workspace.profile.goals.preventLapse.value).toBe(true);
    expect(result.reply.length).toBeGreaterThan(20);
  });

  it("answers lapse questions with grounded document references", () => {
    const seed = buildDemoSeed();
    const workspace: AgentWorkspace = {
      user: {
        id: seed.profile.userId,
        email: seed.profile.email,
        name: seed.profile.displayName,
        role: seed.profile.role,
      },
      profile: seed.profile,
      documents: seed.documents,
      recommendations: [],
      tasks: [],
    };
    const result = runAgentTurn("Will my policy lapse?", workspace);
    expect(result.toolResults.some((t) => t.tool === "analyze_policy")).toBe(true);
    expect(result.reply).toMatch(/premium|lapse|Policy Health/i);
    const analysis = result.toolResults.find((t) => t.tool === "analyze_policy")!;
    const refs = analysis.data as { document?: string; confidence?: number };
    expect(refs.document).toMatch(/Mutual/i);
    expect(refs.confidence).toBeGreaterThan(0);
  });

  it("runs scenarios and generates recommendations requiring approval", () => {
    const seed = buildDemoSeed();
    const workspace: AgentWorkspace = {
      user: {
        id: seed.profile.userId,
        email: seed.profile.email,
        name: seed.profile.displayName,
        role: seed.profile.role,
      },
      profile: seed.profile,
      documents: seed.documents,
      recommendations: [],
      tasks: [],
    };
    const scenarios = runAgentTurn("Run funding scenarios", workspace);
    expect(scenarios.toolResults.some((t) => t.tool === "run_scenarios" && t.ok)).toBe(
      true,
    );

    const recs = runAgentTurn("What do you recommend?", workspace);
    expect(recs.workspace.recommendations.length).toBeGreaterThan(0);
    expect(recs.workspace.recommendations.every((r) => r.status === "pending")).toBe(
      true,
    );
    expect(recs.reply).toMatch(/approve/i);
  });

  it("approves recommendations and creates follow-up tasks", () => {
    const seed = buildDemoSeed();
    let workspace: AgentWorkspace = {
      user: {
        id: seed.profile.userId,
        email: seed.profile.email,
        name: seed.profile.displayName,
        role: seed.profile.role,
      },
      profile: seed.profile,
      documents: seed.documents,
      recommendations: [],
      tasks: [],
    };
    workspace = runAgentTurn("What do you recommend?", workspace).workspace;
    const afterApprove = runAgentTurn("approve all", workspace);
    expect(
      afterApprove.workspace.recommendations.every((r) => r.status === "approved"),
    ).toBe(true);
    const afterTasks = runAgentTurn("Create follow-up tasks", afterApprove.workspace);
    expect(afterTasks.workspace.tasks.length).toBeGreaterThan(0);
  });
});
