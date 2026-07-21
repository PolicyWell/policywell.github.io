import "server-only";

import { runAgentTurn, type AgentTurnResult, type AgentWorkspace } from "./index";

/** Optional OpenAI-backed synthesis — server-only. */
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
      prompt: `User: ${message}\n\nTool results:\n${toolDigest}\n\nWrite the reply to the user.`,
    });
    return { ...base, reply: text || base.reply, usedLlm: true };
  } catch {
    return base;
  }
}
