import { NextResponse } from "next/server";
import {
  buildScenario,
  workspaceFromRequest,
} from "@/lib/api-v1/workspace-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { premium?: number };
    const premium = Number(body.premium);
    if (!Number.isFinite(premium) || premium < 0) {
      return NextResponse.json(
        { error: "`premium` must be a non-negative number" },
        { status: 400 },
      );
    }
    const ws = workspaceFromRequest(req);
    return NextResponse.json(buildScenario(ws, premium));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scenario failed" },
      { status: 500 },
    );
  }
}
