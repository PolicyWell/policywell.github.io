import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  accessCodeEmail,
  sendEmail,
} from "./_shared/email.ts";
import {
  codeHint,
  generateAccessCode,
  normalizeEmail,
  sha256Hex,
} from "./_shared/codes.ts";
import { jsonResponse, optionsResponse } from "./_shared/http.ts";

const SURFACE_LABELS: Record<string, string> = {
  demo: "Product demo",
  product: "Interactive product tour",
  deck: "Investor / product deck",
  agent: "Insurance intelligence agent",
  platform: "Platform overview",
  docs: "Documentation",
};

const EXPIRES_HOURS = 72;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      company?: string;
      role?: string;
      surface?: string;
      notes?: string;
      pagePath?: string;
      siteOrigin?: string;
    };

    const name = (body.name ?? "").trim();
    const email = normalizeEmail(body.email ?? "");
    const surface = (body.surface ?? "demo").trim();
    const surfaceLabel = SURFACE_LABELS[surface] ?? surface;

    if (!name || !email || !email.includes("@")) {
      return jsonResponse({ error: "Name and a valid email are required." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured." }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: requestRow, error: insertReqError } = await admin
      .from("access_requests")
      .insert({
        name,
        email,
        company: (body.company ?? "").trim() || null,
        role: (body.role ?? "").trim() || null,
        surface,
        notes: (body.notes ?? "").trim() || null,
        page_path: (body.pagePath ?? "").trim() || null,
        status: "received",
      })
      .select("id")
      .single();

    if (insertReqError || !requestRow) {
      return jsonResponse(
        { error: insertReqError?.message ?? "Failed to store request." },
        500,
      );
    }

    const code = generateAccessCode(8);
    const hash = await sha256Hex(code);
    const expiresAt = new Date(
      Date.now() + EXPIRES_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const { data: codeRow, error: codeError } = await admin
      .from("issued_access_codes")
      .insert({
        email,
        code_hash: hash,
        code_hint: codeHint(code),
        source: "access_request",
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (codeError || !codeRow) {
      await admin
        .from("access_requests")
        .update({
          status: "email_failed",
          error_message: codeError?.message ?? "code insert failed",
        })
        .eq("id", requestRow.id);
      return jsonResponse(
        { error: codeError?.message ?? "Failed to issue code." },
        500,
      );
    }

    const origin = (body.siteOrigin ?? "https://policywell.ai").replace(
      /\/$/,
      "",
    );
    const unlockPath =
      surface === "docs"
        ? "/docs/"
        : surface === "deck"
          ? "/deck/"
          : surface === "product"
            ? "/product/"
            : surface === "agent"
              ? "/agent/"
              : surface === "platform"
                ? "/platform/"
                : "/demo/";
    const unlockUrl = `${origin}${unlockPath}?access_code=${encodeURIComponent(code)}`;

    const mail = accessCodeEmail({
      name,
      code,
      unlockUrl,
      expiresHours: EXPIRES_HOURS,
      surfaceLabel,
    });

    const sent = await sendEmail({ to: email, ...mail });

    // Ops copy (optional)
    const notify = Deno.env.get("ACCESS_NOTIFY_EMAIL")?.trim();
    if (notify) {
      await sendEmail({
        to: notify,
        subject: `Access request: ${name} · ${surfaceLabel}`,
        text: `Request ${requestRow.id}\n${name} <${email}>\nSurface: ${surfaceLabel}\nCode hint: ${codeHint(code)}`,
        html: `<p>Request <code>${requestRow.id}</code></p><p>${escape(name)} &lt;${escape(email)}&gt;</p><p>Surface: ${escape(surfaceLabel)}</p><p>Code hint: ${codeHint(code)}</p>`,
      });
    }

    if (!sent.ok) {
      await admin
        .from("access_requests")
        .update({
          status: "email_failed",
          issued_code_id: codeRow.id,
          error_message: sent.error,
        })
        .eq("id", requestRow.id);
      return jsonResponse(
        {
          error:
            "We saved your request but could not email the code yet. Our team will follow up.",
          detail: sent.error,
          requestId: requestRow.id,
        },
        502,
      );
    }

    await admin
      .from("access_requests")
      .update({
        status: "code_emailed",
        issued_code_id: codeRow.id,
        error_message: null,
      })
      .eq("id", requestRow.id);

    return jsonResponse({
      ok: true,
      requestId: requestRow.id,
      emailedTo: email,
      expiresHours: EXPIRES_HOURS,
      message: "Check your email for your access code.",
    });
  } catch (err) {
    return jsonResponse(
      {
        error: err instanceof Error ? err.message : "Unexpected error",
      },
      500,
    );
  }
});

function escape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
