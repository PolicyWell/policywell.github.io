import { invokeEdgeFunction } from "@/lib/supabase/functions";

const STORAGE_KEY = "pw_ope_chat_identity_v1";
const SESSION_KEY = "pw_ope_chat_session_v1";

export type OpeChatIdentity = {
  name: string;
  email?: string;
  company?: string;
  role?: string;
  leadId?: string;
};

export type OpeChatHistoryMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const INTRO_RE =
  /^(?:hi|hello|hey|yo|howdy|good\s+(?:morning|afternoon|evening))[,!.\s]*/i;

/** Stable anonymous session key for Meet Ope → Supabase lead upsert. */
export function getOpeSessionKey(): string {
  if (typeof window === "undefined") return `server_${Date.now()}`;
  try {
    const existing = localStorage.getItem(SESSION_KEY)?.trim();
    if (existing) return existing;
    const key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `ope_${crypto.randomUUID()}`
        : `ope_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, key);
    return key;
  } catch {
    return `ope_${Date.now().toString(36)}`;
  }
}

export function loadOpeIdentity(): OpeChatIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OpeChatIdentity;
    if (!parsed?.name?.trim()) return null;
    return {
      name: parsed.name.trim(),
      email: parsed.email?.trim() || undefined,
      company: parsed.company?.trim() || undefined,
      role: parsed.role?.trim() || undefined,
      leadId: parsed.leadId?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

export function saveOpeIdentity(identity: OpeChatIdentity): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // ignore quota / private mode
  }
}

function cleanName(raw: string): string | undefined {
  let name = raw
    .replace(/["""']/g, "")
    .replace(/[!.?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!name) return undefined;
  // Drop trailing "and my email is…" leftovers
  name = name.replace(/\s+and\b.*$/i, "").trim();
  if (name.length < 2 || name.length > 80) return undefined;
  if (/^(i|me|my|the|a|an|yes|no|ok|okay|sure|hi|hello|hey)$/i.test(name)) {
    return undefined;
  }
  if (/\b(policy|coverage|lapse|premium|insurance|recommend)\b/i.test(name)) {
    return undefined;
  }
  // Title-case lightly when all lowercase / uppercase
  if (name === name.toLowerCase() || name === name.toUpperCase()) {
    name = name
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return name;
}

/**
 * Pull name / email / optional company from free-text chat.
 * Designed for short intros like "I'm Alex" or "Jordan, jordan@firm.com".
 */
export function parseIdentityFromMessage(message: string): Partial<OpeChatIdentity> {
  const text = message.trim();
  if (!text) return {};

  const out: Partial<OpeChatIdentity> = {};
  const emailMatch = text.match(EMAIL_RE);
  if (emailMatch) out.email = emailMatch[0].toLowerCase();

  const companyMatch = text.match(
    /(?:(?:i\s+)?work\s+(?:at|with|for)|company(?:\s+is)?)\s+([A-Za-z0-9][\w&.'-]{1,40}(?:\s+[A-Za-z0-9][\w&.'-]{1,40}){0,3})/i,
  );
  if (companyMatch?.[1]) {
    const company = companyMatch[1]
      .replace(/\s+(?:as|and)\b.*$/i, "")
      .replace(/[!,.]+$/, "")
      .trim();
    if (company.length >= 2) out.company = company;
  }

  const roleMatch = text.match(
    /\b(?:i'?m|i am|as)\s+(?:an?\s+)?(agent|advisor|broker|policyholder|cfo|owner|producer|imo)\b/i,
  );
  if (roleMatch?.[1]) out.role = roleMatch[1].toLowerCase();

  const patterns = [
    /(?:my name is|i'?m|i am|this is|it'?s|call me)\s+([A-Za-z][A-Za-z' -]{1,60})/i,
    /(?:name[:\s]+)([A-Za-z][A-Za-z' -]{1,60})/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const name = cleanName(m[1]);
      if (name) {
        out.name = name;
        break;
      }
    }
  }

  if (!out.name) {
    // Short bare name / "Name, email@…"
    let candidate = text.replace(EMAIL_RE, "").replace(/[,;]+/g, " ").trim();
    candidate = candidate.replace(INTRO_RE, "").trim();
    candidate = candidate.replace(
      /\b(?:and\s+)?(?:my\s+)?(?:email|company|role)\b.*$/i,
      "",
    ).trim();
    const words = candidate.split(/\s+/).filter(Boolean);
    const looksLikeQuestion =
      /\?/.test(text) ||
      /^(what|why|how|when|where|will|can|could|should|do|does|is|are)\b/i.test(
        text,
      );
    if (!looksLikeQuestion && words.length >= 1 && words.length <= 3) {
      const name = cleanName(words.join(" "));
      if (name) out.name = name;
    }
  }

  return out;
}

export function mergeIdentity(
  current: OpeChatIdentity | null,
  patch: Partial<OpeChatIdentity>,
): OpeChatIdentity | null {
  const name = (patch.name ?? current?.name)?.trim();
  if (!name) return current;
  return {
    name,
    email: (patch.email ?? current?.email)?.trim() || undefined,
    company: (patch.company ?? current?.company)?.trim() || undefined,
    role: (patch.role ?? current?.role)?.trim() || undefined,
    leadId: (patch.leadId ?? current?.leadId)?.trim() || undefined,
  };
}

export function opeWelcome(identity: OpeChatIdentity | null): string {
  if (identity?.name) {
    const emailBit = identity.email
      ? ` I still have you as ${identity.email}.`
      : "";
    return `Hey ${identity.name} — welcome back. I'm Ope, your PolicyWell guide.${emailBit} What's on your mind about coverage, funding, or next steps? You can also drop a policy PDF or screenshot anytime.`;
  }
  return "Hey — I'm Ope, your PolicyWell guide. Before we dig in: who am I chatting with? A first name is perfect, and an email helps if you want a follow-up.";
}

/** Soften tool-grounded analyst text into a chatty Ope voice (no LLM). */
export function humanizeOpeReply(
  reply: string,
  identity: OpeChatIdentity | null,
): string {
  let text = reply.trim();
  if (!text) {
    return identity?.name
      ? `${identity.name}, I want to be useful here — tell me a bit more about the policy or question.`
      : "Tell me a bit more about the policy or question and I'll dig in.";
  }

  // Rewrite leftover analyst boilerplate if an older path still emits it.
  if (/here'?s the live context i'?m working from/i.test(text)) {
    const first = identity?.name?.split(/\s+/)[0];
    const hi = first ? `${first}, ` : "";
    return `${hi}I don't have a full picture on file yet. Want to upload a policy PDF, or tell me what you're trying to figure out — coverage, funding, or lapse risk?`;
  }

  text = text
    .replace(/^#+\s+/gm, "")
    .replace(/^Got it,\s+/i, "Got it — ")
    .replace(
      /\n*\s*To sharpen the analysis, I still need:[^\n.]+\.?/gi,
      "",
    )
    .replace(
      /Here are your deterministic PolicyWell scores:/gi,
      "Here's a quick score read:",
    )
    .replace(
      /These are explainable and not LLM guesses\./gi,
      "These are explainable model outputs.",
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const first = identity?.name?.split(/\s+/)[0];
  if (first && !new RegExp(`\\b${first}\\b`, "i").test(text)) {
    if (text.length < 420 && !/^(hey|hi|hello|got it)\b/i.test(text)) {
      text = `${first}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
    }
  }

  return text;
}

