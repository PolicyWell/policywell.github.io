import { NextResponse } from "next/server";
import { runAgentTurnWithOptionalLlm, type AgentWorkspace } from "@/lib/agent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      workspace?: AgentWorkspace;
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
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent turn failed" },
      { status: 500 },
    );
  }
}
