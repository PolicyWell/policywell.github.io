import "server-only";

import { runAgentTurn, type AgentWorkspace } from "./index";

export type OpeLiveMessage = {
  role: "user" | "assistant";
  content: string;
};

export type OpeLiveTurnInput = {
  message: string;
  history?: OpeLiveMessage[];
  visitorName?: string;
  visitorEmail?: string;
  /** Optional workspace for tool grounding; when omitted, chat is pure conversational. */
  workspace?: AgentWorkspace;
};

export type OpeLiveTurnResult = {
  reply: string;
  usedLlm: boolean;
  toolDigest?: string;
};

function googleApiKey(): string | undefined {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    undefined
  );
}

const OPE_SYSTEM = [
  "You are Ope, PolicyWell's live chat guide — warm, natural, and ChatGPT-like.",
  "You help with insurance coverage, funding, lapse risk, commercial books, and next steps.",
  "Never invent policy numbers, guarantees, or claims that are not in the tool grounding or conversation.",
  "If you do not know the visitor's name yet, ask once naturally (do not demand email up front).",
  "If they share a name, greet them by first name. Email is optional — only ask once if it fits the flow.",
  "Do not say robotic lines like “live context I'm working from” or “to sharpen the analysis”.",
  "Keep replies short: 1–3 short paragraphs, or a tight bullet list when comparing options.",
  "Recommendations need human approval before client delivery — mention that briefly when relevant.",
  "You can invite them to upload a policy PDF/screenshot in the chat widget.",
].join(" ");

/**
 * Gemini-first Meet Ope turn. Uses local tools only as optional grounding.
 */
export async function runOpeLiveTurn(
  input: OpeLiveTurnInput,
): Promise<OpeLiveTurnResult> {
  const message = input.message.trim();
  if (!message) {
    return { reply: "What would you like to talk through?", usedLlm: false };
  }

  let toolDigest = "";
  let groundedWorkspace = input.workspace;
  if (input.workspace) {
    try {
      const base = runAgentTurn(message, input.workspace, { mode: "ope" });
      groundedWorkspace = base.workspace;
      toolDigest = base.toolResults
        .map(
          (t) =>
            `- ${t.tool} (${t.ok ? "ok" : "failed"}): ${t.summary}` +
            (t.data
              ? `\n  data: ${JSON.stringify(t.data).slice(0, 900)}`
              : ""),
        )
        .join("\n");
    } catch {
      toolDigest = "";
    }
  }

  const key = googleApiKey();
  if (!key) {
    const fallback = groundedWorkspace
      ? (
          await import("./runtime")
        ).synthesizeOpeReply(
          message,
          [],
          groundedWorkspace,
        )
      : "Hey — I'm Ope. Tell me your name and what you want to figure out about coverage, funding, or renewals.";
    return {
      reply: fallback,
      usedLlm: false,
      toolDigest: toolDigest || undefined,
    };
  }

  const history = (input.history ?? [])
    .filter((m) => m.content?.trim())
    .slice(-10);

  try {
    const { generateText } = await import("ai");
    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
    const google = createGoogleGenerativeAI({ apiKey: key });

    const historyBlock = history.length
      ? history
          .map((m) => `${m.role === "user" ? "Visitor" : "Ope"}: ${m.content}`)
          .join("\n")
      : "(start of conversation)";

    const profile = groundedWorkspace?.profile;
    const { text } = await generateText({
      model: google("gemini-flash-latest"),
      temperature: 0.65,
      system: OPE_SYSTEM,
      prompt: [
        `Visitor name: ${input.visitorName?.trim() || "(unknown)"}`,
        `Visitor email: ${input.visitorEmail?.trim() || "(not shared)"}`,
        profile
          ? `Workspace profile: ${profile.displayName} (${profile.role}); confidence ${Math.round(profile.overallConfidence * 100)}%; missing: ${profile.missingFields.slice(0, 4).join(", ") || "none"}`
          : "Workspace profile: (none)",
        ``,
        `Recent conversation:`,
        historyBlock,
        ``,
        `Current message: ${message}`,
        ``,
        `Optional tool grounding (may be empty — do not invent from it):`,
        toolDigest || "(none)",
        ``,
        `Reply as Ope now.`,
      ].join("\n"),
    });

    if (!text?.trim()) {
      return {
        reply:
          "I want to help — tell me a bit more about the policy or question.",
        usedLlm: false,
        toolDigest: toolDigest || undefined,
      };
    }

    return {
      reply: text.trim(),
      usedLlm: true,
      toolDigest: toolDigest || undefined,
    };
  } catch (err) {
    console.error("[ope-live] Gemini turn failed:", err);
    return {
      reply:
        "I'm having trouble reaching my reasoning engine for a second. Ask me again, or tell me your name and the coverage question on your mind.",
      usedLlm: false,
      toolDigest: toolDigest || undefined,
    };
  }
}
