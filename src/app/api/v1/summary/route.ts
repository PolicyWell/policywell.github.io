import { NextResponse } from "next/server";
import {
  buildSummary,
  workspaceFromRequest,
} from "@/lib/api-v1/workspace-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const ws = workspaceFromRequest(req);
  return NextResponse.json(buildSummary(ws));
}
