import { resolveDemoAuth, supabaseForAuth } from "@/lib/v1/auth";
import { jsonError, jsonOk } from "@/lib/v1/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await resolveDemoAuth(req);
    const supabase = supabaseForAuth(auth);
    const body = (await req.json().catch(() => ({}))) as {
      displayName?: string;
      caseType?: "life" | "annuity" | "commercial";
    };

    const displayName = body.displayName?.trim() || "Life illustration case";
    const caseType = body.caseType ?? "life";

    const { data, error } = await supabase
      .from("insurance_cases")
      .insert({
        owner_user_id: auth.userId,
        case_type: caseType,
        status: "created",
        display_name: displayName,
      })
      .select("*")
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create case");
    }

    await supabase.from("audit_events").insert({
      user_id: auth.userId,
      case_id: data.id,
      action: "case.created",
      resource_type: "insurance_case",
      resource_id: data.id,
      metadata: { display_name: displayName, auth_source: auth.source },
    });

    return jsonOk({
      caseId: data.id,
      case: data,
      authSource: auth.source,
      accessToken: auth.accessToken,
    });
  } catch (error) {
    return jsonError(error);
  }
}
