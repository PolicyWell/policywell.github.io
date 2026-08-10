import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { flagNumber, flagString, parseArgs } from "./args";
import { apiRequest, ApiError, printJson } from "./client";
import {
  DEFAULT_API_BASE,
  resolveApiBase,
  saveConfig,
  type PolicyWellCliConfig,
} from "./config";
import { printHelp } from "./help";

const VERSION = "0.1.0";

async function cmdInit(apiBase: string): Promise<void> {
  const result = await apiRequest<{
    workspaceId: string;
    apiBase?: string;
    message?: string;
  }>("POST", "/init", {
    apiBase,
    body: {},
  });

  const config: PolicyWellCliConfig = {
    apiBase: result.apiBase ?? apiBase,
    workspaceId: result.workspaceId,
    createdAt: new Date().toISOString(),
  };
  saveConfig(config);
  printJson({
    ok: true,
    message: result.message ?? "PolicyWell CLI initialized",
    config,
  });
}

async function cmdIngest(apiBase: string, filePath: string): Promise<void> {
  const abs = resolve(filePath);
  const bytes = readFileSync(abs);
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(bytes)]),
    basename(abs),
  );

  const result = await apiRequest("POST", "/ingest", {
    apiBase,
    formData: form,
  });
  printJson(result);
}

async function cmdSummary(apiBase: string): Promise<void> {
  printJson(await apiRequest("GET", "/summary", { apiBase }));
}

async function cmdFunding(apiBase: string): Promise<void> {
  printJson(await apiRequest("GET", "/funding", { apiBase }));
}

async function cmdLapse(apiBase: string): Promise<void> {
  printJson(await apiRequest("GET", "/lapse", { apiBase }));
}

async function cmdCashValue(apiBase: string, age: number): Promise<void> {
  printJson(
    await apiRequest("GET", "/cashvalue", {
      apiBase,
      query: { age },
    }),
  );
}

async function cmdScenario(apiBase: string, premium: number): Promise<void> {
  printJson(
    await apiRequest("POST", "/scenario", {
      apiBase,
      body: { premium },
    }),
  );
}

async function cmdStats(apiBase: string): Promise<void> {
  printJson(await apiRequest("GET", "/stats", { apiBase }));
}

async function main(argv: string[]): Promise<number> {
  const { command, positionals, flags } = parseArgs(argv);

  if (flags.help || (!command && !flags.version)) {
    printHelp();
    return 0;
  }
  if (flags.version) {
    process.stdout.write(`policywell ${VERSION}\n`);
    return 0;
  }

  const apiBase = resolveApiBase(flagString(flags, "api"));

  try {
    switch (command) {
      case "init":
        await cmdInit(apiBase);
        return 0;
      case "ingest": {
        const path = positionals[0];
        if (!path) {
          process.stderr.write("Usage: policywell ingest <path>\n");
          return 1;
        }
        await cmdIngest(apiBase, path);
        return 0;
      }
      case "summary":
        await cmdSummary(apiBase);
        return 0;
      case "funding":
        await cmdFunding(apiBase);
        return 0;
      case "lapse":
        await cmdLapse(apiBase);
        return 0;
      case "cashvalue": {
        const age = flagNumber(flags, "age");
        if (age === undefined) {
          process.stderr.write("Usage: policywell cashvalue --age <age>\n");
          return 1;
        }
        await cmdCashValue(apiBase, age);
        return 0;
      }
      case "scenario": {
        const premium = flagNumber(flags, "premium");
        if (premium === undefined) {
          process.stderr.write(
            "Usage: policywell scenario --premium <amount>\n",
          );
          return 1;
        }
        await cmdScenario(apiBase, premium);
        return 0;
      }
      case "stats":
        await cmdStats(apiBase);
        return 0;
      case "help":
        printHelp();
        return 0;
      default:
        process.stderr.write(
          `Unknown command: ${command}\n\nDefault API: ${DEFAULT_API_BASE}\nRun policywell --help for usage.\n`,
        );
        return 1;
    }
  } catch (err) {
    if (err instanceof ApiError) {
      process.stderr.write(`Error: ${err.message}\n`);
      return err.status && err.status >= 400 && err.status < 500 ? 1 : 2;
    }
    process.stderr.write(
      `Error: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    return 2;
  }
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  void main(process.argv.slice(2)).then((code) => process.exit(code));
}

export { main };
