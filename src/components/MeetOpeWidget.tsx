"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { runAgentTurn, type AgentWorkspace } from "@/lib/agent";
import { createEmptyProfile } from "@/lib/profile";
import type { SessionUser } from "@/lib/types";
import {
  persistProfile,
  persistRecommendations,
  persistSession,
  persistTasks,
  useDocuments,
  useProfile,
  useRecommendations,
  useSession,
  useTasks,
} from "@/lib/use-workspace";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

const WELCOME: ChatMessage = {
  id: "ope-welcome",
  role: "assistant",
  content:
    "Hi - I'm Ope, your PolicyWell guide. Ask about coverage, funding, or next steps. Answers stay grounded in your household context.",
};

const STARTERS = [
  "Will my policy lapse?",
  "What do you recommend?",
  "What do you know about me?",
];

function newId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function MeetOpeWidget() {
  const pathname = usePathname();
  const hideOnAgent =
    pathname === "/agent" ||
    pathname === "/agent/" ||
    pathname?.startsWith("/agent/");

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  const session = useSession();
  const profile = useProfile();
  const documents = useDocuments();
  const recommendations = useRecommendations();
  const tasks = useTasks();
  const latest = useRef({ session, profile, documents, recommendations, tasks });

  useEffect(() => {
    latest.current = { session, profile, documents, recommendations, tasks };
  }, [session, profile, documents, recommendations, tasks]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent | TouchEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [open, messages, busy]);

  function ensureSession(): SessionUser {
    const current = latest.current.session;
    if (current) return current;
    const guest: SessionUser = {
      id: "user_guest",
      email: "guest@policywell.local",
      name: "Guest Analyst",
      role: "policyholder",
    };
    persistSession(guest);
    if (!latest.current.profile) {
      persistProfile(
        createEmptyProfile(guest.id, guest.role, guest.name, guest.email),
      );
    }
    return guest;
  }

  function buildWorkspace(user: SessionUser): AgentWorkspace {
    const { profile: p, documents: docs, recommendations: recs, tasks: t } =
      latest.current;
    return {
      user,
      profile:
        p ?? createEmptyProfile(user.id, user.role, user.name, user.email),
      documents: docs,
      recommendations: recs,
      tasks: t,
    };
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setInput("");
    setMessages((m) => [
      ...m,
      { id: `u_${newId()}`, role: "user", content: trimmed },
    ]);

    try {
      const user = ensureSession();
      const workspace = buildWorkspace(user);
      // Browser-safe deterministic turn - works on static GitHub Pages too.
      const local = runAgentTurn(trimmed, workspace);
      persistProfile(local.workspace.profile);
      persistRecommendations(local.workspace.recommendations);
      persistTasks(local.workspace.tasks);

      const assistantId = `a_${newId()}`;
      setMessages((m) => [
        ...m,
        {
          id: assistantId,
          role: "assistant",
          content: local.reply,
        },
      ]);

      // Optional phrasing enhance when a server API is available (not on Pages).
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            workspace: local.workspace,
          }),
        });
        if (!res.ok) return;
        const enhanced = (await res.json()) as {
          usedLlm?: boolean;
          reply?: string;
        };
        if (enhanced.usedLlm && enhanced.reply?.trim()) {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: enhanced.reply!.trim() }
                : msg,
            ),
          );
        }
      } catch {
        // Keep grounded local reply.
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ope could not finish that turn.";
      setMessages((m) => [
        ...m,
        { id: `e_${newId()}`, role: "system", content: msg },
      ]);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  if (hideOnAgent) return null;

  return (
    <div
      ref={rootRef}
      className={`pw-ope${open ? " is-open" : ""}`}
      data-ope-widget
    >
      {open && (
        <div
          id={panelId}
          className="pw-ope-panel pw-ope-chat"
          role="dialog"
          aria-label="Chat with Ope"
        >
          <div className="pw-ope-panel-head">
            <img
              src="/ope-mascot.png"
              alt=""
              width={56}
              height={56}
              className="pw-ope-panel-avatar"
              decoding="async"
            />
            <div className="min-w-0">
              <p className="pw-ope-kicker">Meet Ope</p>
              <h2 className="pw-ope-title">Chat in place</h2>
            </div>
            <button
              type="button"
              className="pw-ope-close"
              aria-label="Close Meet Ope"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="pw-ope-chat-body" ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`pw-ope-bubble pw-ope-bubble-${m.role}`}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="pw-ope-bubble pw-ope-bubble-assistant pw-ope-typing">
                Ope is thinking…
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="pw-ope-starters">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="pw-ope-starter"
                  disabled={busy}
                  onClick={() => void send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="pw-ope-composer" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Ope anything…"
              aria-label="Message Ope"
              disabled={busy}
              autoComplete="off"
            />
            <button
              type="submit"
              className="pw-ope-send"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </form>

          <div className="pw-ope-chat-foot">
            <Link href="/demo" onClick={() => setOpen(false)}>
              See the product
            </Link>
            <Link href="/agent" onClick={() => setOpen(false)}>
              Full agent workspace
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        className="pw-ope-fab"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close Meet Ope" : "Meet Ope"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pw-ope-fab-ring" aria-hidden />
        <img
          src="/ope-mascot.png"
          alt=""
          width={64}
          height={64}
          className="pw-ope-fab-img"
          decoding="async"
        />
        <span className="pw-ope-fab-label">Meet Ope</span>
      </button>
    </div>
  );
}
