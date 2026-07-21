import { planToolCalls } from "./planner";
import { synthesizeReply } from "./runtime";
import {
  runTool,
  type AgentTurnResult,
  type AgentWorkspace,
  type ToolResult,
} from "./tools";

export type { AgentTurnResult, AgentWorkspace, ToolResult };
export { TOOL_CATALOG } from "./tools";

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
): AgentTurnResult {
  const plan = planToolCalls(message, workspace);
  const toolResults: ToolResult[] = [];
  let current = workspace;

  for (const step of plan) {
    const result = runTool(step.tool, step.args, current);
    toolResults.push(result);
    current = applyWorkspace(current, [result]);
  }

  const reply = synthesizeReply(message, toolResults, current);
  return {
    reply,
    toolResults,
    workspace: current,
    usedLlm: false,
  };
}
