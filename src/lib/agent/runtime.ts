import type { ToolResult } from "./tools";
import type { AgentWorkspace } from "./tools";

/** Analyst-style reply synthesized from tool results — never invents claims. */
export function synthesizeReply(
  message: string,
  toolResults: ToolResult[],
  workspace: AgentWorkspace,
): string {
  if (!toolResults.length) {
    return (
      "I'm your PolicyWell insurance intelligence agent. Tell me about your household, " +
      "upload a policy, or ask things like “Will my policy lapse?”, “Run funding scenarios”, " +
      "“Compare my policies”, or “What do you recommend?”. " +
      "I update context before answering, and recommendations stay pending until you approve them."
    );
  }

  const parts: string[] = [];
  const profile = workspace.profile;
  const name = profile.displayName.split(" ")[0] || "there";

  const updated = toolResults.find((t) => t.tool === "update_context" && t.ok);
  if (updated) {
    parts.push(`Got it, ${name}. I've updated your PolicyWell context. ${updated.summary}`);
  }

  for (const t of toolResults) {
    if (t.tool === "update_context") continue;
    if (!t.ok) {
      parts.push(t.summary);
      continue;
    }
    switch (t.tool) {
      case "get_context":
        parts.push(`Here's the live context I'm working from:\n${t.summary}`);
        break;
      case "get_scores":
        parts.push(
          `Here are your deterministic PolicyWell scores:\n${t.summary}\n` +
            `These are explainable and not LLM guesses. Ask me to run funding scenarios or recommendations next.`,
        );
        break;
      case "analyze_policy": {
        const refs = t.data as
          | {
              document?: string;
              extractedValues?: string[];
              confidence?: number;
              assumptions?: string[];
            }
          | undefined;
        parts.push(t.summary);
        if (refs) {
          parts.push(
            [
              "Grounding for this answer:",
              `• Document: ${refs.document ?? "none on file"}`,
              `• Extracted values: ${(refs.extractedValues ?? []).join(", ") || "—"}`,
              `• Confidence: ${Math.round((refs.confidence ?? 0) * 100)}%`,
              refs.assumptions?.length
                ? `• Assumptions: ${refs.assumptions.slice(0, 2).join(" ")}`
                : null,
            ]
              .filter(Boolean)
              .join("\n"),
          );
        }
        break;
      }
      case "run_scenarios":
        parts.push(
          `I projected three funding paths under documented assumptions:\n${t.summary}\n` +
            `These are deterministic model outputs — useful for meeting prep, not guarantees.`,
        );
        break;
      case "compare_policies": {
        const data = t.data as
          | { warnings?: string[]; questions?: string[] }
          | undefined;
        parts.push(t.summary);
        if (data?.warnings?.length) {
          parts.push(`Warnings:\n${data.warnings.map((w) => `• ${w}`).join("\n")}`);
        }
        if (data?.questions?.length) {
          parts.push(
            `Questions to resolve in the meeting:\n${data.questions
              .slice(0, 4)
              .map((q) => `• ${q}`)
              .join("\n")}`,
          );
        }
        break;
      }
      case "generate_recommendations": {
        const data = t.data as { id: string; title: string }[] | undefined;
        parts.push(t.summary);
        if (data?.length) {
          parts.push(
            "Pending recommendations (human approval required before client delivery):\n" +
              data.map((r) => `• ${r.id}: ${r.title}`).join("\n") +
              "\nSay “approve all” or “approve rec_fund_to_target” when you're ready.",
          );
        }
        break;
      }
      case "decide_recommendation":
      case "create_tasks":
      case "ask_carrier":
        parts.push(t.summary);
        break;
      default:
        parts.push(t.summary);
    }
  }

  if (
    profile.missingFields.length &&
    !/score|lapse|scenario|recommend|compare/i.test(message)
  ) {
    parts.push(
      `To sharpen the analysis, I still need: ${profile.missingFields
        .slice(0, 4)
        .join(", ")}.`,
    );
  }

  return parts.filter(Boolean).join("\n\n");
}
