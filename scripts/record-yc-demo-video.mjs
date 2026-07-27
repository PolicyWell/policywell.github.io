#!/usr/bin/env node
/**
 * Records the PolicyWell /product demo autoplay to MP4 (+ short GIF).
 * Target: exactly ~3:00, well under 100MB for YC uploads.
 *
 * Usage:
 *   node scripts/record-yc-demo-video.mjs [url]
 * Default URL: https://policywell.ai/product/
 */
import { spawn, execFileSync } from "node:child_process";
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
const mp4Name = "PolicyWell-YC-Demo-3min.mp4";
const gifName = "PolicyWell-YC-Demo-preview.gif";
const mp4Path = join(outDir, mp4Name);
const gifPath = join(outDir, gifName);

const DEMO_URL = process.argv[2] || "https://policywell.ai/product/";
const DURATION_SEC = 180;
const FPS = 2; // 2 fps → 360 frames for 3:00 (smooth enough, small file)
const VIEWPORT = { width: 1280, height: 800 };
const CHROME =
  process.env.CHROME_PATH ||
  "/usr/local/bin/google-chrome" ||
  "/usr/bin/google-chrome";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function ensureClean() {
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });
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

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.goto(DEMO_URL, { waitUntil: "networkidle2", timeout: 120_000 });

    // Dismiss cookie banners / wait for demo shell
    await page
      .waitForSelector(".pw-pt-app, .pw-product-tour", { timeout: 60_000 })
      .catch(() => null);

    // Ensure playing from start
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const restart = btns.find((b) => /restart/i.test(b.textContent || ""));
      const play = btns.find((b) => /^(play)$/i.test((b.textContent || "").trim()));
      restart?.click();
      // If paused showing Play, click it
      setTimeout(() => {
        const p = Array.from(document.querySelectorAll("button")).find((b) =>
          /^(play)$/i.test((b.textContent || "").trim()),
        );
        p?.click();
      }, 200);
    });

    await sleep(800);

    const totalFrames = DURATION_SEC * FPS;
    const intervalMs = 1000 / FPS;
    console.log(`Capturing ${totalFrames} frames at ${FPS} fps…`);

    for (let i = 0; i < totalFrames; i++) {
      const file = join(framesDir, `frame-${String(i).padStart(4, "0")}.jpg`);
      await page.screenshot({
        path: file,
        type: "jpeg",
        quality: 72,
      });
      if (i % 20 === 0) {
        console.log(`  frame ${i + 1}/${totalFrames}`);
      }
      if (i < totalFrames - 1) await sleep(intervalMs);
    }
  } finally {
    await browser.close();
  }
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
      "main",
      "-crf",
      "28",
      "-movflags",
      "+faststart",
      "-an",
      tmpMp4,
    ],
    { stdio: "inherit" },
  );
  copyFileSync(tmpMp4, mp4Path);
}

function encodeGifPreview() {
  // ~12s preview GIF from the first portion of frames (small file)
  const previewFrames = Math.min(24, DURATION_SEC * FPS); // 12s at 2fps
  const palette = join(workDir, "palette.png");
  const previewDir = join(workDir, "preview");
  mkdirSync(previewDir, { recursive: true });

  // copy first N frames
  for (let i = 0; i < previewFrames; i++) {
    const src = join(framesDir, `frame-${String(i).padStart(4, "0")}.jpg`);
    const dst = join(previewDir, `frame-${String(i).padStart(4, "0")}.jpg`);
    if (existsSync(src)) copyFileSync(src, dst);
  }

  console.log("Encoding GIF preview…");
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      "2",
      "-i",
      join(previewDir, "frame-%04d.jpg"),
      "-vf",
      "fps=2,scale=640:-1:flags=lanczos,palettegen=stats_mode=diff",
      palette,
    ],
    { stdio: "inherit" },
  );
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      "2",
      "-i",
      join(previewDir, "frame-%04d.jpg"),
      "-i",
      palette,
      "-lavfi",
      "fps=2,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5",
      "-loop",
      "0",
      gifPath,
    ],
    { stdio: "inherit" },
  );
}

function writeManifest() {
  const mp4Bytes = statSync(mp4Path).size;
  const gifBytes = existsSync(gifPath) ? statSync(gifPath).size : 0;
  const mp4Mb = mp4Bytes / (1024 * 1024);
  const gifMb = gifBytes / (1024 * 1024);
  const note = `PolicyWell YC demo media
========================
MP4: ${mp4Name} (${mp4Mb.toFixed(2)} MB)
GIF: ${gifName} (${gifMb.toFixed(2)} MB)
Duration: ${DURATION_SEC}s @ ${FPS} fps
Source: ${DEMO_URL}
Generated: ${new Date().toISOString()}

Both files are intentionally kept under 100MB for YC application uploads.
Prefer the MP4 for the full 3:00 walkthrough; use the GIF as a short preview.
`;
  writeFileSync(join(outDir, "MEDIA-NOTE.txt"), note);
  console.log(note);
  if (mp4Mb >= 100) {
    console.error("ERROR: MP4 exceeds 100MB");
    process.exit(1);
  }
}

async function main() {
  ensureClean();
  await captureFrames();
  encodeMp4();
  encodeGifPreview();
  writeManifest();
  console.log(`Wrote ${mp4Path}`);
  console.log(`Wrote ${gifPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
