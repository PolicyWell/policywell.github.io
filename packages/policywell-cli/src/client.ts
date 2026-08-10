import { loadConfig, resolveApiBase } from "./config";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiClientOptions = {
  apiBase?: string;
};

export async function apiRequest<T>(
  method: string,
  path: string,
  options: {
    apiBase?: string;
    query?: Record<string, string | number | undefined>;
    body?: unknown;
    formData?: FormData;
  } = {},
): Promise<T> {
  const base = resolveApiBase(options.apiBase);
  const url = new URL(
    path.startsWith("/") ? path.slice(1) : path,
    `${base}/`,
  );
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const cfg = loadConfig();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (cfg?.workspaceId) {
    headers["X-PolicyWell-Workspace"] = cfg.workspaceId;
  }
  const ownerUserId =
    process.env.POLICYWELL_OWNER_USER_ID?.trim() ||
    process.env.INGEST_OWNER_USER_ID?.trim();
  if (ownerUserId) {
    headers["X-PolicyWell-Owner-User-Id"] = ownerUserId;
  }

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body });
  } catch (err) {
    throw new ApiError(
      `Cannot reach PolicyWell API at ${base} (${err instanceof Error ? err.message : "network error"}). Is the app running on localhost:3000?`,
      0,
    );
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = { raw: text };
    }
  }

  if (!res.ok) {
    const message =
      typeof json === "object" &&
      json &&
      "error" in json &&
      typeof (json as { error: unknown }).error === "string"
        ? (json as { error: string }).error
        : `API ${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, json);
  }

  return json as T;
}

export function printJson(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}
