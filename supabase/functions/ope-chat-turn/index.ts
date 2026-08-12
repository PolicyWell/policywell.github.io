import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { jsonResponse, optionsResponse } from "./_shared/http.ts";

type ChatMessage = { role?: string; content?: string };

const OPE_SYSTEM = [
  "You are Ope, PolicyWell's live chat guide — warm, natural, and ChatGPT-like.",
  "You help with insurance coverage, funding, lapse risk, commercial books, and next steps.",
  "Never invent policy numbers, guarantees, or claims that are not in the grounding or conversation.",
  "If you do not know the visitor's name yet, ask once naturally (do not demand email up front).",
  "If they share a name, greet them by first name. Email is optional — only ask once if it fits.",
  "Do not say robotic lines like “live context I'm working from” or “to sharpen the analysis”.",
  "Keep replies short: 1–3 short paragraphs, or a tight bullet list when comparing options.",
  "Recommendations need human approval before client delivery — mention that briefly when relevant.",
].join(" ");

function googleKey(): string | undefined {
  return (
    Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY")?.trim() ||
    Deno.env.get("GEMINI_API_KEY")?.trim() ||
    Deno.env.get("GOOGLE_AI_API_KEY")?.trim() ||
    undefined
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as {
      message?: string;
      history?: ChatMessage[];
      visitorName?: string | null;
      visitorEmail?: string | null;
      toolDigest?: string | null;
    };

    const message = (body.message ?? "").trim().slice(0, 4000);
    if (!message) {
      return jsonResponse({ error: "message is required" }, 400);
    }

    const key = googleKey();
    if (!key) {
      return jsonResponse(
        {
          error: "Gemini is not configured on this function.",
          usedLlm: false,
          reply:
            "Hey — I'm Ope. Tell me your name and what you want to figure out about coverage or renewals.",
        },
        200,
      );
    }

    const history = (Array.isArray(body.history) ? body.history : [])
      .filter((m) => m.content?.trim())
      .slice(-10);

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    for (const m of history) {
      const role = m.role === "assistant" ? "model" : "user";
      contents.push({
        role,
        parts: [{ text: String(m.content).slice(0, 4000) }],
      });
    }

    const prompt = [
      `Visitor name: ${(body.visitorName ?? "").trim() || "(unknown)"}`,
      `Visitor email: ${(body.visitorEmail ?? "").trim() || "(not shared)"}`,
      `Optional tool grounding: ${(body.toolDigest ?? "").trim() || "(none)"}`,
      ``,
      `Current message: ${message}`,
      ``,
      `Reply as Ope now.`,
    ].join("\n");

    contents.push({ role: "user", parts: [{ text: prompt }] });

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      encodeURIComponent(key);

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: OPE_SYSTEM }] },
        contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 700,
        },
      }),
    });

    const geminiJson = (await geminiRes.json().catch(() => ({}))) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
      error?: { message?: string };
    };

    if (!geminiRes.ok) {
      return jsonResponse(
        {
          error: geminiJson.error?.message ?? "Gemini request failed",
          usedLlm: false,
          reply:
            "I'm having a brief connection blip. Ask me again in a moment — or tell me your name and the insurance question on your mind.",
        },
        200,
      );
    }

    const reply = geminiJson.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();

    if (!reply) {
      return jsonResponse(
        {
          usedLlm: false,
          reply: "Tell me a bit more and I'll dig in.",
        },
        200,
      );
    }

    return jsonResponse({ reply, usedLlm: true });
  } catch (err) {
    return jsonResponse(
      {
        error: err instanceof Error ? err.message : "Unexpected error",
        usedLlm: false,
        reply:
          "Something went sideways on my side. Try once more — I'm here.",
      },
      200,
    );
  }
});
