import { z } from "zod";
import { answerCarrierQuestion } from "@/lib/carrier-kb";
import { comparePolicies } from "@/lib/comparison";
import {
  answerPolicyQuestion,
  buildHybridContext,
} from "@/lib/context-engine";
import { extractFromUtterance } from "@/lib/onboarding";
import {
  approvedForReport,
  decideRecommendation,
  generateRecommendations,
  type Recommendation,
} from "@/lib/recommendations";
import { modelFundingScenarios } from "@/lib/scenarios";
import { computePolicyWellScores } from "@/lib/scoring";
import {
  tasksFromApprovedRecommendations,
  type FollowUpTask,
} from "@/lib/tasks";
import type {
  IngestedDocument,
  SessionUser,
  UserProfile,
} from "@/lib/types";

export interface AgentWorkspace {
  user: SessionUser;
  profile: UserProfile;
  documents: IngestedDocument[];
  recommendations: Recommendation[];
  tasks: FollowUpTask[];
}

export interface ToolResult {
  tool: string;
  ok: boolean;
  summary: string;
  data?: unknown;
  workspace?: Partial<
    Pick<AgentWorkspace, "profile" | "recommendations" | "tasks">
  >;
}

export interface AgentTurnResult {
  reply: string;
  toolResults: ToolResult[];
  workspace: AgentWorkspace;
  usedLlm: boolean;
}

const toolSchemas = {
  update_context: z.object({
    utterance: z.string().describe("Natural language facts to extract into profile"),
  }),
  get_context: z.object({}),
  get_scores: z.object({}),
  analyze_policy: z.object({
    question: z.string().describe("Policy question to answer with grounded references"),
  }),
  run_scenarios: z.object({}),
  compare_policies: z.object({}),
  generate_recommendations: z.object({}),
  decide_recommendation: z.object({
    id: z.string(),
    status: z.enum(["approved", "rejected"]),
  }),
  create_tasks: z.object({}),
  ask_carrier: z.object({
    carrier: z.string(),
    question: z.string(),
  }),
} as const;

export type ToolName = keyof typeof toolSchemas;

