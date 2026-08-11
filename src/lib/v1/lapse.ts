export const ORIGINAL_ILLUSTRATION_LAPSE_NOTE =
  "This analysis is based on the original illustration. Current policy status requires an updated in-force illustration.";

export type LapseInputs = {
  guaranteedCoverageCessationAge: number | null;
  midpointCoverageCessationAge: number | null;
  illustratedDurationYears: number | null;
  documentType: string | null;
};

export type LapseResult = {
  guaranteedCessationAge: number | null;
  midpointCessationAge: number | null;
  illustratedDurationYears: number | null;
  notes: string[];
};

export function buildLapseResult(inputs: LapseInputs): LapseResult {
  const notes: string[] = [];
  if (inputs.documentType === "original_illustration") {
    notes.push(ORIGINAL_ILLUSTRATION_LAPSE_NOTE);
  }

  return {
    guaranteedCessationAge: inputs.guaranteedCoverageCessationAge,
    midpointCessationAge: inputs.midpointCoverageCessationAge,
    illustratedDurationYears: inputs.illustratedDurationYears,
    notes,
  };
}
