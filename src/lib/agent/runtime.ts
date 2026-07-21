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
    parts.push(`Got it, ${name}. ${updated.summary}`);
  }

  for (const t of toolResults) {
    if (t.tool === "update_context") continue;
    if (!t.ok) {
      parts.push(t.summary);
      continue;
    }
    switch (t.tool) {
      case "get_context":
        parts.push(`Here's what I currently know. ${t.summary}`);
        break;
      case "get_scores":
        parts.push(
          `PolicyWell scores (deterministic, explainable): ${t.summary}. ` +
            `Ask me to walk through any score or run funding scenarios.`,
        );
        break;
      case "analyze_policy": {
        const refs = t.data as
          | { document?: string; extractedValues?: string[]; confidence?: number; assumptions?: string[] }
          | undefined;
        parts.push(t.summary);
        if (refs) {
          parts.push(
            `Grounding — document: ${refs.document ?? "none"}; ` +
              `extracted: ${(refs.extractedValues ?? []).join(", ") || "—"}; ` +
              `confidence: ${Math.round((refs.confidence ?? 0) * 100)}%.`,
          );
        }
        break;
      }
      case "run_scenarios":
        parts.push(`Funding scenarios under documented assumptions: ${t.summary}`);
        break;
      case "compare_policies": {
        const data = t.data as { warnings?: string[]; questions?: string[] } | undefined;
        parts.push(t.summary);
        if (data?.warnings?.length) {
          parts.push(`Warnings: ${data.warnings.join(" ")}`);
        }
        if (data?.questions?.length) {
          parts.push(`Questions for the meeting: ${data.questions.slice(0, 3).join(" ")}`);
        }
        break;
      }
      case "generate_recommendations": {
        const data = t.data as { id: string; title: string }[] | undefined;
        parts.push(t.summary);
        if (data?.length) {
          parts.push(
            "Pending items:\n" +
              data.map((r) => `• ${r.id}: ${r.title}`).join("\n") +
              "\nSay “approve all” or “approve rec_fund_to_target” when ready. Nothing reaches a client report until you approve.",
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
      `Still missing for fuller context: ${profile.missingFields.slice(0, 4).join(", ")}.`,
    );
  }

  return parts.filter(Boolean).join("\n\n");
}
