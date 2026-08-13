import { NextResponse } from "next/server";
import type { AgentWorkspace } from "@/lib/agent";
import {
  runOpeLiveTurn,
  type OpeLiveMessage,
} from "@/lib/agent/ope-live";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      history?: OpeLiveMessage[];
      visitorName?: string;
      visitorEmail?: string;
      workspace?: AgentWorkspace;
    };

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await runOpeLiveTurn({
      message: body.message.trim(),
      history: Array.isArray(body.history) ? body.history : undefined,
      visitorName: body.visitorName?.trim() || undefined,
      visitorEmail: body.visitorEmail?.trim() || undefined,
      workspace: body.workspace,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ope chat turn failed" },
      { status: 500 },
    );
  }
}
