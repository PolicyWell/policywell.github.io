import type { ToolName } from "./tools";
import type { AgentWorkspace } from "./tools";

export interface PlannedCall {
  tool: ToolName;
  args: Record<string, unknown>;
}

export type AgentPlanMode = "analyst" | "ope";

/**
 * Intent planner: maps a user utterance to an ordered list of tool calls.
 * Always updates context from free-form speech first (Manual §7).
 */
export function planToolCalls(
  message: string,
  workspace: AgentWorkspace,
  options: { mode?: AgentPlanMode } = {},
): PlannedCall[] {
  const mode = options.mode ?? "analyst";
  const q = message.toLowerCase();
  const calls: PlannedCall[] = [];

  // Every interaction may carry new context (Manual: update context before answering)
  const looksLikeFacts =
    /\b(i('m| am)|i have|i own|married|kids|child|mortgage|policy|iul|annuity|retire|lapse|live in|make|earn)\b/i.test(
      message,
    );
  if (looksLikeFacts) {
    calls.push({ tool: "update_context", args: { utterance: message } });
  }

  if (/\b(score|how am i|health|protection|priority)\b/i.test(q)) {
    calls.push({ tool: "get_scores", args: {} });
  }

  if (
    /\b(lapse|fund|premium|borrow|loan|stop paying|cash value|will my|what happens|how much)\b/i.test(
      q,
    )
  ) {
    calls.push({ tool: "analyze_policy", args: { question: message } });
  }

  if (/\b(scenarios?|project|if i (stop|keep)|funding)\b/i.test(q)) {
    calls.push({ tool: "run_scenarios", args: {} });
  }

  if (/\b(compare|1035|replace|vs\.?|versus|suitability)\b/i.test(q)) {
    calls.push({ tool: "compare_policies", args: {} });
  }

  if (/\b(recommend|what should|opportunit|next step)\b/i.test(q)) {
    calls.push({ tool: "generate_recommendations", args: {} });
  }

  const approveMatch = message.match(
    /\b(approve|reject)\b.{0,40}?\b(rec_[a-z_]+)\b/i,
  );
  if (approveMatch) {
    calls.push({
      tool: "decide_recommendation",
      args: {
        id: approveMatch[2].toLowerCase(),
        status: approveMatch[1].toLowerCase() === "approve" ? "approved" : "rejected",
      },
    });
  } else if (/\bapprove all\b/i.test(q) && workspace.recommendations.length) {
    for (const r of workspace.recommendations.filter((x) => x.status === "pending")) {
      calls.push({
        tool: "decide_recommendation",
        args: { id: r.id, status: "approved" },
      });
    }
  }

  if (/\b(task|follow[- ]?up|to[- ]?do)\b/i.test(q)) {
    calls.push({ tool: "create_tasks", args: {} });
  }

  if (/\b(mutual of omaha|athene|carrier|explain (the )?product|illustrat)\b/i.test(q)) {
    const carrier = /athene/i.test(q)
      ? "Athene"
      : workspace.profile.carrier.primaryCarrier.value || "Mutual of Omaha";
    calls.push({
      tool: "ask_carrier",
      args: { carrier, question: message },
    });
  }

  if (/\b(who am i|what do you know|context|my profile|household)\b/i.test(q)) {
    calls.push({ tool: "get_context", args: {} });
  }

  const commercial =
    /\b(commercial|business|loss run|workers.?comp|general liability|carrier appetite|underwriting requirement|certificate|coverage (is )?missing|reduce (its |my )?risk|renewal)\b/i.test(
      q,
    );
  if (commercial) {
    let focus: "gaps" | "appetite" | "underwriting" | "loss_runs" | "overview" =
      "overview";
    if (/\b(gap|missing coverage|underinsured)\b/i.test(q)) focus = "gaps";
    else if (/\b(appetite|which carriers?|consider this risk)\b/i.test(q))
      focus = "appetite";
    else if (/\b(underwriting|requirements?|aps|labs?)\b/i.test(q))
      focus = "underwriting";
    else if (/\bloss run/i.test(q)) focus = "loss_runs";
    calls.push({ tool: "assess_commercial_risk", args: { focus } });
  }

  // Default path when nothing matched except maybe update_context
  if (calls.filter((c) => c.tool !== "update_context").length === 0) {
    if (workspace.documents.length) {
      calls.push({ tool: "analyze_policy", args: { question: message } });
      calls.push({ tool: "get_scores", args: {} });
    } else if (!looksLikeFacts && mode !== "ope") {
      // Analyst console defaults to a context dump; Meet Ope stays conversational.
      calls.push({ tool: "get_context", args: {} });
    }
  }

  return calls;
}
