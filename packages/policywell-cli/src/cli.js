import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";

const CONFIG_NAME = ".policywell.json";
const DEFAULT_API = process.env.POLICYWELL_API_URL ?? "http://localhost:3000/api/v1";
const DEFAULT_CASE_NAME = "Pear X 27 Live Demo";

function brand() {
  console.log("PolicyWell");
}

function fail(message, code = 1) {
  console.error(`Error: ${message}`);
  process.exit(code);
}

function loadConfig(cwd = process.cwd()) {
  const path = resolve(cwd, CONFIG_NAME);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function saveConfig(config, cwd = process.cwd()) {
  const path = resolve(cwd, CONFIG_NAME);
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return path;
}

function money(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

function ratio(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

async function api(method, path, { body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const url = `${DEFAULT_API.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, { method, headers, body: payload });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    fail(`API returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    fail(json.error || `HTTP ${res.status}`);
  }
  return json;
}

function requireCase(config) {
  if (!config?.caseId) {
    fail(`No case found. Run: policywell init --name "Pear X 27 Live Demo"`);
  }
  return config.caseId;
}

async function cmdInit(flags) {
  const displayName = flags.name?.trim() || DEFAULT_CASE_NAME;
  brand();
  console.log(`Creating case: ${displayName}\n`);
  const result = await api("POST", "/cases", {
    body: { displayName, caseType: "life" },
  });
  const config = {
    caseId: result.caseId,
    accessToken: result.accessToken,
    apiUrl: DEFAULT_API,
    displayName,
    createdAt: new Date().toISOString(),
  };
  const path = saveConfig(config);
  console.log(`✓ Case created`);
  console.log(`  name    ${displayName}`);
  console.log(`  caseId  ${result.caseId}`);
  console.log(`  config  ${path}`);
}

async function cmdIngest(fileArg) {
  if (!fileArg) fail("Usage: policywell ingest <file>");
  const config = loadConfig();
  const caseId = requireCase(config);
  const filePath = resolve(process.cwd(), fileArg);
  if (!existsSync(filePath)) fail(`File not found: ${filePath}`);

  const filename = basename(filePath);
  brand();
  console.log(`Analyzing ${filename}\n`);

  const bytes = readFileSync(filePath);
  const result = await api("POST", `/cases/${caseId}/documents`, {
    token: config.accessToken,
    body: {
      filename,
      mimeType: filename.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : filename.toLowerCase().endsWith(".json")
          ? "application/json"
          : "text/plain",
      contentBase64: bytes.toString("base64"),
    },
  });

  for (const step of result.steps ?? []) {
    console.log(`✓ ${step}`);
  }
  console.log("");
  if (result.extraction) {
    console.log(`  Carrier   ${result.extraction.carrier ?? "—"}`);
    console.log(`  Product   ${result.extraction.product ?? "—"}`);
    console.log(`  Insured   ${result.extraction.insuredName ?? "—"}`);
    console.log(`  Monthly   ${money(result.extraction.monthlyPremium)}`);
    console.log(`  Ledger    ${result.extraction.ledgerRows ?? 0} rows`);
  }
  console.log(`\nLive questions: policywell ask "is this funded?"`);
}

async function cmdSummary() {
  const config = loadConfig();
  const caseId = requireCase(config);
  const data = await api("GET", `/cases/${caseId}/summary`, {
    token: config.accessToken,
  });
  brand();
  console.log("Case summary\n");
  console.log(`  Case      ${data.case?.display_name ?? caseId}`);
  console.log(`  Status    ${data.case?.status ?? "—"}`);
  console.log(`  Carrier   ${data.policy?.carrier ?? "—"}`);
  console.log(`  Product   ${data.policy?.product ?? "—"}`);
  console.log(`  Insured   ${data.policy?.insured_name ?? "—"}`);
  console.log(`  Issue age ${data.policy?.issue_age ?? "—"}`);
  console.log(`  DB        ${money(data.policy?.death_benefit)}`);
  console.log(`  Monthly   ${money(data.policy?.modal_premium)}`);
  console.log(`  Annual    ${money(data.policy?.annualized_premium)}`);
  console.log(`  No-lapse  ${money(data.policy?.no_lapse_annual_premium)}`);
  if (data.requiresCurrentInforceIllustration) {
    console.log(
      "\n  Note: based on original illustration — request an updated in-force illustration for current status.",
    );
  }
}

async function cmdFunding() {
  const config = loadConfig();
  const caseId = requireCase(config);
  const data = await api("GET", `/cases/${caseId}/funding`, {
    token: config.accessToken,
  });
  brand();
  console.log("Funding analysis\n");
  console.log(`  Monthly premium              ${money(data.monthlyPremium)}`);
  console.log(`  Annual funding               ${money(data.annualFunding)}`);
  console.log(`  No-lapse annual premium      ${money(data.noLapseAnnualPremium)}`);
  console.log(`  Amount above no-lapse        ${money(data.amountAboveNoLapse)}`);
  console.log(`  Funding ratio                ${ratio(data.fundingRatio)}`);
  console.log(
    `  Guideline maximum (level)    ${money(data.guidelineMaximumLevelPremium)}`,
  );
  console.log(
    `  Remaining guideline room     ${money(data.remainingGuidelineRoom)}`,
  );
}

async function cmdLapse() {
  const config = loadConfig();
  const caseId = requireCase(config);
  const data = await api("GET", `/cases/${caseId}/lapse`, {
    token: config.accessToken,
  });
  brand();
  console.log("Lapse / coverage duration\n");
  console.log(`  Guaranteed cessation age     ${data.guaranteedCessationAge ?? "—"}`);
  console.log(`  Midpoint cessation age       ${data.midpointCessationAge ?? "—"}`);
  console.log(
    `  Illustrated duration (yrs)   ${data.illustratedDurationYears ?? "—"}`,
  );
  for (const note of data.notes ?? []) {
    console.log(`\n  ${note}`);
  }
}

async function cmdCashvalue(age) {
  if (age == null || Number.isNaN(Number(age))) {
    fail("Usage: policywell cashvalue --age <age>");
  }
  const config = loadConfig();
  const caseId = requireCase(config);
  const data = await api("GET", `/cases/${caseId}/cashvalue?age=${Number(age)}`, {
    token: config.accessToken,
  });
  brand();
  console.log(`Cash value at age ${age}\n`);
  if (data.matchKind === "none") {
    fail("No ledger rows with attained age available");
  }
  if (data.matchKind === "closest") {
    console.log(`  (closest ledger age ${data.matchedAge}, year ${data.policyYear})\n`);
  } else {
    console.log(`  (exact match, policy year ${data.policyYear})\n`);
  }
  console.log(
    `  Cumulative premiums paid                      ${money(data.cumulativePremiumOutlay)}`,
  );
  console.log(
    `  Guaranteed accumulation                       ${money(data.guaranteedAccumulationValue)}`,
  );
  console.log(
    `  Guaranteed surrender                          ${money(data.guaranteedSurrenderValue)}`,
  );
  console.log(
    `  Alternate accumulation (non-guaranteed)       ${money(data.alternateAccumulationValue)}`,
  );
  console.log(
    `  Alternate surrender (non-guaranteed)          ${money(data.alternateSurrenderValue)}`,
  );
  console.log(
    `  Illustrated accumulation (non-guaranteed)     ${money(data.illustratedAccumulationValue)}`,
  );
  console.log(
    `  Illustrated surrender (non-guaranteed)        ${money(data.illustratedSurrenderValue)}`,
  );
  const net = data.illustratedNetOfCharges;
  const netText =
    net == null
      ? "—"
      : `${net >= 0 ? "+" : ""}${money(net)}`;
  console.log(
    `  Illustrated net of charges (AV − premiums)    ${netText}`,
  );
  console.log(
    `  Death benefit                                 ${money(data.deathBenefit)}`,
  );
  if (data.illustratedCreditingRatePct != null) {
    console.log(
      `  Illustrated crediting rate                    ${data.illustratedCreditingRatePct}%`,
    );
  }
  console.log(`\n  ${data.disclaimer ?? "Non-guaranteed illustrated values are labeled above."}`);
}

async function cmdScenario(premium) {
  if (premium == null || Number.isNaN(Number(premium))) {
    fail("Usage: policywell scenario --premium <monthly_amount>");
  }
  const config = loadConfig();
  const caseId = requireCase(config);
  const data = await api("POST", `/cases/${caseId}/scenario`, {
    token: config.accessToken,
    body: { premium: Number(premium) },
  });
  brand();
  console.log("Scenario analysis\n");
  console.log(`  New monthly premium                      ${money(data.newMonthlyPremium)}`);
  console.log(`  New annual premium                       ${money(data.newAnnualPremium)}`);
  console.log(
    `  Additional annual funding                 ${money(data.additionalAnnualFunding)}`,
  );
  console.log(
    `  Difference from guideline maximum level   ${money(data.differenceFromGuidelineMaximum)}`,
  );
  console.log(`\n  ${data.disclaimer}`);
}

async function cmdAsk(questionParts) {
  const question = questionParts.join(" ").trim();
  if (!question) {
    fail('Usage: policywell ask "is this funded above no-lapse?"');
  }
  const config = loadConfig();
  const caseId = requireCase(config);
  const data = await api("POST", `/cases/${caseId}/ask`, {
    token: config.accessToken,
    body: { question },
  });
  brand();
  console.log(`Q  ${data.question}`);
  if (Array.isArray(data.options) && data.options.length > 0) {
    console.log(`A  Five hypothetical alternatives vs current case:\n`);
    for (const o of data.options) {
      console.log(`  ${o.rank}. ${o.carrier}`);
      console.log(`     ${o.product}`);
      console.log(
        `     Premium ${money(o.monthlyPremium)}/mo · DB ${money(o.deathBenefit)} · CV@52 ${money(o.illustratedCashValueAtAge52)}`,
      );
      console.log(`     DB option: ${o.deathBenefitOption}`);
      console.log(`     ${o.highlight}`);
      console.log(`     Why: ${o.whyBetter}\n`);
    }
  } else {
    console.log(`A  ${data.answer}`);
  }
  if (data.disclaimer) {
    console.log(`  ${data.disclaimer}`);
  }
}

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const flags = {};
  const positionals = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--age" || arg === "--premium" || arg === "--name") {
      flags[arg.slice(2)] = rest[++i];
    } else if (arg.startsWith("--")) {
      fail(`Unknown flag: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }
  return { cmd, flags, positionals };
}

async function main() {
  const { cmd, flags, positionals } = parseArgs(process.argv.slice(2));
  switch (cmd) {
    case "init":
      await cmdInit(flags);
      break;
    case "ingest":
      await cmdIngest(positionals[0]);
      break;
    case "summary":
      await cmdSummary();
      break;
    case "funding":
      await cmdFunding();
      break;
    case "lapse":
      await cmdLapse();
      break;
    case "cashvalue":
      await cmdCashvalue(flags.age);
      break;
    case "scenario":
      await cmdScenario(flags.premium);
      break;
    case "ask":
      await cmdAsk(positionals);
      break;
    case undefined:
    case "help":
    case "--help":
    case "-h":
      brand();
      console.log(`
Pear live demo commands:

  policywell init --name "Pear X 27 Live Demo"
  policywell ingest "/path/to/Malik Illustrations.pdf"
  policywell summary
  policywell funding
  policywell lapse
  policywell cashvalue --age 52
  policywell scenario --premium 180
  policywell ask "is this funded above no-lapse?"
  policywell ask "cash value at age 52"
  policywell ask "what if premium 180"
  policywell ask "any better options?"
  policywell ask "best option vs Foresters"

API: ${DEFAULT_API}
`);
      break;
    default:
      fail(`Unknown command: ${cmd}`);
  }
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
