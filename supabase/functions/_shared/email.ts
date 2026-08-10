export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Send via Resend when RESEND_API_KEY is set.
 * From address: EMAIL_FROM (default onboarding@resend.dev for testing).
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error:
        "RESEND_API_KEY is not configured on the Edge Function secrets. Set it in Supabase → Edge Functions → Secrets.",
    };
  }

  const from =
    Deno.env.get("EMAIL_FROM")?.trim() ||
    "PolicyWell <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return { ok: false, error: `Resend ${res.status}: ${detail}` };
  }

  const data = (await res.json()) as { id?: string };
  return { ok: true, id: data.id };
}

export function accessCodeEmail(opts: {
  name: string;
  code: string;
  unlockUrl: string;
  expiresHours: number;
  surfaceLabel: string;
}): { subject: string; html: string; text: string } {
  const subject = `Your PolicyWell access code — ${opts.surfaceLabel}`;
  const text = [
    `Hi ${opts.name},`,
    "",
    `Here is your PolicyWell access code for ${opts.surfaceLabel}:`,
    "",
    opts.code,
    "",
    `It expires in about ${opts.expiresHours} hours.`,
    `Unlock link: ${opts.unlockUrl}`,
    "",
    "If you did not request this, you can ignore this email.",
    "",
    "— PolicyWell",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;color:#0f2f28">
      <p>Hi ${escapeHtml(opts.name)},</p>
      <p>Here is your PolicyWell access code for <strong>${escapeHtml(opts.surfaceLabel)}</strong>:</p>
      <p style="font-size:28px;letter-spacing:0.12em;font-weight:700">${escapeHtml(opts.code)}</p>
      <p>It expires in about ${opts.expiresHours} hours.</p>
      <p><a href="${escapeHtml(opts.unlockUrl)}">Open and unlock</a></p>
      <p style="color:#5c6f68;font-size:13px">If you did not request this, you can ignore this email.</p>
      <p>— PolicyWell</p>
    </div>
  `;

  return { subject, html, text };
}

export function quoteConfirmationEmail(opts: {
  name: string;
  lineLabel: string;
  code?: string;
  unlockUrl?: string;
  expiresHours?: number;
}): { subject: string; html: string; text: string } {
  const subject = `We received your PolicyWell ${opts.lineLabel} request`;
  const codeBlock = opts.code
    ? [
        "",
        "While you wait, you can explore product demos with this access code:",
        opts.code,
        opts.unlockUrl ? `Unlock: ${opts.unlockUrl}` : "",
        opts.expiresHours
          ? `Code expires in about ${opts.expiresHours} hours.`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const text = [
    `Hi ${opts.name},`,
    "",
    `Thanks — we received your ${opts.lineLabel} request.`,
    "A licensed PolicyWell advisor will follow up shortly.",
    codeBlock,
    "",
    "— PolicyWell",
  ].join("\n");

  const htmlCode = opts.code
    ? `<p>While you wait, explore product demos with this access code:</p>
       <p style="font-size:28px;letter-spacing:0.12em;font-weight:700">${escapeHtml(opts.code)}</p>
       ${opts.unlockUrl ? `<p><a href="${escapeHtml(opts.unlockUrl)}">Open and unlock</a></p>` : ""}
       ${opts.expiresHours ? `<p style="color:#5c6f68;font-size:13px">Expires in about ${opts.expiresHours} hours.</p>` : ""}`
    : "";

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;color:#0f2f28">
      <p>Hi ${escapeHtml(opts.name)},</p>
      <p>Thanks — we received your <strong>${escapeHtml(opts.lineLabel)}</strong> request.</p>
      <p>A licensed PolicyWell advisor will follow up shortly.</p>
      ${htmlCode}
      <p>— PolicyWell</p>
    </div>
  `;

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
