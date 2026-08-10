import { DEFAULT_API_BASE } from "./config";

export function printHelp(): void {
  const text = `
PolicyWell CLI — local HTTP client for PolicyWell intelligence

Usage:
  policywell <command> [options]

Commands:
  init                         Initialize local CLI config and API workspace
  ingest <path>                Upload a policy document for ingestion
  summary                      Policy / household summary
  funding                      Funding adequacy analysis
  lapse                        Lapse-risk analysis
  cashvalue --age <age>        Projected cash value at attained age
  scenario --premium <amount>  Run a funding scenario at a premium level
  stats                        Workspace / book stats

Global options:
  --api <url>                  API base (default: ${DEFAULT_API_BASE})
  --help, -h                   Show this help
  --version, -v                Show CLI version

Environment:
  POLICYWELL_API_BASE          Override default API base URL

Examples:
  policywell init
  policywell ingest ./statement.pdf
  policywell summary
  policywell cashvalue --age 65
  policywell scenario --premium 612
`.trim();

  process.stdout.write(`${text}\n`);
}
