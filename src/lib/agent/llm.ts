import "server-only";

import { runAgentTurn, type AgentTurnResult, type AgentWorkspace } from "./index";

/** Optional LLM phrasing on top of deterministic tool results. */
export async function runAgentTurnWithOptionalLlm(
  message: string,
  workspace: AgentWorkspace,
): Promise<AgentTurnResult> {
  const base = runAgentTurn(message, workspace);
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim();
  if (!key) return base;

  try {
    const { generateText } = await import("ai");
    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
    const google = createGoogleGenerativeAI({ apiKey: key });

    const toolDigest = base.toolResults
      .map(
        (t) =>
          `- ${t.tool} (${t.ok ? "ok" : "failed"}): ${t.summary}` +
          (t.data ? `\n  data: ${JSON.stringify(t.data).slice(0, 1200)}` : ""),
      )
      .join("\n");

    const ctx = base.workspace.profile;
    const { text } = await generateText({
      model: google("gemini-flash-latest"),
      temperature: 0.3,
      system: [
        "You are PolicyWell, an Insurance Intelligence Agent.",
        "Speak like a calm, premium insurance analyst working alongside the user.",
        "ONLY use facts from the tool results and known profile context below.",
        "Always mention grounding when analyzing a policy: document name, key extracted values, assumptions, and confidence when present.",
        "Never invent product claims, guarantees, or numbers that are not in the tool results.",
        "Recommendations require human approval before client delivery - say so clearly.",
        "Keep replies concise (2-4 short paragraphs). Use plain language.",
      ].join(" "),
      prompt: [
        `User message: ${message}`,
        ``,
        `Profile: ${ctx.displayName} (${ctx.role}), confidence ${Math.round(ctx.overallConfidence * 100)}%, missing: ${ctx.missingFields.join(", ") || "none"}`,
        `Carrier: ${ctx.carrier.primaryCarrier.value ?? "unknown"}; state: ${ctx.household.state.value ?? "unknown"}`,
        ``,
        `Tool results:`,
        toolDigest || "(no tools ran)",
        ``,
        `Write the reply to the user now.`,
      ].join("\n"),
    });

    if (!text?.trim()) return base;
    return { ...base, reply: text.trim(), usedLlm: true };
  } catch (err) {
    console.error("[policywell-agent] Reasoning engine synthesis failed:", err);
    const note =
      "_(PolicyWell reasoning engine unavailable right now - showing the tool-grounded analyst reply.)_";
    return {
      ...base,
      reply: `${base.reply}\n\n${note}`,
      usedLlm: false,
    };
  }
}
