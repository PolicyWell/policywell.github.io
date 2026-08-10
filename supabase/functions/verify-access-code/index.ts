import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { normalizeEmail, sha256Hex } from "./_shared/codes.ts";
import { jsonResponse, optionsResponse } from "./_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as {
      code?: string;
      email?: string;
      surface?: string;
    };

    const code = (body.code ?? "").trim();
    if (!code) {
      return jsonResponse({ ok: false, error: "Code is required." }, 400);
    }

    // Ops universal code (Supabase Edge secret UNIVERSAL_ACCESS_CODE).
    // Unlocks every surface without a one-time issued_access_codes row.
    const universal = (Deno.env.get("UNIVERSAL_ACCESS_CODE") ?? "").trim();
    if (universal && code === universal) {
      return jsonResponse({
        ok: true,
        surfaces: ["*"],
        universal: true,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured." }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const hash = await sha256Hex(code);
    const { data: row, error } = await admin
      .from("issued_access_codes")
      .select("id, email, surfaces, expires_at, redeem_count")
      .eq("code_hash", hash)
      .maybeSingle();

    if (error) {
      return jsonResponse({ ok: false, error: error.message }, 500);
    }
    if (!row) {
      return jsonResponse({ ok: false, error: "Invalid access code." }, 401);
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return jsonResponse({ ok: false, error: "This code has expired." }, 401);
    }

    const email = body.email ? normalizeEmail(body.email) : "";
    if (email && email !== row.email) {
      return jsonResponse(
        { ok: false, error: "Code does not match this email." },
        401,
      );
    }

    const surface = (body.surface ?? "").trim();
    if (
      surface &&
      Array.isArray(row.surfaces) &&
      row.surfaces.length > 0 &&
      !row.surfaces.includes(surface)
    ) {
      return jsonResponse(
        { ok: false, error: "Code is not valid for this area." },
        401,
      );
    }

    await admin
      .from("issued_access_codes")
      .update({
        redeemed_at: new Date().toISOString(),
        redeem_count: (row.redeem_count ?? 0) + 1,
      })
      .eq("id", row.id);

    return jsonResponse({
      ok: true,
      surfaces: row.surfaces,
      email: row.email,
    });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err instanceof Error ? err.message : "Unexpected error" },
      500,
    );
  }
});
