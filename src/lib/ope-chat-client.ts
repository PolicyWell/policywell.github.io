import { invokeEdgeFunction } from "@/lib/supabase/functions";
import type { AgentWorkspace } from "@/lib/agent";
import type { OpeChatHistoryMessage } from "@/lib/ope-chat";

export type OpeChatTurnResult = {
  reply: string;
  usedLlm: boolean;
};

/**
 * Gemini-backed Meet Ope turn.
 * Prefers Supabase Edge Function (works on static Pages), then Next `/api/ope-chat`.
 */
export async function requestOpeChatTurn(input: {
  message: string;
  history: OpeChatHistoryMessage[];
  visitorName?: string;
  visitorEmail?: string;
  workspace?: AgentWorkspace;
}): Promise<OpeChatTurnResult | null> {
  const history = input.history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
    .slice(-10);

  const payload = {
    message: input.message,
    history,
    visitorName: input.visitorName ?? null,
    visitorEmail: input.visitorEmail ?? null,
    // Edge function uses a slim grounding digest if provided separately; full workspace
    // is only sent to the Next route (may be large).
  };

  const edge = await invokeEdgeFunction<{
    reply?: string;
    usedLlm?: boolean;
    error?: string;
  }>("ope-chat-turn", {
    ...payload,
    toolDigest: null,
  });

  if (edge.ok && edge.data.reply?.trim()) {
    return {
      reply: edge.data.reply.trim(),
      usedLlm: Boolean(edge.data.usedLlm),
    };
  }

  try {
    const res = await fetch("/api/ope-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input.message,
        history,
        visitorName: input.visitorName,
        visitorEmail: input.visitorEmail,
        workspace: input.workspace,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      reply?: string;
      usedLlm?: boolean;
    };
    if (!json.reply?.trim()) return null;
    return { reply: json.reply.trim(), usedLlm: Boolean(json.usedLlm) };
  } catch {
    return null;
  }
}
