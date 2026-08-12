import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { normalizeEmail } from "./_shared/codes.ts";
import { jsonResponse, optionsResponse } from "./_shared/http.ts";

type IncomingMessage = {
  role?: string;
  content?: string;
  seq?: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as {
      sessionKey?: string;
      name?: string;
      email?: string | null;
      company?: string | null;
      role?: string | null;
      pagePath?: string | null;
      userAgent?: string | null;
      messages?: IncomingMessage[];
    };

    const sessionKey = (body.sessionKey ?? "").trim().slice(0, 120);
    const name = (body.name ?? "").trim().slice(0, 120);
    if (!sessionKey || sessionKey.length < 8) {
      return jsonResponse({ error: "sessionKey is required." }, 400);
    }
    if (!name || name.length < 2) {
      return jsonResponse({ error: "name is required." }, 400);
    }

    const emailRaw = (body.email ?? "").trim();
    const email = emailRaw ? normalizeEmail(emailRaw) : null;
    if (email && !email.includes("@")) {
      return jsonResponse({ error: "email is invalid." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured." }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const now = new Date().toISOString();
    const company = (body.company ?? "").trim().slice(0, 160) || null;
    const role = (body.role ?? "").trim().slice(0, 80) || null;
    const pagePath = (body.pagePath ?? "").trim().slice(0, 400) || null;
    const userAgent = (body.userAgent ?? "").trim().slice(0, 400) || null;

    const { data: existing } = await admin
      .from("ope_chat_leads")
      .select("id, email, company, role, page_path, user_agent")
      .eq("session_key", sessionKey)
      .maybeSingle();

    const leadPayload = {
      session_key: sessionKey,
      name,
      email: email ?? existing?.email ?? null,
      company: company ?? existing?.company ?? null,
      role: role ?? existing?.role ?? null,
      page_path: pagePath ?? existing?.page_path ?? null,
      user_agent: userAgent ?? existing?.user_agent ?? null,
      status: "active" as const,
      updated_at: now,
    };

    const { data: lead, error: leadError } = await admin
      .from("ope_chat_leads")
      .upsert(leadPayload, { onConflict: "session_key" })
      .select("id, session_key")
      .single();

    if (leadError || !lead) {
      return jsonResponse(
        { error: leadError?.message ?? "Failed to store chat lead." },
        500,
      );
    }

    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const rows = incoming
      .map((m, i) => {
        const msgRole = (m.role ?? "").trim();
        const content = (m.content ?? "").trim().slice(0, 8000);
        if (!content) return null;
        if (msgRole !== "user" && msgRole !== "assistant" && msgRole !== "system") {
          return null;
        }
        const seq =
          typeof m.seq === "number" && Number.isFinite(m.seq)
            ? Math.max(0, Math.floor(m.seq))
            : i;
        return {
          lead_id: lead.id as string,
          role: msgRole,
          content,
          seq,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .slice(0, 40);

    if (rows.length) {
      const { error: msgError } = await admin.from("ope_chat_messages").insert(rows);
      if (msgError) {
        return jsonResponse(
          { error: msgError.message ?? "Failed to store chat messages." },
          500,
        );
      }
    }

    return jsonResponse({
      leadId: lead.id,
      sessionKey: lead.session_key,
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      500,
    );
  }
});
