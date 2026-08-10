#!/usr/bin/env node
/**
 * Static export for GitHub Pages.
 * Temporarily parks API route handlers (unsupported with output: "export").
 * Keeps marketing pages under src/app/api/ (e.g. /api/page.tsx).
 * Client-side agent still works; optional LLM enhance API is omitted on Pages.
 *
 * Private docs/product: requires DOCS_ACCESS_CODE and/or UNIVERSAL_ACCESS_CODE
 * (or their NEXT_PUBLIC_ plaintext fallbacks). Injects SHA-256 hashes so
 * plaintext codes are not shipped in the client bundle.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
/** Route-handler folders only — marketing `/api` page stays in the tree. */
const apiRouteDirs = [path.join(root, "src", "app", "api", "agent")];
const parkRoot = path.join(root, ".pages-api-park");
const middlewareFile = path.join(root, "middleware.ts");
const middlewarePark = path.join(root, ".pages-middleware-park.ts");

function run(cmd, args, env = {}) {
  const res = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function parkApiRoutes() {
  const parked = [];
  fs.rmSync(parkRoot, { recursive: true, force: true });
  fs.mkdirSync(parkRoot, { recursive: true });
  for (const dir of apiRouteDirs) {
    if (!fs.existsSync(dir)) continue;
    const name = path.basename(dir);
    const dest = path.join(parkRoot, name);
    fs.renameSync(dir, dest);
    parked.push(name);
  }
  return parked;
}

function restoreApiRoutes(parked) {
  for (const name of parked) {
    const dest = path.join(root, "src", "app", "api", name);
    const src = path.join(parkRoot, name);
    if (!fs.existsSync(src)) continue;
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
  }
  fs.rmSync(parkRoot, { recursive: true, force: true });
}

/** Middleware is unsupported with `output: "export"` (GitHub Pages). */
function parkMiddleware() {
  if (!fs.existsSync(middlewareFile)) return false;
  fs.rmSync(middlewarePark, { force: true });
  fs.renameSync(middlewareFile, middlewarePark);
  return true;
}

function restoreMiddleware(parked) {
  if (!parked) return;
  if (fs.existsSync(middlewareFile)) {
    fs.rmSync(middlewareFile, { force: true });
  }
  fs.renameSync(middlewarePark, middlewareFile);
}

const docsAccessCode = (
  process.env.DOCS_ACCESS_CODE ||
  process.env.NEXT_PUBLIC_DOCS_ACCESS_CODE ||
  ""
).trim();

const universalAccessCode = (
  process.env.UNIVERSAL_ACCESS_CODE ||
  process.env.NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE ||
  ""
).trim();

if (!docsAccessCode && !universalAccessCode) {
  console.error(
    "Pages build blocked: set UNIVERSAL_ACCESS_CODE and/or DOCS_ACCESS_CODE\n" +
      "(or their NEXT_PUBLIC_ plaintext fallbacks).\n" +
      "Private docs/product surfaces refuse to export without an access code.",
  );
  process.exit(1);
}

const docsAccessCodeHash = docsAccessCode
  ? createHash("sha256").update(docsAccessCode).digest("hex")
  : "";

const universalAccessCodeHash = universalAccessCode
  ? createHash("sha256").update(universalAccessCode).digest("hex")
  : "";

const parkedApi = parkApiRoutes();
const parkedMiddleware = parkMiddleware();
try {
  run("npx", ["next", "build"], {
    STATIC_EXPORT: "1",
    // Ship hashes only — do not embed plaintext access codes in the client bundle.
    ...(docsAccessCodeHash
      ? { NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH: docsAccessCodeHash }
      : {}),
    NEXT_PUBLIC_DOCS_ACCESS_CODE: "",
    DOCS_ACCESS_CODE: docsAccessCode,
    ...(universalAccessCodeHash
      ? { NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE_HASH: universalAccessCodeHash }
      : {}),
    NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE: "",
    UNIVERSAL_ACCESS_CODE: universalAccessCode,
  });
} finally {
  restoreMiddleware(parkedMiddleware);
  restoreApiRoutes(parkedApi);
}

if (!fs.existsSync(path.join(root, "out", "index.html"))) {
  console.error("Pages build failed: out/index.html missing");
  process.exit(1);
}

// GitHub Pages serves this for every unknown path (no matching landing page).
const notFoundHtml = path.join(root, "out", "404.html");
if (!fs.existsSync(notFoundHtml)) {
  console.error("Pages build failed: out/404.html missing");
  process.exit(1);
}

console.log("GitHub Pages static export ready in ./out (includes 404.html)");
