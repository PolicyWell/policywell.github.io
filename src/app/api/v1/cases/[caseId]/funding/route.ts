import { resolveDemoAuth, supabaseForAuth } from "@/lib/v1/auth";
import { getCaseFunding } from "@/lib/v1/case-queries";
import { jsonError, jsonOk } from "@/lib/v1/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(req: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;
    const auth = await resolveDemoAuth(req);
    const supabase = supabaseForAuth(auth);
    const funding = await getCaseFunding(supabase, caseId, auth.userId);
    return jsonOk(funding);
  } catch (error) {
    return jsonError(error);
  }
}
