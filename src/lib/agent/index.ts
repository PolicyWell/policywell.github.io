import { planToolCalls, type AgentPlanMode } from "./planner";
import { synthesizeOpeReply, synthesizeReply } from "./runtime";
import {
  runTool,
  type AgentTurnResult,
  type AgentWorkspace,
  type ToolResult,
} from "./tools";

export type { AgentTurnResult, AgentWorkspace, ToolResult };
export type { AgentPlanMode };
export { TOOL_CATALOG } from "./tools";

export type RunAgentTurnOptions = {
  mode?: AgentPlanMode;
};

function applyWorkspace(
  workspace: AgentWorkspace,
  toolResults: ToolResult[],
): AgentWorkspace {
  let next = { ...workspace };
  for (const t of toolResults) {
    if (!t.workspace) continue;
    next = {
      ...next,
      ...(t.workspace.profile ? { profile: t.workspace.profile } : {}),
      ...(t.workspace.recommendations
        ? { recommendations: t.workspace.recommendations }
        : {}),
      ...(t.workspace.tasks ? { tasks: t.workspace.tasks } : {}),
    };
  }
  return next;
}

/**
 * One agent turn (browser-safe): plan tools → execute → synthesize reply.
 * Does not call any LLM APIs.
 */
export function runAgentTurn(
  message: string,
  workspace: AgentWorkspace,
  options: RunAgentTurnOptions = {},
): AgentTurnResult {
  const mode = options.mode ?? "analyst";
  const plan = planToolCalls(message, workspace, { mode });
  const toolResults: ToolResult[] = [];
  let current = workspace;

  for (const step of plan) {
    const result = runTool(step.tool, step.args, current);
    toolResults.push(result);
    current = applyWorkspace(current, [result]);
  }

  const reply =
    mode === "ope"
      ? synthesizeOpeReply(message, toolResults, current)
      : synthesizeReply(message, toolResults, current);

  return {
    reply,
    toolResults,
    workspace: current,
    usedLlm: false,
  };
}
