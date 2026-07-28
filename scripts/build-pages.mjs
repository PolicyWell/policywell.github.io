#!/usr/bin/env node
/**
 * Static export for GitHub Pages.
 * Temporarily parks API route handlers (unsupported with output: "export").
 * Keeps marketing pages under src/app/api/ (e.g. /api/page.tsx).
 * Client-side agent still works; optional LLM enhance API is omitted on Pages.
 */
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

const parkedApi = parkApiRoutes();
const parkedMiddleware = parkMiddleware();
try {
  run("npx", ["next", "build"], { STATIC_EXPORT: "1" });
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
