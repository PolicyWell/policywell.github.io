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
 * One agent turn: plan tools → execute → synthesize reply.
 * If OPENAI_API_KEY is set, the synthesizer can be replaced by an LLM
 * (see runAgentTurnWithOptionalLlm).
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

/** Optional OpenAI-backed synthesis when a key is present. */
export async function runAgentTurnWithOptionalLlm(
  message: string,
  workspace: AgentWorkspace,
): Promise<AgentTurnResult> {
  const base = runAgentTurn(message, workspace);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return base;

  try {
    const { generateText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const openai = createOpenAI({ apiKey: key });
    const toolDigest = base.toolResults
      .map((t) => `${t.tool}: ${t.summary}`)
      .join("\n");
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are PolicyWell, an Insurance Intelligence Agent. Answer only using the tool results provided. " +
        "Cite documents, extracted values, assumptions, and confidence. Never invent product claims. " +
        "Recommendations require human approval. Be calm, premium, and analyst-like.",
      prompt:
        `User: ${message}\n\nTool results:\n${toolDigest}\n\nWrite the reply to the user.`,
    });
    return { ...base, reply: text || base.reply, usedLlm: true };
  } catch {
    return base;
  }
}
