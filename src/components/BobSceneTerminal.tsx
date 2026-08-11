"use client";

import { useEffect, useRef, useState } from "react";
import type { BobLine, BobScene, BobTone } from "@/lib/book-of-business-cli";

const LINE_MS = 52;

function toneClass(tone: BobTone = "default"): string {
  switch (tone) {
    case "command":
      return "pw-bob-tone-command";
    case "success":
      return "pw-bob-tone-success";
    case "muted":
      return "pw-bob-tone-muted";
    case "warn":
      return "pw-bob-tone-warn";
    case "accent":
      return "pw-bob-tone-accent";
    case "dim":
      return "pw-bob-tone-dim";
    case "money":
      return "pw-bob-tone-money";
    case "danger":
      return "pw-bob-tone-danger";
    case "blank":
      return "pw-bob-tone-blank";
    default:
      return "pw-bob-tone-default";
  }
}

function renderLine(line: BobLine, key: string) {
  if (line.tone === "blank" || (!line.text && !line.segments?.length)) {
    return <div key={key} className="pw-bob-tone-blank" />;
  }
  if (line.segments?.length) {
    return (
      <div key={key} className="pw-bob-line">
        {line.segments.map((seg, i) => (
          <span key={`${key}-${i}`} className={toneClass(seg.tone)}>
            {seg.text}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div key={key} className={`pw-bob-line ${toneClass(line.tone)}`}>
      {line.text}
    </div>
  );
}

export function BobSceneTerminal({
  scene,
  reducedMotion,
  chromeTitle,
}: {
  scene: BobScene;
  reducedMotion: boolean;
  chromeTitle?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(
    reducedMotion ? scene.lines.length : 0,
  );
  const [done, setDone] = useState(reducedMotion);
  const [demoKey, setDemoKey] = useState(0);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(reducedMotion ? scene.lines.length : 0);
    setDone(reducedMotion);
    setDemoKey((k) => k + 1);
  }, [scene.id, reducedMotion, scene.lines.length]);

  useEffect(() => {
    if (reducedMotion) return;
    let i = 0;
    let timer = 0;
    const tick = () => {
      i += 1;
      setVisibleCount(i);
      if (i >= scene.lines.length) {
        setDone(true);
        return;
      }
      const next = scene.lines[i];
      timer = window.setTimeout(tick, next?.delayMs ?? LINE_MS);
    };
    timer = window.setTimeout(tick, 140);
    return () => window.clearTimeout(timer);
  }, [demoKey, reducedMotion, scene.lines]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visibleCount]);

  function skip() {
    if (done) return;
    setVisibleCount(scene.lines.length);
    setDone(true);
  }

  function replay() {
    if (reducedMotion) {
      setVisibleCount(scene.lines.length);
      setDone(true);
      return;
    }
    setVisibleCount(0);
    setDone(false);
    setDemoKey((k) => k + 1);
  }

  const shown = scene.lines.slice(0, visibleCount);
  const title = chromeTitle ?? `policywell · ${scene.cwd}`;

  return (
    <div className="pw-bob-window" data-scene={scene.id}>
      <header className="pw-bob-chrome">
        <span className="pw-bob-traffic" aria-hidden>
          <i className="is-red" />
          <i className="is-yellow" />
          <i className="is-green" />
        </span>
        <p className="pw-bob-title">{title}</p>
        <div className="pw-bob-chrome-actions">
          {!done ? (
            <button type="button" className="pw-bob-chrome-btn" onClick={skip}>
              Skip
            </button>
          ) : (
            <button type="button" className="pw-bob-chrome-btn" onClick={replay}>
              Replay
            </button>
          )}
        </div>
      </header>
      <div className="pw-bob-body" ref={bodyRef}>
        <pre className="pw-bob-pre" aria-live="polite">
          {shown.map((entry, idx) => renderLine(entry, `${scene.id}-${idx}`))}
          {!done ? (
            <div className="pw-bob-cursor-row" aria-hidden>
              <span className="pw-bob-prompt">❯</span>
              <span className="pw-bob-cursor" />
            </div>
          ) : (
            <div className="pw-bob-cursor-row is-idle" aria-hidden>
              <span className="pw-bob-prompt">❯</span>
              <span className="pw-bob-cursor is-idle" />
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}
