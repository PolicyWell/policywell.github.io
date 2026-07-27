#!/usr/bin/env node
/**
 * Builds public/downloads/PolicyWell-YC-Demo-3min.zip
 * Includes MP4 + GIF preview + offline HTML when available (<100MB).
 */
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
  statSync,
  copyFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "downloads");
const stageDir = join(root, ".tmp", "yc-demo-package");
const zipPath = join(outDir, "PolicyWell-YC-Demo-3min.zip");

const BEATS = [
  ["0:00–0:12", "Dashboard", "Open command center · scan modules · jump to Risk"],
  ["0:12–0:32", "Risk", "Score tile · gaps · exposure bars · activity"],
  ["0:32–0:54", "Market", "Toggle Life/P&C/Specialty · carriers · rows · summary"],
  ["0:54–1:10", "Claims", "Claim hero · timeline squares · documents"],
  ["1:10–1:32", "CLI Agent", "Open CLI · switch audience · run command"],
  ["1:32–1:54", "CRM", "Customer rows · suitability filter · Hello greeting · mass follow-up"],
  ["1:54–2:08", "Analyzer", "Policyholder · carrier/IMO · commercial lenses"],
  ["2:08–2:36", "iOS App", "Upload/API ingest · lapse Q · overfund chart · voice"],
  ["2:36–3:00", "Voice", "Ask IUL options · select Max CV · growth illustration · broker"],
];

const readme = `PolicyWell — YC Product Demo (3:00)
=====================================

PRIMARY DOWNLOAD (recommended for YC upload)
--------------------------------------------
PolicyWell-YC-Demo-3min.mp4
  Full 3:00 screen recording of the interactive product demo.
  Well under 100MB.

PolicyWell-YC-Demo-preview.gif
  Short animated preview clip.

LIVE INTERACTIVE DEMO
---------------------
https://policywell.ai/product/

ALSO IN THIS ZIP
----------------
- README.txt / TIMING.txt / offline-demo.html / SIZE-NOTE.txt
- The MP4 and GIF when present in public/downloads/

CONTACT
-------
https://policywell.ai/book-a-call/
`;

const timing = `PolicyWell YC demo — exactly 3:00 beat sheet
=============================================

${BEATS.map(([t, m, s]) => `${t}  ${m}\n  → ${s}`).join("\n\n")}

Total interactive steps: 32 across 9 modules.
Format: lightweight interactive CSS demo (not a video).
`;

const sizeNote = `PolicyWell YC demo package size note
====================================

This ZIP contains only text/HTML assets (no MP4/WebM/audio).
It is designed to remain far below YC's 100MB upload ceiling.

Re-check after unzip:
  du -h PolicyWell-YC-Demo-3min.zip
`;

