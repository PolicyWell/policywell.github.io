import type { FeedbackEntry, FeedbackKind } from "./types";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Feedback is stored for future review and model improvement.
 * Individual feedback does NOT automatically change scoring logic.
 */
export function createFeedback(input: {
  userId: string;
  recommendationId: string;
  kind: FeedbackKind;
  correction?: string;
}): FeedbackEntry {
  return {
    id: uid("fb"),
    userId: input.userId,
    recommendationId: input.recommendationId,
    kind: input.kind,
    correction: input.correction,
    createdAt: new Date().toISOString(),
  };
}

export function summarizeFeedback(entries: FeedbackEntry[]): {
  accurate: number;
  needsCorrection: number;
  notHelpful: number;
  corrections: string[];
} {
  return {
    accurate: entries.filter((e) => e.kind === "accurate").length,
    needsCorrection: entries.filter((e) => e.kind === "needs_correction").length,
    notHelpful: entries.filter((e) => e.kind === "not_helpful").length,
    corrections: entries
      .filter((e) => e.kind === "needs_correction" && e.correction)
      .map((e) => e.correction!) ,
  };
}
