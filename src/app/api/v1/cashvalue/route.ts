import { NextResponse } from "next/server";
import {
  buildCashValue,
  workspaceFromRequest,
} from "@/lib/api-v1/workspace-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ageRaw = searchParams.get("age");
  const age = ageRaw ? Number(ageRaw) : NaN;
  if (!Number.isFinite(age) || age < 0 || age > 120) {
    return NextResponse.json(
      { error: "Query param `age` must be a number between 0 and 120" },
      { status: 400 },
    );
  }
  const ws = workspaceFromRequest(req);
  return NextResponse.json(buildCashValue(ws, age));
}
