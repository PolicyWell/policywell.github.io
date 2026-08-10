import { NextResponse } from "next/server";
import { createWorkspace } from "@/lib/api-v1/workspace-store";

export const runtime = "nodejs";

export async function POST() {
  const ws = createWorkspace();
  return NextResponse.json({
    ok: true,
    workspaceId: ws.id,
    apiBase: "/api/v1",
    message: "Workspace ready. Demo household seeded for local CLI analysis.",
  });
}
