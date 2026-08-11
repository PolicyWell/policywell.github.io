import { NextResponse } from "next/server";

export function jsonOk(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export function jsonError(error: unknown, fallbackStatus = 500) {
  const message = error instanceof Error ? error.message : "Request failed";
  const status =
    typeof error === "object" &&
    error &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
      ? (error as { status: number }).status
      : fallbackStatus;
  return NextResponse.json({ error: message }, { status });
}
