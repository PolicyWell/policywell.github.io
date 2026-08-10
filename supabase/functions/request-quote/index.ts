import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  quoteConfirmationEmail,
  sendEmail,
} from "./_shared/email.ts";
import {
  codeHint,
  generateAccessCode,
  normalizeEmail,
  sha256Hex,
} from "./_shared/codes.ts";
import { jsonResponse, optionsResponse } from "./_shared/http.ts";

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
      phone?: string;
      company?: string;
      line?: string;
      state?: string;
      payload?: Record<string, unknown>;
      siteOrigin?: string;
    };

    const name = (body.name ?? "").trim();
    const emailRaw = (body.email ?? "").trim();
    const email = emailRaw ? normalizeEmail(emailRaw) : null;
    const phone = (body.phone ?? "").trim() || null;
    const line = (body.line ?? "commercial").trim();
    const lineLabel =
      line === "personal" ? "life & annuity coverage review" : "business insurance quote";

    if (!name) {
      return jsonResponse({ error: "Name is required." }, 400);
    }
    if (!email && !phone) {
      return jsonResponse({ error: "Email or phone is required." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured." }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let issuedCodeId: string | null = null;
    let plaintextCode: string | null = null;

    if (email) {
      plaintextCode = generateAccessCode(8);
      const hash = await sha256Hex(plaintextCode);
      const expiresAt = new Date(
        Date.now() + EXPIRES_HOURS * 60 * 60 * 1000,
      ).toISOString();

      const { data: codeRow, error: codeError } = await admin
        .from("issued_access_codes")
        .insert({
          email,
          code_hash: hash,
          code_hint: codeHint(plaintextCode),
          source: "quote_request",
          expires_at: expiresAt,
        })
        .select("id")
        .single();

      if (codeError || !codeRow) {
        return jsonResponse(
          { error: codeError?.message ?? "Failed to issue access code." },
          500,
        );
      }
      issuedCodeId = codeRow.id;
    }

    const { data: quoteRow, error: quoteError } = await admin
      .from("quote_requests")
      .insert({
        name,
        email,
        phone,
        company: (body.company ?? "").trim() || null,
        line,
        state: (body.state ?? "").trim() || null,
        payload: body.payload ?? {},
        status: "received",
        issued_code_id: issuedCodeId,
      })
      .select("id")
      .single();

    if (quoteError || !quoteRow) {
      return jsonResponse(
        { error: quoteError?.message ?? "Failed to store quote request." },
        500,
      );
    }

    const origin = (body.siteOrigin ?? "https://policywell.ai").replace(
      /\/$/,
      "",
    );
    const unlockUrl = plaintextCode
      ? `${origin}/demo/?access_code=${encodeURIComponent(plaintextCode)}`
      : undefined;

    if (email && plaintextCode) {
      const mail = quoteConfirmationEmail({
        name,
        lineLabel,
        code: plaintextCode,
        unlockUrl,
        expiresHours: EXPIRES_HOURS,
      });
      const sent = await sendEmail({ to: email, ...mail });

      const notify = Deno.env.get("ACCESS_NOTIFY_EMAIL")?.trim();
      if (notify) {
        await sendEmail({
          to: notify,
          subject: `Quote request: ${name} · ${lineLabel}`,
          text: `Quote ${quoteRow.id}\n${name}\n${email ?? ""}\n${phone ?? ""}\n${JSON.stringify(body.payload ?? {}, null, 2)}`,
          html: `<p>Quote <code>${quoteRow.id}</code></p><pre>${JSON.stringify(body.payload ?? {}, null, 2)}</pre>`,
        });
      }

      if (!sent.ok) {
        await admin
          .from("quote_requests")
          .update({ status: "email_failed", error_message: sent.error })
          .eq("id", quoteRow.id);
        return jsonResponse(
          {
            ok: true,
            requestId: quoteRow.id,
            emailed: false,
            message:
              "We saved your request. Email delivery is not fully configured yet — an advisor will still follow up.",
            detail: sent.error,
          },
          200,
        );
      }

      await admin
        .from("quote_requests")
        .update({ status: "confirmation_emailed", error_message: null })
        .eq("id", quoteRow.id);

      return jsonResponse({
        ok: true,
        requestId: quoteRow.id,
        emailed: true,
        emailedTo: email,
        message:
          "Check your email for confirmation and a product access code.",
      });
    }

    // Phone-only: notify ops if configured
    const notify = Deno.env.get("ACCESS_NOTIFY_EMAIL")?.trim();
    if (notify) {
      await sendEmail({
        to: notify,
        subject: `Quote request (phone): ${name}`,
        text: `Quote ${quoteRow.id}\n${name}\n${phone}\n${JSON.stringify(body.payload ?? {}, null, 2)}`,
        html: `<p>Quote <code>${quoteRow.id}</code> (phone only)</p>`,
      });
    }

    return jsonResponse({
      ok: true,
      requestId: quoteRow.id,
      emailed: false,
      message: "Request received. An advisor will follow up by phone.",
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      500,
    );
  }
});
