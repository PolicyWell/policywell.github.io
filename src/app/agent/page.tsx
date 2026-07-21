"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppNav, ConfidenceBadge } from "@/components/ui";
import { runAgentTurn, type AgentWorkspace } from "@/lib/agent";
import { createEmptyProfile } from "@/lib/profile";
import { buildDemoSeed } from "@/lib/seed";
import {
  persistDocuments,
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
import type { SessionUser } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tools?: { tool: string; summary: string; ok: boolean }[];
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I'm your PolicyWell Insurance Intelligence Agent — not a chatbot. " +
    "I update your household and policy context before I answer, reason with deterministic scores and documents, " +
    "and keep every recommendation pending until you approve it.\n\n" +
    "Click a starter below, seed the Mutual of Omaha demo, or type a question.",
};

const STARTERS = [
  "I'm married with three kids in TX, and I have a Mutual of Omaha IUL.",
  "Will my policy lapse?",
  "Run funding scenarios.",
  "What do you recommend?",
  "Compare my policies.",
  "What do you know about me?",
];

export default function AgentPage() {
  const session = useSession();
  const profile = useProfile();
  const documents = useDocuments();
  const recommendations = useRecommendations();
  const tasks = useTasks();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ session, profile, documents, recommendations, tasks });

  useEffect(() => {
    latest.current = { session, profile, documents, recommendations, tasks };
  }, [session, profile, documents, recommendations, tasks]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }

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

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setError(null);
    setActivity("Running agent tools…");
    setInput("");
    setMessages((m) => [
      ...m,
      { id: `u_${Date.now()}`, role: "user", content: trimmed },
    ]);
    scrollToBottom();

    // Defer so the user message paints before the (sync) tool run
    window.setTimeout(() => {
      try {
        const user = ensureSession();
        const result = runAgentTurn(trimmed, buildWorkspace(user));

        persistProfile(result.workspace.profile);
        persistRecommendations(result.workspace.recommendations);
        persistTasks(result.workspace.tasks);

        setMessages((m) => [
          ...m,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            content: result.reply,
            tools: result.toolResults.map((t) => ({
              tool: t.tool,
              summary: t.summary,
              ok: t.ok,
            })),
          },
        ]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "The agent failed this turn.";
        setError(msg);
        setMessages((m) => [
          ...m,
          { id: `e_${Date.now()}`, role: "system", content: msg },
        ]);
      } finally {
        busyRef.current = false;
        setBusy(false);
        setActivity(null);
        scrollToBottom();
      }
    }, 30);
  }

  function seedDemo() {
    try {
      const user = ensureSession();
      const demoUser: SessionUser = {
        ...user,
        id: "user_alex",
        email: "alex@example.com",
        name: "Alex Rivera",
        role: "policyholder",
      };
      const { profile: p, documents: docs } = buildDemoSeed(demoUser);
      persistSession(demoUser);
      persistProfile(p);
      persistDocuments(docs);
      persistRecommendations([]);
      persistTasks([]);
      setError(null);
      setMessages((m) => [
        ...m,
        {
          id: `seed_${Date.now()}`,
          role: "system",
          content:
            "Demo household loaded: Alex Rivera — married, 3 kids, TX mortgage, Mutual of Omaha IUL (verified). Ask me anything — try “Will my policy lapse?”",
        },
      ]);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to seed demo");
    }
  }

  const liveProfile =
    profile ??
    (session
      ? createEmptyProfile(session.id, session.role, session.name, session.email)
      : null);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AppNav role={session?.role} />
      <main className="pw-shell flex-1 grid lg:grid-cols-[1.4fr_0.6fr] gap-6 py-6">
        <section className="pw-panel flex flex-col min-h-[70vh] shadow-[var(--shadow-soft)]">
          <header className="px-5 py-4 border-b border-pine/10 flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl text-pine">Intelligence Agent</h1>
              <p className="text-xs text-stone">
                Context → tools → grounded answer · human approval required
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
                onClick={seedDemo}
              >
                Seed IUL demo
              </button>
              {!session && (
                <Link href="/login" className="pw-btn !py-2 !px-3 text-xs">
                  Sign in
                </Link>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[92%] ${m.role === "user" ? "ml-auto" : ""}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-pine text-foam"
                      : m.role === "system"
                        ? "bg-amber/15 text-ink border border-amber/30"
                        : "bg-white/80 text-ink border border-pine/10"
                  }`}
                >
                  {m.content}
                </div>
                {m.tools && m.tools.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.tools.map((t, i) => (
                      <span
                        key={`${m.id}_${i}`}
                        className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                          t.ok ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"
                        }`}
                        title={t.summary}
                      >
                        {t.tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {activity && (
              <div className="text-xs text-moss animate-pulse-soft">{activity}</div>
            )}
            {error && (
              <div className="text-xs text-danger border border-danger/20 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-pine/15 text-stone hover:text-pine disabled:opacity-50 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="p-4 border-t border-pine/10 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              className="pw-input"
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent — household facts, lapse risk, scenarios, recommendations…"
            />
            <button
              type="submit"
              className="pw-btn shrink-0"
              disabled={busy || !input.trim()}
            >
              {busy ? "…" : "Send"}
            </button>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="pw-panel p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-pine">Live context</h2>
              {liveProfile && (
                <ConfidenceBadge value={liveProfile.overallConfidence} />
              )}
            </div>
            {!liveProfile ? (
              <p className="text-sm text-stone">No profile yet — talk to the agent.</p>
            ) : (
              <dl className="text-sm space-y-2">
                <Row label="Who" value={liveProfile.displayName} />
                <Row label="Role" value={liveProfile.role} />
                <Row
                  label="Household"
                  value={
                    [
                      liveProfile.household.maritalStatus.value,
                      liveProfile.household.dependentsCount.value != null
                        ? `${liveProfile.household.dependentsCount.value} dependents`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"
                  }
                />
                <Row label="State" value={liveProfile.household.state.value} />
                <Row
                  label="Carrier"
                  value={liveProfile.carrier.primaryCarrier.value}
                />
                <Row label="Documents" value={String(documents.length)} />
                <Row
                  label="Pending recs"
                  value={String(
                    recommendations.filter((r) => r.status === "pending").length,
                  )}
                />
                <Row
                  label="Open tasks"
                  value={String(tasks.filter((t) => t.status === "open").length)}
                />
                {liveProfile.missingFields.length > 0 && (
                  <div className="pt-2 text-xs text-danger">
                    Missing: {liveProfile.missingFields.join(", ")}
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className="pw-panel p-5 text-sm text-stone space-y-2">
            <h2 className="font-display text-xl text-pine">How it works</h2>
            <p>
              Each message runs the agent loop in your browser: plan tools →
              update context / score / analyze / recommend → reply. Tool chips
              under each answer show what ran.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link href="/upload" className="pw-btn pw-btn-secondary !py-2 text-xs">
                Upload docs
              </Link>
              <Link
                href="/workspace"
                className="pw-btn pw-btn-secondary !py-2 text-xs"
              >
                Scores & approval
              </Link>
              <Link href="/tasks" className="pw-btn pw-btn-secondary !py-2 text-xs">
                Tasks
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-pine/5 pb-1.5">
      <dt className="text-stone">{label}</dt>
      <dd className="text-ink text-right">{value || "—"}</dd>
    </div>
  );
}
