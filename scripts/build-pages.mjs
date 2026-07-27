#!/usr/bin/env node
/**
 * Static export for GitHub Pages.
 * Temporarily parks /api (route handlers aren't supported with output: "export").
 * Client-side agent still works; optional reasoning-engine enhance API is omitted on Pages.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "src", "app", "api");
const parkDir = path.join(root, ".pages-api-park");
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

function parkApi() {
  if (!fs.existsSync(apiDir)) return false;
  fs.rmSync(parkDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(parkDir), { recursive: true });
  fs.renameSync(apiDir, parkDir);
  return true;
}

function restoreApi(parked) {
  if (!parked) return;
  if (fs.existsSync(apiDir)) {
    fs.rmSync(apiDir, { recursive: true, force: true });
  }
  fs.renameSync(parkDir, apiDir);
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

const parkedApi = parkApi();
const parkedMiddleware = parkMiddleware();
try {
  run("npx", ["next", "build"], { STATIC_EXPORT: "1" });
} finally {
  restoreMiddleware(parkedMiddleware);
  restoreApi(parkedApi);
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
