import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_API_BASE = "http://localhost:3000/api/v1";

export type PolicyWellCliConfig = {
  apiBase: string;
  workspaceId: string;
  createdAt: string;
};

function configDir(): string {
  return join(homedir(), ".config", "policywell");
}

export function configPath(): string {
  return join(configDir(), "config.json");
}

export function loadConfig(): PolicyWellCliConfig | null {
  const path = configPath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PolicyWellCliConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: PolicyWellCliConfig): void {
  const dir = configDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(configPath(), `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function resolveApiBase(cliFlag?: string): string {
  if (cliFlag?.trim()) return cliFlag.trim().replace(/\/$/, "");
  const fromEnv = process.env.POLICYWELL_API_BASE?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const cfg = loadConfig();
  if (cfg?.apiBase) return cfg.apiBase.replace(/\/$/, "");
  return DEFAULT_API_BASE;
}