export function identityAck(
  identity: OpeChatIdentity,
  justCaptured: Partial<OpeChatIdentity>,
): string {
  const first = identity.name.split(/\s+/)[0] || identity.name;
  if (justCaptured.email && justCaptured.name) {
    return `Nice to meet you, ${first}. I've got you down as ${identity.email}. What should we look at first — coverage, funding, lapse risk, or something else?`;
  }
  if (justCaptured.name && !identity.email) {
    return `Great to meet you, ${first}. If you're open to it, drop your email too so we can follow up — otherwise, what's the insurance question on your mind?`;
  }
  if (justCaptured.email && identity.name) {
    return `Perfect — I've noted ${identity.email}. How can I help today?`;
  }
  return `Thanks, ${first}. What can I help with?`;
}

export type RecordOpeChatResult = {
  leadId: string;
  sessionKey: string;
};

export async function recordOpeChat(input: {
  identity: OpeChatIdentity;
  pagePath?: string;
  messages?: OpeChatHistoryMessage[];
  messageSeqStart?: number;
}): Promise<{ ok: true; data: RecordOpeChatResult } | { ok: false; error: string }> {
  const sessionKey = getOpeSessionKey();
  const result = await invokeEdgeFunction<RecordOpeChatResult>("record-ope-chat", {
    sessionKey,
    name: input.identity.name,
    email: input.identity.email ?? null,
    company: input.identity.company ?? null,
    role: input.identity.role ?? null,
    pagePath: input.pagePath ?? null,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null,
    messages: (input.messages ?? []).map((m, i) => ({
      role: m.role,
      content: m.content.slice(0, 8000),
      seq: (input.messageSeqStart ?? 0) + i,
    })),
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true, data: result.data };
}
