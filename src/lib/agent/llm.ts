import "server-only";

import { runAgentTurn, type AgentTurnResult, type AgentWorkspace } from "./index";

export type AgentChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type AgentLlmOptions = {
  /** Meet Ope floating chat — warmer ChatGPT-like tone. */
  mode?: "analyst" | "ope";
  /** Recent turns for conversational continuity (excluding the current message). */
  history?: AgentChatMessage[];
  visitorName?: string;
};

/** Optional LLM phrasing on top of deterministic tool results. */
export async function runAgentTurnWithOptionalLlm(
  message: string,
  workspace: AgentWorkspace,
  options: AgentLlmOptions = {},
): Promise<AgentTurnResult> {
  const base = runAgentTurn(message, workspace);
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim();
  if (!key) return base;

  const mode = options.mode ?? "analyst";
  const history = (options.history ?? [])
    .filter((m) => m.content?.trim() && m.role !== "system")
    .slice(-8);

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
    const historyBlock = history.length
      ? history
          .map((m) => `${m.role === "user" ? "User" : "Ope"}: ${m.content}`)
          .join("\n")
      : "(none)";

    const visitor = options.visitorName?.trim();

    const system =
      mode === "ope"
        ? [
            "You are Ope, PolicyWell's friendly insurance guide in a live chat widget.",
            "Speak like ChatGPT: warm, natural, conversational — short paragraphs, not a formal memo.",
            "Use the visitor's first name when you know it.",
            "ONLY use facts from the tool results and known profile context below.",
            "If tool results are thin, still be helpful: ask one clarifying question and offer a clear next step.",
            "When analyzing a policy, casually mention grounding (document name, key values, confidence) without sounding robotic.",
            "Never invent product claims, guarantees, or numbers that are not in the tool results.",
            "Recommendations need human approval before client delivery — say so briefly when relevant.",
            "Keep replies concise (about 2-4 short paragraphs or a tight bullet list).",
          ].join(" ")
        : [
            "You are PolicyWell, an Insurance Intelligence Agent.",
            "Speak like a calm, premium insurance analyst working alongside the user.",
            "ONLY use facts from the tool results and known profile context below.",
            "Always mention grounding when analyzing a policy: document name, key extracted values, assumptions, and confidence when present.",
            "Never invent product claims, guarantees, or numbers that are not in the tool results.",
            "Recommendations require human approval before client delivery - say so clearly.",
            "Keep replies concise (2-4 short paragraphs). Use plain language.",
          ].join(" ");

    const { text } = await generateText({
      model: google("gemini-flash-latest"),
      temperature: mode === "ope" ? 0.55 : 0.3,
      system,
      prompt: [
        visitor ? `Visitor name: ${visitor}` : "Visitor name: (unknown)",
        ``,
        `Recent conversation:`,
        historyBlock,
        ``,
        `Current user message: ${message}`,
        ``,
        `Profile: ${ctx.displayName} (${ctx.role}), confidence ${Math.round(ctx.overallConfidence * 100)}%, missing: ${ctx.missingFields.join(", ") || "none"}`,
        `Carrier: ${ctx.carrier.primaryCarrier.value ?? "unknown"}; state: ${ctx.household.state.value ?? "unknown"}`,
        ``,
        `Tool results:`,
        toolDigest || "(no tools ran)",
        ``,
        mode === "ope"
          ? `Write Ope's chat reply now.`
          : `Write the reply to the user now.`,
      ].join("\n"),
    });

    if (!text?.trim()) return base;
    return { ...base, reply: text.trim(), usedLlm: true };
  } catch (err) {
    console.error("[policywell-agent] Reasoning engine synthesis failed:", err);
    const note =
      mode === "ope"
        ? "_(Quick note: my polished phrasing is offline — here's the grounded answer.)_"
        : "_(PolicyWell reasoning engine unavailable right now - showing the tool-grounded analyst reply.)_";
    return {
      ...base,
      reply: `${base.reply}\n\n${note}`,
      usedLlm: false,
    };
  }
}
