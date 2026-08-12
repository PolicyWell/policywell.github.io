import { NextResponse } from "next/server";
import type { AgentWorkspace } from "@/lib/agent";
import {
  runAgentTurnWithOptionalLlm,
  type AgentChatMessage,
} from "@/lib/agent/llm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      workspace?: AgentWorkspace;
      mode?: "analyst" | "ope";
      history?: AgentChatMessage[];
      visitorName?: string;
    };
    if (!body.message?.trim() || !body.workspace) {
      return NextResponse.json(
        { error: "message and workspace are required" },
        { status: 400 },
      );
    }
    const result = await runAgentTurnWithOptionalLlm(
      body.message.trim(),
      body.workspace,
      {
        mode: body.mode === "ope" ? "ope" : "analyst",
        history: Array.isArray(body.history) ? body.history : undefined,
        visitorName: body.visitorName?.trim() || undefined,
      },
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent turn failed" },
      { status: 500 },
    );
  }
}
