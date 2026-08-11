import { resolveDemoAuth, supabaseForAuth } from "@/lib/v1/auth";
import { getCaseCashValue } from "@/lib/v1/case-queries";
import { jsonError, jsonOk } from "@/lib/v1/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(req: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;
    const auth = await resolveDemoAuth(req);
    const supabase = supabaseForAuth(auth);
    const url = new URL(req.url);
    const ageRaw = url.searchParams.get("age");
    const age = ageRaw == null ? NaN : Number(ageRaw);
    if (!Number.isFinite(age) || age < 0) {
      return jsonError(new Error("Query param age is required (non-negative number)"), 400);
    }
    const cashvalue = await getCaseCashValue(supabase, caseId, auth.userId, age);
    return jsonOk(cashvalue);
  } catch (error) {
    return jsonError(error);
  }
}
