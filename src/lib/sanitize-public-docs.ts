/** Strip internal sprint / provider language before rendering public docs. */
export function sanitizePublicDocsMarkdown(md: string): string {
  return md
    .replace(/\*\*Status:\*\*[^\n]*/i, "**Status:** Preview")
    .replace(/Sprint\s+\d+[^\n.]*/gi, "product milestone")
    .replace(/sprint\s+planning/gi, "product planning")
    .replace(/Next sprint candidates/gi, "Next priorities")
    .replace(/Previous sprint:/gi, "Previous:")
    .replace(/Gemini\/OpenAI/gi, "optional LLM phrasing")
    .replace(/\bGemini\b/gi, "the reasoning engine")
    .replace(/Google AI Studio/gi, "the model provider")
    .replace(/AI Studio/gi, "the model provider")
    .replace(/no production deploy[^\n]*/gi, "enterprise rollout guidance")
    .replace(/Engineering Manual/gi, "architecture reference")
    .replace(/## Sprint \d[^\n]*/gi, "## Implementation status");
}