const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PolicyWell · YC 3-min product demo (offline)</title>
<style>
  :root {
    --pine: #0f2f28;
    --moss: #3d5c4f;
    --ok: #2f6f55;
    --foam: #f5faf7;
    --stone: #5a6b63;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    background: linear-gradient(160deg, #e8efe9, #f7f4ef 45%, #dde8e2);
    color: var(--pine);
    min-height: 100vh;
  }
  .wrap { max-width: 52rem; margin: 0 auto; padding: 1.5rem 1.1rem 3rem; }
  .kicker {
    font-family: system-ui, sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--moss);
    margin: 0 0 0.4rem;
  }
  h1 {
    margin: 0 0 0.5rem;
    font-weight: 500;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
  }
  .sub {
    font-family: system-ui, sans-serif;
    color: var(--stone);
    line-height: 1.5;
    margin: 0 0 1.1rem;
  }
  .panel {
    background: #0f1413;
    border-radius: 16px;
    padding: 1rem;
    color: var(--foam);
    box-shadow: 0 24px 60px rgba(8,14,12,.35);
  }
  .meta {
    display: flex; flex-wrap: wrap; gap: .5rem .85rem;
    font-family: system-ui, sans-serif;
    font-size: .78rem;
    color: rgba(245,250,247,.65);
    margin-bottom: .75rem;
  }
  .progress {
    height: 4px; background: rgba(245,250,247,.12); border-radius: 999px; overflow: hidden;
  }
  .progress > span {
    display: block; height: 100%; width: 0%;
    background: #2f6f55; transition: width .25s linear;
  }
  .stage {
    margin-top: .85rem;
    background: #f5f7f6;
    color: var(--pine);
    border-radius: 12px;
    padding: 1rem 1.05rem 1.15rem;
    min-height: 12rem;
  }
  .stage h2 {
    margin: 0 0 .35rem;
    font-size: 1.25rem;
    font-weight: 500;
  }
  .stage .mod {
    font-family: system-ui, sans-serif;
    font-size: .68rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--moss);
    margin: 0 0 .55rem;
  }
  .stage p {
    font-family: system-ui, sans-serif;
    margin: 0;
    line-height: 1.5;
    color: var(--stone);
  }
  .step {
    margin-top: .75rem;
    padding: .55rem .7rem;
    border-radius: 10px;
    background: rgba(47,111,85,.1);
    border: 1px solid rgba(47,111,85,.22);
    font-family: system-ui, sans-serif;
    font-weight: 600;
    font-size: .88rem;
  }
  .controls {
    display: flex; flex-wrap: wrap; gap: .4rem;
    margin-top: .85rem;
  }
  button {
    font-family: system-ui, sans-serif;
    appearance: none;
    border: 1px solid rgba(245,250,247,.22);
    background: rgba(245,250,247,.08);
    color: var(--foam);
    border-radius: 999px;
    padding: .45rem .9rem;
    cursor: pointer;
    font-weight: 600;
  }
  button:hover { background: rgba(245,250,247,.14); }
  button.primary { background: #2f6f55; border-color: #2f6f55; }
  .live {
    margin-top: 1.1rem;
    font-family: system-ui, sans-serif;
    font-size: .9rem;
  }
  .live a { color: var(--ok); font-weight: 700; }
  .beats {
    margin-top: 1.4rem;
    font-family: system-ui, sans-serif;
    font-size: .78rem;
    color: var(--stone);
  }
  .beats li { margin: .35rem 0; }
</style>
</head>
<body>
  <div class="wrap">
    <p class="kicker">YC application · offline package · under 100MB</p>
    <h1>PolicyWell · 3-minute product demo</h1>
    <p class="sub">
      Step-by-step walkthrough of every product surface. Press Play for an
      exact 3:00 autoplay, or step manually. For the full interactive product
      UI, open the live demo link below.
    </p>

    <div class="panel">
      <div class="meta">
        <span id="clock">0:00 / 3:00</span>
        <span id="modMeta">1/9 · Dashboard</span>
        <span>32 interactive steps</span>
      </div>
      <div class="progress" aria-hidden="true"><span id="bar"></span></div>
      <div class="stage">
        <p class="mod" id="modLabel">Module 1 · Dashboard</p>
        <h2 id="title">PolicyWell command center</h2>
        <p id="blurb">One workspace for risk, market, claims, CLI, CRM, iOS, and voice.</p>
        <div class="step" id="step">Open command center</div>
      </div>
      <div class="controls">
        <button type="button" class="primary" id="play">Play</button>
        <button type="button" id="prev">Prev</button>
        <button type="button" id="next">Next</button>
        <button type="button" id="restart">Restart</button>
      </div>
    </div>

    <p class="live">
      Full interactive demo:
      <a href="https://policywell.ai/product/" target="_blank" rel="noreferrer">policywell.ai/product</a>
    </p>

    <ol class="beats" id="beats"></ol>
  </div>
<script>
const MODULES = [
  { label: "Dashboard", title: "PolicyWell command center",
    blurb: "One workspace for risk, market, claims, CLI, CRM, and in-force analysis.",
    duration: 12, steps: [
      [0, "Open command center"],
      [0.35, "Scan available modules"],
      [0.7, "Jump into Risk"],
    ]},
  { label: "Risk", title: "Risk assessment",
    blurb: "Score gaps and exposure before renewal.",
    duration: 20, steps: [
      [0, "Inspect overall score tile"],
      [0.25, "Open coverage gaps"],
      [0.5, "Click exposure bars"],
      [0.75, "Review recent activity"],
    ]},
  { label: "Market", title: "Market comparison",
    blurb: "Carrier quotes on premium, terms, and match.",
    duration: 22, steps: [
      [0, "Toggle Life / P&C / Specialty"],
      [0.3, "Select & deselect carriers"],
      [0.6, "Click compare rows"],
      [0.85, "Read quote summary"],
    ]},
  { label: "Claims", title: "Claims tracker",
    blurb: "Timelines, documents, and adjuster handoff.",
    duration: 16, steps: [
      [0, "Open active claim hero"],
      [0.35, "Step through timeline squares"],
      [0.7, "Inspect claim documents"],
    ]},
  { label: "CLI Agent", title: "White-label CLI agent",
    blurb: "Embedded terminal agent for every audience.",
    duration: 22, steps: [
      [0, "Open white-label CLI"],
      [0.35, "Switch audience context"],
      [0.7, "Run a live command"],
    ]},
  { label: "CRM", title: "Customer book & follow-up",
    blurb: "Rows with suitability + Hello {first name} outreach.",
    duration: 22, steps: [
      [0, "Scan customer book rows"],
      [0.3, "Filter protection suitability"],
      [0.55, "Click Hello {first name} greeting"],
      [0.8, "Send / mass follow-up"],
    ]},
  { label: "Analyzer", title: "In-force policy analyzer",
    blurb: "Household, carrier, IMO, and commercial lenses.",
    duration: 14, steps: [
      [0, "Open policyholder lens"],
      [0.35, "Compare carrier & IMO scores"],
      [0.7, "Check commercial gaps"],
    ]},
  { label: "iOS App", title: "iOS · connect & ask",
    blurb: "Upload or live API, then text Q&A with charts.",
    duration: 28, steps: [
      [0, "Choose Upload PDF or Live API"],
      [0.25, "Ingest in-force policy"],
      [0.45, "Ask: Will my policy lapse?"],
      [0.7, "Ask overfund CV · show chart"],
      [0.9, "Continue to voice"],
    ]},
  { label: "Voice", title: "iOS · voice to broker",
    blurb: "Overfunded IUL options, growth illustration, broker.",
    duration: 24, steps: [
      [0, "Ask overfunded IUL options"],
      [0.3, "Select Max cash-value IUL"],
      [0.55, "View growth illustration"],
      [0.8, "Connect with a broker"],
    ]},
];

const TOTAL = MODULES.reduce((s, m) => s + m.duration, 0); // 180
let playing = false;
let t0 = 0;
let elapsed = 0;
let raf = 0;

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function atTime(sec) {
  let acc = 0;
  for (let i = 0; i < MODULES.length; i++) {
    const m = MODULES[i];
    if (sec < acc + m.duration || i === MODULES.length - 1) {
      const local = Math.min(1, (sec - acc) / m.duration);
      let step = m.steps[0][1];
      for (const [at, label] of m.steps) if (local >= at) step = label;
      return { i, m, local, step, acc };
    }
    acc += m.duration;
  }
}

function render(sec) {
  const { i, m, step } = atTime(sec);
  document.getElementById("clock").textContent = fmt(sec) + " / 3:00";
  document.getElementById("modMeta").textContent = (i + 1) + "/9 · " + m.label;
  document.getElementById("modLabel").textContent = "Module " + (i + 1) + " · " + m.label;
  document.getElementById("title").textContent = m.title;
  document.getElementById("blurb").textContent = m.blurb;
  document.getElementById("step").textContent = step;
  document.getElementById("bar").style.width = Math.min(100, (sec / TOTAL) * 100) + "%";
  document.getElementById("play").textContent = playing ? "Pause" : "Play";
}

function tick(now) {
  elapsed = Math.min(TOTAL, (now - t0) / 1000);
  render(elapsed);
  if (elapsed >= TOTAL) {
    playing = false;
    render(TOTAL);
    return;
  }
  raf = requestAnimationFrame(tick);
}

function play() {
  if (playing) {
    playing = false;
    cancelAnimationFrame(raf);
    render(elapsed);
    return;
  }
  playing = true;
  t0 = performance.now() - elapsed * 1000;
  raf = requestAnimationFrame(tick);
}

function jump(delta) {
  playing = false;
  cancelAnimationFrame(raf);
  const cur = atTime(elapsed);
  let idx = Math.min(MODULES.length - 1, Math.max(0, cur.i + delta));
  let acc = 0;
  for (let i = 0; i < idx; i++) acc += MODULES[i].duration;
  elapsed = acc;
  render(elapsed);
}

document.getElementById("play").onclick = play;
document.getElementById("prev").onclick = () => jump(-1);
document.getElementById("next").onclick = () => jump(1);
document.getElementById("restart").onclick = () => {
  playing = false;
  cancelAnimationFrame(raf);
  elapsed = 0;
  render(0);
};

const beats = document.getElementById("beats");
let acc = 0;
MODULES.forEach((m) => {
  const li = document.createElement("li");
  const end = acc + m.duration;
  li.textContent = fmt(acc) + "–" + fmt(end) + " · " + m.label + " — " + m.steps.map(s => s[1]).join(" → ");
  beats.appendChild(li);
  acc = end;
});

render(0);
</script>
</body>
</html>
`;

mkdirSync(stageDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
if (existsSync(stageDir)) {
  // refresh staging contents
}
writeFileSync(join(stageDir, "README.txt"), readme);
writeFileSync(join(stageDir, "TIMING.txt"), timing);
writeFileSync(join(stageDir, "SIZE-NOTE.txt"), sizeNote);
writeFileSync(join(stageDir, "offline-demo.html"), offlineHtml);

const mp4Src = join(outDir, "PolicyWell-YC-Demo-3min.mp4");
const gifSrc = join(outDir, "PolicyWell-YC-Demo-preview.gif");
if (existsSync(mp4Src)) {
  copyFileSync(mp4Src, join(stageDir, "PolicyWell-YC-Demo-3min.mp4"));
}
if (existsSync(gifSrc)) {
  copyFileSync(gifSrc, join(stageDir, "PolicyWell-YC-Demo-preview.gif"));
}

if (existsSync(zipPath)) rmSync(zipPath);

execFileSync(
  "zip",
  ["-r", "-9", zipPath, "."],
  { cwd: stageDir, stdio: "inherit" },
);

const bytes = statSync(zipPath).size;
const mb = bytes / (1024 * 1024);
console.log(`Wrote ${zipPath}`);
console.log(`Size: ${bytes} bytes (${mb.toFixed(3)} MB)`);
if (mb >= 100) {
  console.error("ERROR: package exceeds 100MB");
  process.exit(1);
}
if (mb > 5) {
  console.warn("Warning: package unexpectedly large for a text/HTML zip");
}
