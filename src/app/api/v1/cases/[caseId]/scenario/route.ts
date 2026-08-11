import { resolveDemoAuth, supabaseForAuth } from "@/lib/v1/auth";
import { postCaseScenario } from "@/lib/v1/case-queries";
import { jsonError, jsonOk } from "@/lib/v1/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;
    const auth = await resolveDemoAuth(req);
    const supabase = supabaseForAuth(auth);
    const body = (await req.json().catch(() => ({}))) as {
      premium?: number;
      monthlyPremium?: number;
    };
    const monthly = Number(body.premium ?? body.monthlyPremium);
    if (!Number.isFinite(monthly) || monthly < 0) {
      return jsonError(new Error("premium (monthly amount) is required"), 400);
    }
    const scenario = await postCaseScenario(
      supabase,
      caseId,
      auth.userId,
      monthly,
    );
    return jsonOk(scenario);
  } catch (error) {
    return jsonError(error);
  }
}
