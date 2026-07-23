export type TerminalTone =
  | "default"
  | "command"
  | "success"
  | "muted"
  | "warn"
  | "accent"
  | "blank"
  | "dim";

export type TerminalLine = {
  text: string;
  tone?: TerminalTone;
  delayMs?: number;
};

export type CliAudience = {
  id: string;
  label: string;
  shortLabel: string;
  lines: TerminalLine[];
  architecture?: string[];
};

export const CLI_AUDIENCES: CliAudience[] = [
  {
    id: "policyholders",
    label: "Policyholders",
    shortLabel: "Policyholders",
    lines: [
      {
        text: "$ policywell policy connect --carrier mutual-of-omaha",
        tone: "command",
      },
      { text: "✓ Secure carrier connection established", tone: "success" },
      { text: "✓ Policy 7842 imported", tone: "success" },
      { text: "✓ Annual statement verified", tone: "success" },
      { text: "", tone: "blank" },
      {
        text: "$ policywell review run --household alex-morgan",
        tone: "command",
      },
      { text: "", tone: "blank" },
      { text: "Analyzing:", tone: "muted" },
      { text: "  Policy type        Indexed Universal Life", tone: "default" },
      { text: "  Death benefit      $1,250,000", tone: "default" },
      { text: "  Monthly premium    $612", tone: "default" },
      { text: "  Cash value         $256,800", tone: "default" },
      { text: "  Next review        45 days", tone: "default" },
      { text: "", tone: "blank" },
      { text: "✓ Coverage analysis complete", tone: "success" },
      { text: "✓ Lapse-risk model complete", tone: "success" },
      { text: "✓ Household goals matched", tone: "success" },
      { text: "", tone: "blank" },
      { text: "Recommendation:", tone: "accent" },
      { text: "  KEEP IN FORCE", tone: "success" },
      { text: "", tone: "blank" },
      { text: "Reason:", tone: "muted" },
      { text: "  Coverage remains appropriate", tone: "default" },
      { text: "  Current surrender period ends May 2027", tone: "default" },
      { text: "  Premium funding is currently sustainable", tone: "default" },
      { text: "", tone: "blank" },
      { text: "Opportunity:", tone: "warn" },
      { text: "  Increase retirement funding by $275/month", tone: "default" },
      { text: "", tone: "blank" },
      { text: "Report:", tone: "muted" },
      { text: "  /reports/alex-morgan-policy-review.pdf", tone: "dim" },
    ],
  },
  {
    id: "carriers",
    label: "Insurance Carriers",
    shortLabel: "Carriers",
    architecture: [
      "Legacy Policy System",
      "PolicyWell CLI / API",
      "AI Reasoning Layer",
      "Advisor or Carrier Workflow",
    ],
    lines: [
      {
        text: "$ policywell carrier init --environment production",
        tone: "command",
      },
      { text: "✓ Organization authenticated", tone: "success" },
      { text: "✓ Compliance profile loaded", tone: "success" },
      { text: "✓ Policy administration connector ready", tone: "success" },
      { text: "", tone: "blank" },
      { text: "$ policywell ingest sync \\", tone: "command" },
      { text: "  --source legacy-mainframe \\", tone: "command" },
      { text: "  --product iul \\", tone: "command" },
      { text: "  --batch 10000", tone: "command" },
      { text: "", tone: "blank" },
      { text: "Processing policies...", tone: "muted" },
      { text: "✓ 10,000 policy records normalized", tone: "success" },
      { text: "✓ 9,842 annual statements matched", tone: "success" },
      { text: "✓ 327 lapse-risk opportunities detected", tone: "success" },
      { text: "✓ 184 retention interventions prioritized", tone: "success" },
      { text: "", tone: "blank" },
      {
        text: "$ policywell api deploy --workflow policy-review",
        tone: "command",
      },
      { text: "", tone: "blank" },
      { text: "Endpoints:", tone: "accent" },
      { text: "  POST /v1/policies/ingest", tone: "default" },
      { text: "  POST /v1/reviews/run", tone: "default" },
      { text: "  GET  /v1/recommendations", tone: "default" },
      { text: "  POST /v1/advisor-approval", tone: "default" },
      { text: "", tone: "blank" },
      { text: "Integration status:", tone: "muted" },
      { text: "  Guidewire      connected", tone: "success" },
      { text: "  Salesforce     connected", tone: "success" },
      { text: "  Mainframe      connected", tone: "success" },
      { text: "  SFTP batch     active", tone: "success" },
      { text: "", tone: "blank" },
      { text: "No rip-and-replace required.", tone: "accent" },
      { text: "", tone: "blank" },
      { text: "Report:", tone: "muted" },
      { text: "  /reports/carrier-retention-opportunities.json", tone: "dim" },
    ],
  },
  {
    id: "imos",
    label: "Insurance Marketing Organizations",
    shortLabel: "IMOs",
    lines: [
      {
        text: "$ policywell imo import --book national-advisors",
        tone: "command",
      },
      { text: "✓ 4,826 policies imported", tone: "success" },
      { text: "✓ 312 advisors matched", tone: "success" },
      { text: "✓ Carrier appointments verified", tone: "success" },
      { text: "", tone: "blank" },
      { text: "$ policywell opportunities scan \\", tone: "command" },
      { text: "  --include replacements \\", tone: "command" },
      { text: "  --include upgrades \\", tone: "command" },
      { text: "  --include retention", tone: "command" },
      { text: "", tone: "blank" },
      { text: "Results:", tone: "accent" },
      { text: "  214 replacement opportunities", tone: "default" },
      { text: "  386 coverage upgrades", tone: "default" },
      { text: "  742 annual reviews due", tone: "default" },
      { text: "  129 lapse-risk interventions", tone: "warn" },
      { text: "", tone: "blank" },
      { text: "$ policywell route \\", tone: "command" },
      { text: "  --to licensed-brokers \\", tone: "command" },
      { text: "  --require human-approval", tone: "command" },
      { text: "", tone: "blank" },
      { text: "✓ Recommendations assigned", tone: "success" },
      { text: "✓ Compliance review enabled", tone: "success" },
      { text: "✓ Client-ready reports generated", tone: "success" },
      { text: "✓ Commission attribution configured", tone: "success" },
      { text: "", tone: "blank" },
      { text: "Top opportunity:", tone: "muted" },
      { text: "  Household          Morgan Family", tone: "default" },
      { text: "  Current policy     IUL", tone: "default" },
      { text: "  Recommendation     Increase coverage", tone: "default" },
      { text: "  Estimated premium  +$188/month", tone: "default" },
      { text: "  Assigned broker    J. Smith", tone: "default" },
      { text: "  Status             Awaiting approval", tone: "warn" },
      { text: "", tone: "blank" },
      { text: "Revenue workflow:", tone: "accent" },
      { text: "  Recommendation", tone: "dim" },
      { text: "  → Broker approval", tone: "dim" },
      { text: "  → Client presentation", tone: "dim" },
      { text: "  → Application", tone: "dim" },
      { text: "  → Carrier submission", tone: "dim" },
      { text: "  → Commission attribution", tone: "dim" },
      { text: "", tone: "blank" },
      { text: "Report:", tone: "muted" },
      { text: "  /reports/imo-opportunity-pipeline.csv", tone: "dim" },
    ],
  },
];
