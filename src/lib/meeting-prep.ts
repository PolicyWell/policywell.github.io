import { buildHybridContext, generateAgentReport } from "./context-engine";
import { modelFundingScenarios } from "./scenarios";
import { approvedForReport, type Recommendation } from "./recommendations";
import type { FollowUpTask } from "./tasks";
import type { IngestedDocument, UserProfile } from "./types";

export interface MeetingPrepPack {
  clientName: string;
  preparedFor: string;
  generatedAt: string;
  agenda: string[];
  talkingPoints: string[];
  approvedRecommendations: { title: string; rationale: string }[];
  openTasks: { title: string; dueDate: string }[];
  questions: string[];
  warnings: string[];
  documentsOnFile: string[];
  scenarioSummary: string[];
  assumptions: string[];
}

/**
 * Advisor meeting preparation pack (Manual §11). Content derives from the
 * hybrid context, the deterministic report, and ONLY human-approved
 * recommendations.
 */
export function generateMeetingPrep(
  profile: UserProfile,
  documents: IngestedDocument[],
  recommendations: Recommendation[] = [],
  tasks: FollowUpTask[] = [],
): MeetingPrepPack {
  const context = buildHybridContext(profile, documents);
  const report = generateAgentReport(profile, documents);
  const approved = approvedForReport(recommendations);
  const openTasks = tasks.filter((t) => t.status === "open");

  const scenarioSummary: string[] = [];
  if (documents[0]) {
    for (const s of modelFundingScenarios(documents[0].extraction)) {
      scenarioSummary.push(
        s.lapseYear
          ? `${s.name} ($${s.annualPremium.toLocaleString()}/yr): projected lapse in year ${s.lapseYear}.`
          : `${s.name} ($${s.annualPremium.toLocaleString()}/yr): no projected lapse over ${s.years.length} years, ending cash ≈ $${s.endingCashValue.toLocaleString()}.`,
      );
    }
  }

  const agenda = [
    "Review household and goal changes since last meeting",
    "Walk through PolicyWell scores and what moved them",
    ...(approved.length ? ["Present approved recommendations"] : []),
    ...(report.questions.length ? ["Resolve open questions"] : []),
    ...(openTasks.length ? ["Confirm follow-up task owners and dates"] : []),
    "Agree next review date",
  ];

  const talkingPoints = [
    `Overall Intelligence Score: ${context.scores.overallIntelligenceScore}/100 (policy health ${context.scores.policyHealthScore}, protection ${context.scores.protectionScore}).`,
    `Household: ${context.household} in ${context.state}; goals: ${context.goals.join(", ") || "to be confirmed"}.`,
    ...(context.missing.length
      ? [`Profile gaps to close in the meeting: ${context.missing.join(", ")}.`]
      : []),
  ];

  return {
    clientName: profile.displayName,
    preparedFor: "Advisor meeting",
    generatedAt: new Date().toISOString(),
    agenda,
    talkingPoints,
    approvedRecommendations: approved.map((r) => ({
      title: r.title,
      rationale: r.rationale,
    })),
    openTasks: openTasks.map((t) => ({ title: t.title, dueDate: t.dueDate })),
    questions: report.questions,
    warnings: report.warnings,
    documentsOnFile: documents.map(
      (d) => `${d.filename} (${d.kind}, ${d.verified ? "verified" : "unverified"})`,
    ),
    scenarioSummary,
    assumptions: context.assumptions.slice(0, 5),
  };
}

export function meetingPrepToMarkdown(pack: MeetingPrepPack): string {
  const lines: string[] = [
    `# Meeting preparation - ${pack.clientName}`,
    ``,
    `Generated ${new Date(pack.generatedAt).toLocaleString()} by PolicyWell.`,
    ``,
    `## Agenda`,
    ...pack.agenda.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `## Talking points`,
    ...pack.talkingPoints.map((t) => `- ${t}`),
  ];

  if (pack.approvedRecommendations.length) {
    lines.push(``, `## Approved recommendations`);
    for (const r of pack.approvedRecommendations) {
      lines.push(`- **${r.title}** - ${r.rationale}`);
    }
  }

  if (pack.openTasks.length) {
    lines.push(``, `## Open follow-up tasks`);
    for (const t of pack.openTasks) {
      lines.push(`- [ ] ${t.title} (due ${t.dueDate})`);
    }
  }

  if (pack.questions.length) {
    lines.push(``, `## Questions to resolve`, ...pack.questions.map((q) => `- ${q}`));
  }
  if (pack.warnings.length) {
    lines.push(``, `## Warnings`, ...pack.warnings.map((w) => `- ${w}`));
  }
  if (pack.scenarioSummary.length) {
    lines.push(``, `## Funding scenarios`, ...pack.scenarioSummary.map((s) => `- ${s}`));
  }
  lines.push(
    ``,
    `## Documents on file`,
    ...pack.documentsOnFile.map((d) => `- ${d}`),
    ``,
    `## Assumptions`,
    ...pack.assumptions.map((a) => `- ${a}`),
    ``,
    `---`,
    `PolicyWell - recommendations require human approval; scores are deterministic and explainable.`,
  );

  return lines.join("\n");
}
