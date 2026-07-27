#!/usr/bin/env node
/**
 * Records a swift, fluid PolicyWell /product walkthrough to MP4 (+ GIF).
 * Clicks through every module quickly (~6s each) at higher FPS.
 * Target duration: ~55s · well under 100MB.
 *
 * Usage:
 *   node scripts/record-yc-demo-video.mjs [url]
 */
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  rmSync,
  existsSync,
  writeFileSync,
  statSync,
  copyFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "downloads");
const workDir = join(root, ".tmp", "yc-demo-record");
const framesDir = join(workDir, "frames");
const mp4Name = "PolicyWell-YC-Demo-3min.mp4"; // keep stable public URL
const gifName = "PolicyWell-YC-Demo-preview.gif";
const mp4Path = join(outDir, mp4Name);
const gifPath = join(outDir, gifName);

const DEMO_URL = process.argv[2] || "https://policywell.ai/product/";
/** Seconds to dwell on each rail module (swift pass). */
const DWELL_SEC = 5.5;
const FPS = 10;
const VIEWPORT = { width: 1280, height: 800 };
const CHROME = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

const MODULES = [
  "Dashboard",
  "Risk",
  "Market",
  "Claims",
  "CLI Agent",
  "CRM",
  "Analyzer",
  "iOS App",
  "Voice Assistant",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function ensureClean() {
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });
}

async function clickRail(page, label) {
  await page.evaluate((name) => {
    const items = Array.from(
      document.querySelectorAll(".pw-pt-rail-item, .pw-pt-rail-nav button"),
    );
    const btn = items.find(
      (el) => (el.textContent || "").trim() === name,
    );
    if (btn) {
      btn.click();
      return true;
    }
    // Fallback: any button whose text includes the label
    const all = Array.from(document.querySelectorAll("button"));
    const soft = all.find((el) =>
      (el.textContent || "").trim().includes(name),
    );
    soft?.click();
  }, label);
}

async function pauseAutoplay(page) {
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const pause = btns.find((b) =>
      /^(pause)$/i.test((b.textContent || "").trim()),
    );
    pause?.click();
  });
}

async function captureFrames() {
  console.log(`Launching Chrome → ${DEMO_URL}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    ],
    defaultViewport: VIEWPORT,
  });

  let frame = 0;
  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.goto(DEMO_URL, { waitUntil: "networkidle2", timeout: 120_000 });
    await page
      .waitForSelector(".pw-pt-app, .pw-product-tour", { timeout: 60_000 })
      .catch(() => null);

    // Restart then pause — we drive the rail ourselves for a swift cut
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      btns.find((b) => /restart/i.test(b.textContent || ""))?.click();
    });
    await sleep(600);
    await pauseAutoplay(page);
    await sleep(300);

    const intervalMs = 1000 / FPS;
    const framesPerModule = Math.round(DWELL_SEC * FPS);

    for (let m = 0; m < MODULES.length; m++) {
      const label = MODULES[m];
      console.log(`Module ${m + 1}/${MODULES.length}: ${label}`);
      await clickRail(page, label);
      await sleep(350);

      // Light in-module nudges so surfaces feel interactive
      if (label === "Market") {
        await page.evaluate(() => {
          document.querySelector(".pw-pt-type-chip")?.click();
          document.querySelector(".pw-pt-carrier-chip")?.click();
        });
      } else if (label === "CRM") {
        await page.evaluate(() => {
          document.querySelector(".pw-pt-crm-greeting")?.click();
        });
      } else if (label === "iOS App") {
        await page.evaluate(() => {
          const cards = Array.from(
            document.querySelectorAll(".pw-pt-ios-ingest-card"),
          );
          cards[0]?.click();
        });
        await sleep(200);
        await page.evaluate(() => {
          const prompts = Array.from(
            document.querySelectorAll(".pw-pt-ios-prompts button"),
          );
          prompts[1]?.click() || prompts[0]?.click();
        });
      } else if (label === "Voice Assistant") {
        await page.evaluate(() => {
          document
            .querySelector(".pw-pt-ios-continue, .pw-pt-action")
            ?.click();
        });
        await sleep(250);
        await page.evaluate(() => {
          document.querySelector(".pw-pt-ios-option")?.click();
        });
      } else if (label === "Risk") {
        await page.evaluate(() => {
          document.querySelector(".pw-pt-clickable")?.click();
        });
      } else if (label === "Claims") {
        await page.evaluate(() => {
          document.querySelector(".pw-pt-square-btn")?.click();
        });
      } else if (label === "Analyzer") {
        await page.evaluate(() => {
          document.querySelector(".pw-pt-analyzer .pw-pt-clickable")?.click();
        });
      }

      for (let i = 0; i < framesPerModule; i++) {
        const file = join(
          framesDir,
          `frame-${String(frame).padStart(4, "0")}.jpg`,
        );
        await page.screenshot({ path: file, type: "jpeg", quality: 78 });
        frame += 1;
        if (i < framesPerModule - 1) await sleep(intervalMs);
      }
    }

    console.log(`Captured ${frame} frames`);
  } finally {
    await browser.close();
  }
  return frame;
}

function encodeMp4() {
  const tmpMp4 = join(workDir, mp4Name);
  console.log("Encoding MP4…");
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      join(framesDir, "frame-%04d.jpg"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-profile:v",
      "high",
      "-crf",
      "23",
      "-movflags",
      "+faststart",
      "-an",
      tmpMp4,
    ],
    { stdio: "inherit" },
  );
  copyFileSync(tmpMp4, mp4Path);
}

function encodeGifFromMp4() {
  // Full-length swift GIF (same cut as the MP4), kept small for YC.
  console.log("Encoding full-length GIF from MP4…");
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      mp4Path,
      "-vf",
      "fps=6,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5",
      "-loop",
      "0",
      gifPath,
    ],
    { stdio: "inherit" },
  );
}

function writeManifest(totalFrames) {
  const duration = totalFrames / FPS;
  const mp4Bytes = statSync(mp4Path).size;
  const gifBytes = existsSync(gifPath) ? statSync(gifPath).size : 0;
  const mp4Mb = mp4Bytes / (1024 * 1024);
  const gifMb = gifBytes / (1024 * 1024);
  const note = `PolicyWell YC demo media (swift)
================================
MP4: ${mp4Name} (${mp4Mb.toFixed(2)} MB, ~${duration.toFixed(0)}s)
GIF: ${gifName} (${gifMb.toFixed(2)} MB, full ~${duration.toFixed(0)}s walkthrough)
Pace: ${MODULES.length} modules × ${DWELL_SEC}s @ ${FPS} fps
Source: ${DEMO_URL}
Generated: ${new Date().toISOString()}

Swift cut through every feature — Dashboard → Risk → Market → Claims →
CLI → CRM → Analyzer → iOS → Voice. Under 100MB for YC uploads.
Both MP4 and GIF cover the full feature pass.
`;
  writeFileSync(join(outDir, "MEDIA-NOTE.txt"), note);
  console.log(note);
  if (mp4Mb >= 100 || gifMb >= 100) {
    console.error("ERROR: media exceeds 100MB");
    process.exit(1);
  }
}

async function main() {
  ensureClean();
  try {
    await import("puppeteer-core");
  } catch {
    execFileSync("npm", ["install", "--no-save", "puppeteer-core@24"], {
      cwd: root,
      stdio: "inherit",
    });
  }
  const totalFrames = await captureFrames();
  encodeMp4();
  encodeGifFromMp4();
  writeManifest(totalFrames);
  console.log(`Wrote ${mp4Path}`);
  console.log(`Wrote ${gifPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
