import { computePolicyWellScores } from "./scoring";
import type { IngestedDocument, UserProfile } from "./types";

export interface ScoreSnapshot {
  at: string;
  overallIntelligenceScore: number;
  policyHealthScore: number;
  protectionScore: number;
  reviewPriorityScore: number;
}

export const HISTORY_LIMIT = 50;

export function takeSnapshot(
  profile: UserProfile,
  documents: IngestedDocument[],
  at = new Date().toISOString(),
): ScoreSnapshot {
  const s = computePolicyWellScores(profile, documents);
  return {
    at,
    overallIntelligenceScore: s.overallIntelligenceScore,
    policyHealthScore: s.policyHealthScore,
    protectionScore: s.protectionScore,
    reviewPriorityScore: s.reviewPriorityScore,
  };
}

/** Append a snapshot, keeping at most HISTORY_LIMIT entries (oldest dropped). */
export function appendSnapshot(
  history: ScoreSnapshot[],
  snapshot: ScoreSnapshot,
): ScoreSnapshot[] {
  const next = [...history, snapshot];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

export function trendDelta(history: ScoreSnapshot[]): number | null {
  if (history.length < 2) return null;
  return (
    history[history.length - 1].overallIntelligenceScore -
    history[0].overallIntelligenceScore
  );
}