export function runTool(
  name: ToolName,
  args: Record<string, unknown>,
  workspace: AgentWorkspace,
): ToolResult {
  try {
    switch (name) {
      case "update_context": {
        const { utterance } = toolSchemas.update_context.parse(args);
        const profile = extractFromUtterance(workspace.profile, utterance);
        return {
          tool: name,
          ok: true,
          summary: `Context updated. Confidence ${Math.round(profile.overallConfidence * 100)}%. Missing: ${profile.missingFields.join(", ") || "none"}.`,
          data: {
            overallConfidence: profile.overallConfidence,
            missingFields: profile.missingFields,
            maritalStatus: profile.household.maritalStatus.value,
            dependents: profile.household.dependentsCount.value,
            state: profile.household.state.value,
            carrier: profile.carrier.primaryCarrier.value,
            goals: [
              profile.goals.retirementPlanning.value && "retirement",
              profile.goals.preventLapse.value && "prevent lapse",
              profile.goals.maximizeCashValue.value && "cash value",
            ].filter(Boolean),
          },
          workspace: { profile },
        };
      }
      case "get_context": {
        const ctx = buildHybridContext(workspace.profile, workspace.documents);
        return {
          tool: name,
          ok: true,
          summary: `Context for ${ctx.who} (${ctx.role}): ${ctx.household}; ${ctx.carrier}; ${ctx.state}; goals ${ctx.goals.join(", ") || "unset"}; docs ${ctx.documents.join(", ") || "none"}.`,
          data: ctx,
        };
      }
      case "get_scores": {
        const scores = computePolicyWellScores(
          workspace.profile,
          workspace.documents,
        );
        return {
          tool: name,
          ok: true,
          summary: `Overall ${scores.overallIntelligenceScore}, Policy Health ${scores.policyHealthScore}, Protection ${scores.protectionScore}, Review Priority ${scores.reviewPriorityScore}.`,
          data: scores,
        };
      }
      case "analyze_policy": {
        const { question } = toolSchemas.analyze_policy.parse(args);
        const grounded = answerPolicyQuestion(
          question,
          workspace.profile,
          workspace.documents,
        );
        return {
          tool: name,
          ok: true,
          summary: grounded.answer,
          data: grounded.references,
        };
      }
      case "run_scenarios": {
        if (!workspace.documents[0]) {
          return {
            tool: name,
            ok: false,
            summary: "No policy document loaded. Upload or seed a document first.",
          };
        }
        const scenarios = modelFundingScenarios(workspace.documents[0].extraction);
        return {
          tool: name,
          ok: true,
          summary: scenarios
            .map((s) =>
              s.lapseYear
                ? `${s.name}: lapse year ${s.lapseYear}`
                : `${s.name}: no lapse in ${s.years.length} yrs, ends ~$${s.endingCashValue.toLocaleString()}`,
            )
            .join(" · "),
          data: scenarios.map((s) => ({
            name: s.name,
            annualPremium: s.annualPremium,
            lapseYear: s.lapseYear,
            endingCashValue: s.endingCashValue,
            assumptions: s.assumptions,
          })),
        };
      }
      case "compare_policies": {
        if (workspace.documents.length < 2) {
          return {
            tool: name,
            ok: false,
            summary: "Need at least two documents to compare (e.g. current IUL + proposed FIA).",
          };
        }
        const report = comparePolicies(
          workspace.documents[0],
          workspace.documents[1],
          workspace.profile,
        );
        return {
          tool: name,
          ok: true,
          summary: report.suitabilitySummary,
          data: {
            warnings: report.warnings,
            questions: report.questions,
            rows: report.rows,
          },
        };
      }
      case "generate_recommendations": {
        const recommendations = generateRecommendations(
          workspace.profile,
          workspace.documents,
        );
        return {
          tool: name,
          ok: true,
          summary: `Generated ${recommendations.length} pending recommendation(s). Human approval required before client delivery.`,
          data: recommendations.map((r) => ({
            id: r.id,
            title: r.title,
            confidence: r.confidence,
          })),
          workspace: { recommendations },
        };
      }
      case "decide_recommendation": {
        const { id, status } = toolSchemas.decide_recommendation.parse(args);
        const recommendations = decideRecommendation(
          workspace.recommendations,
          id,
          status,
        );
        const hit = recommendations.find((r) => r.id === id);
        return {
          tool: name,
          ok: !!hit,
          summary: hit
            ? `Recommendation "${hit.title}" marked ${status}.`
            : `No recommendation with id ${id}.`,
          workspace: { recommendations },
        };
      }
      case "create_tasks": {
        const tasks = tasksFromApprovedRecommendations(
          workspace.recommendations,
          workspace.tasks,
        );
        const approved = approvedForReport(workspace.recommendations);
        return {
          tool: name,
          ok: true,
          summary:
            approved.length === 0
              ? "No approved recommendations yet - approve first."
              : `Follow-up tasks now total ${tasks.length} (${approved.length} approved source(s)).`,
          data: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            dueDate: t.dueDate,
            status: t.status,
          })),
          workspace: { tasks },
        };
      }
      case "ask_carrier": {
        const { carrier, question } = toolSchemas.ask_carrier.parse(args);
        const answer = answerCarrierQuestion(carrier, question);
        return {
          tool: name,
          ok: answer.supported,
          summary: answer.supported
            ? answer.answer
            : `Declined: ${answer.answer}`,
          data: answer,
        };
      }
      default:
        return { tool: String(name), ok: false, summary: "Unknown tool." };
    }
  } catch (err) {
    return {
      tool: name,
      ok: false,
      summary: err instanceof Error ? err.message : "Tool failed.",
    };
  }
}

export const TOOL_CATALOG: { name: ToolName; description: string }[] = [
  { name: "update_context", description: "Extract household/policy/goal facts from user speech into structured profile" },
  { name: "get_context", description: "Read current hybrid context (who, role, household, carrier, docs, goals)" },
  { name: "get_scores", description: "Compute deterministic PolicyWell scores" },
  { name: "analyze_policy", description: "Answer a grounded policy question using uploaded documents" },
  { name: "run_scenarios", description: "Project current/target/stop-paying funding scenarios" },
  { name: "compare_policies", description: "Compare two ingested documents with suitability warnings" },
  { name: "generate_recommendations", description: "Create pending recommendations requiring human approval" },
  { name: "decide_recommendation", description: "Approve or reject a recommendation by id" },
  { name: "create_tasks", description: "Turn approved recommendations into dated follow-up tasks" },
  { name: "ask_carrier", description: "Answer from approved carrier content packs only" },
];
