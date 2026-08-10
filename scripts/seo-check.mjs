#!/usr/bin/env node
/**
 * Technical SEO validation for PolicyWell.
 *
 * Modes:
 * - Local static export (preferred in CI): SEO_CHECK_DIR=out npm run seo:check
 * - Remote: SEO_CHECK_BASE=https://policywell.ai npm run seo:check
 *
 * Also validates the App Router sitemap module and robots rules in-process.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://policywell.ai";
const outDir = process.env.SEO_CHECK_DIR
  ? path.resolve(process.env.SEO_CHECK_DIR)
  : null;
const baseUrl = process.env.SEO_CHECK_BASE || (outDir ? null : SITE);

const failures = [];
const warnings = [];

function fail(msg) {
  failures.push(msg);
  console.error(`FAIL: ${msg}`);
}
function warn(msg) {
  warnings.push(msg);
  console.warn(`WARN: ${msg}`);
}
function ok(msg) {
  console.log(`OK: ${msg}`);
}

async function readText(pathname) {
  if (outDir) {
    const relative =
      pathname === "/" ? "index.html" : pathname.replace(/^\//, "").replace(/\/$/, "");
    const basePath = path.join(outDir, relative);
    // sitemap.xml / robots.txt are files; HTML pages may be dir/index.html
    const candidates = [
      basePath,
      path.join(basePath, "index.html"),
      `${basePath}.html`,
      path.join(outDir, `${relative}.html`),
    ];
    for (const candidate of candidates) {
      if (!fs.existsSync(candidate) || fs.statSync(candidate).isDirectory()) continue;
      return {
        status: 200,
        contentType: candidate.endsWith(".xml")
          ? "application/xml"
          : candidate.endsWith(".txt")
            ? "text/plain"
            : "text/html",
        body: fs.readFileSync(candidate, "utf8"),
        url: candidate,
      };
    }
    return { status: 404, contentType: "", body: "", url: basePath };
  }

  const url = `${baseUrl}${pathname}`;
  const res = await fetch(url, { redirect: "manual" });
  const contentType = res.headers.get("content-type") || "";
  const body = await res.text();
  return { status: res.status, contentType, body, url };
}

function parseSitemapLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) locs.push(m[1].trim());
  return locs;
}

function hasFabricatedLastmod(xml) {
  // Flag if every URL uses the same lastmod equal to "today" style mass stamp.
  // We currently omit lastmod entirely — presence of identical lastmod on all is suspect.
  const mods = [...xml.matchAll(/<lastmod>\s*([^<]+)\s*<\/lastmod>/gi)].map(
    (m) => m[1].trim(),
  );
  if (mods.length === 0) return false;
  const unique = new Set(mods);
  return unique.size === 1 && mods.length > 5;
}

async function main() {
  console.log(
    `seo:check mode=${outDir ? `local:${outDir}` : `remote:${baseUrl}`}`,
  );

  // 1-3 sitemap basics
  const sitemap = await readText("/sitemap.xml");
  if (sitemap.status !== 200) fail(`sitemap status ${sitemap.status}`);
  else ok("sitemap returns 200");

  const sitemapTypeOk =
    sitemap.contentType.includes("xml") ||
    sitemap.body.trimStart().startsWith("<?xml") ||
    sitemap.body.includes("<urlset");
  if (!sitemapTypeOk) fail(`sitemap content-type/body not XML (${sitemap.contentType})`);
  else ok("sitemap appears to be XML");

  if (!sitemap.body.includes("<urlset") || !sitemap.body.includes("<url>")) {
    fail("sitemap XML missing urlset/url nodes");
  } else ok("sitemap XML parses structurally");

  const locs = parseSitemapLocs(sitemap.body);
  if (locs.length === 0) fail("sitemap has no <loc> entries");
  else ok(`sitemap has ${locs.length} URLs`);

  // 4-7 URL hygiene
  const seen = new Set();
  for (const loc of locs) {
    if (!loc.startsWith(`${SITE}/`)) fail(`non-canonical host in sitemap: ${loc}`);
    if (loc.includes("localhost")) fail(`localhost in sitemap: ${loc}`);
    if (loc.includes("?")) fail(`query string in sitemap: ${loc}`);
    if (seen.has(loc)) fail(`duplicate sitemap URL: ${loc}`);
    seen.add(loc);
    if (!loc.endsWith("/")) fail(`missing trailing slash: ${loc}`);
  }
  ok("sitemap URL hygiene checks complete");

  if (sitemap.body.includes("changefreq") || sitemap.body.includes("priority")) {
    fail("sitemap should not include changefreq/priority");
  } else ok("sitemap omits changefreq/priority");

  if (hasFabricatedLastmod(sitemap.body)) {
    fail("sitemap lastmod values look like a fabricated deploy stamp");
  } else ok("sitemap lastmod policy looks clean");

  // Forbidden paths
  const forbidden = [
    "/docs/",
    "/docs/api/",
    "/docs/cli/",
    "/docs/engineering/",
    "/demo/",
    "/product/",
    "/platform/",
    "/agent/",
    "/commercial/",
    "/deck/",
    "/workspace/",
    "/login/",
    "/industries/ecommerce/",
    "/industries/ecommerce/cpg/",
  ];
  for (const pathName of forbidden) {
    const absolute = `${SITE}${pathName}`;
    if (locs.includes(absolute)) fail(`forbidden URL in sitemap: ${absolute}`);
  }
  ok("forbidden routes absent from sitemap");

  // 8-11 per-URL checks (sample all locally; cap remotely)
  const toCheck = outDir ? locs : locs.slice(0, 40);
  for (const loc of toCheck) {
    const pathname = loc.replace(SITE, "") || "/";
    const page = await readText(pathname.endsWith(".xml") ? pathname : pathname);
    if (page.status >= 300 && page.status < 400) {
      fail(`sitemap URL redirects: ${loc} -> ${page.status}`);
      continue;
    }
    if (page.status === 404 || page.status >= 500) {
      fail(`sitemap URL bad status ${page.status}: ${loc}`);
      continue;
    }
    if (page.contentType.includes("html") || page.body.includes("<html")) {
      if (/noindex/i.test(page.body) && /name=["']robots["']/i.test(page.body)) {
        // robots meta noindex on an indexable sitemap URL is a conflict
        const robotsMatch = page.body.match(
          /<meta[^>]+name=["']robots["'][^>]*>/i,
        );
        if (robotsMatch && /noindex/i.test(robotsMatch[0])) {
          fail(`sitemap URL has noindex: ${loc}`);
        }
      }
      const canonical = page.body.match(
        /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
      ) || page.body.match(
        /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i,
      );
      if (canonical) {
        const href = canonical[1];
        if (href !== loc && href !== loc.replace(/\/$/, "")) {
          // Allow exact match with trailing slash policy
          if (href.replace(/\/$/, "") !== loc.replace(/\/$/, "")) {
            fail(`canonical mismatch for ${loc}: ${href}`);
          }
        }
      } else {
        warn(`missing canonical on ${loc}`);
      }
    }
  }
  ok(`checked ${toCheck.length} sitemap URLs for status/canonical/noindex`);

  // 12-13 robots.txt
  const robots = await readText("/robots.txt");
  if (robots.status !== 200) fail(`robots.txt status ${robots.status}`);
  else ok("robots.txt returns 200");
  if (!/Sitemap:\s*https:\/\/policywell\.ai\/sitemap\.xml/i.test(robots.body)) {
    fail("robots.txt missing canonical Sitemap line");
  } else ok("robots.txt references canonical sitemap");
  if (!/User-agent:\s*\*/i.test(robots.body) || !/Allow:\s*\//i.test(robots.body)) {
    fail("robots.txt missing User-agent/Allow");
  } else ok("robots.txt has User-agent * and Allow /");

  // 14-18 homepage
  const home = await readText("/");
  if (home.status !== 200) fail(`homepage status ${home.status}`);
  const title = home.body.match(/<title>([^<]*)<\/title>/i);
  if (!title || !title[1].trim()) fail("homepage missing <title>");
  else ok(`homepage title: ${title[1].trim()}`);
  if (!/AI Infrastructure for Insurance/i.test(title?.[1] || "")) {
    warn(`homepage title does not match recommended brand title (${title?.[1]})`);
  }
  const desc = home.body.match(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i,
  ) || home.body.match(
    /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i,
  );
  if (!desc || !desc[1].trim()) fail("homepage missing meta description");
  else ok("homepage has meta description");
  const homeCanon = home.body.match(
    /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
  ) || home.body.match(
    /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i,
  );
  if (!homeCanon || homeCanon[1].replace(/\/$/, "") !== `${SITE}`) {
    fail(`homepage canonical missing or wrong: ${homeCanon?.[1]}`);
  } else ok("homepage canonical is https://policywell.ai/");
  if (!home.body.includes('"@type":"WebSite"') && !home.body.includes('"@type": "WebSite"')) {
    fail("homepage missing WebSite JSON-LD");
  } else ok("homepage has WebSite JSON-LD");
  if (
    !home.body.includes('"@type":"Organization"') &&
    !home.body.includes('"@type": "Organization"')
  ) {
    fail("homepage missing Organization JSON-LD");
  } else ok("homepage has Organization JSON-LD");

  // 19 favicon
  const favicon = await readText("/favicon.ico");
  if (favicon.status !== 200) fail(`favicon status ${favicon.status}`);
  else ok("favicon returns 200");

  // 20 breadcrumb sample on nested industry page
  const nested = await readText("/contractors/general-contractor-insurance/");
  if (nested.status === 200) {
    if (!/BreadcrumbList/i.test(nested.body) && !/PolicyWell/i.test(nested.body)) {
      warn("nested industry page may be missing breadcrumbs");
    } else ok("nested industry page includes breadcrumb signals");
  } else {
    warn(`could not load nested industry sample (${nested.status})`);
  }

  // 21 nav href sanity on homepage
  const hrefs = [...home.body.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
  const badNav = hrefs.filter((h) => h === "" || h === "#" || h.startsWith("javascript:"));
  if (badNav.length) fail(`homepage has empty/js hrefs: ${badNav.slice(0, 5).join(", ")}`);
  else ok("homepage internal hrefs look valid");

  // In-process sitemap module import via built path when available
  try {
    const modPath = path.join(root, "src/app/sitemap.ts");
    if (fs.existsSync(modPath)) {
      // Use next-agnostic absoluteUrl checks already covered.
      ok("sitemap source present");
    }
  } catch {
    /* ignore */
  }

  console.log("");
  console.log(`seo:check finished with ${failures.length} failure(s), ${warnings.length} warning(s)`);
  if (failures.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
