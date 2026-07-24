"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { runAgentTurn, type AgentWorkspace } from "@/lib/agent";
import { ingestDocument } from "@/lib/extraction";
import { createEmptyProfile } from "@/lib/profile";
import type { SessionUser } from "@/lib/types";
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

interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  previewUrl?: string;
  kind: "pdf" | "image" | "text" | "other";
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: ChatAttachment[];
}

interface PendingAttachment {
  id: string;
  file: File;
  name: string;
  mimeType: string;
  previewUrl?: string;
  kind: ChatAttachment["kind"];
}

const WELCOME: ChatMessage = {
  id: "ope-welcome",
  role: "assistant",
  content:
    "Hi - I'm Ope, your PolicyWell guide. Ask about coverage, funding, or next steps - or attach a policy PDF / screenshot and I'll ground the reply in what you upload.",
};

const STARTERS = [
  "Will my policy lapse?",
  "What do you recommend?",
  "What do you know about me?",
];

const ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,.txt,application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif,text/plain";
const MAX_FILES = 5;
const MAX_BYTES = 12 * 1024 * 1024;

function newId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function attachmentKind(file: File): ChatAttachment["kind"] {
  const mime = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/") || /\.(png|jpe?g|webp|heic|heif)$/.test(name)) {
    return "image";
  }
  if (mime === "text/plain" || name.endsWith(".txt")) return "text";
  return "other";
}

function isAllowedFile(file: File): boolean {
  return attachmentKind(file) !== "other";
}

async function readTextFile(file: File): Promise<string | undefined> {
  if (attachmentKind(file) !== "text") return undefined;
  try {
    return await file.text();
  } catch {
    return undefined;
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
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
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const pendingRef = useRef<PendingAttachment[]>([]);

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
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    return () => {
      for (const p of pendingRef.current) {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      }
    };
  }, []);

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
  }, [open, messages, busy, pending]);

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

  function clearPending() {
    setPending((prev) => {
      for (const p of prev) {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      }
      return [];
    });
  }

  function removePending(id: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function addFiles(fileList: FileList | File[] | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    if (!incoming.length) return;

    setAttachError(null);
    const next: PendingAttachment[] = [];
    const errors: string[] = [];

    for (const file of incoming) {
      if (!isAllowedFile(file)) {
        errors.push(`${file.name}: use PDF, PNG, JPG, WEBP, or TXT`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`${file.name}: max ${formatBytes(MAX_BYTES)}`);
        continue;
      }
      next.push({
        id: newId(),
        file,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        kind: attachmentKind(file),
        previewUrl:
          attachmentKind(file) === "image"
            ? URL.createObjectURL(file)
            : undefined,
      });
    }

    setPending((prev) => {
      const room = Math.max(0, MAX_FILES - prev.length);
      if (next.length > room) {
        errors.push(`Up to ${MAX_FILES} files at a time`);
      }
      const kept = next.slice(0, room);
      for (const dropped of next.slice(room)) {
        if (dropped.previewUrl) URL.revokeObjectURL(dropped.previewUrl);
      }
      return [...prev, ...kept];
    });

    if (errors.length) setAttachError(errors[0]);
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    e.target.value = "";
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = e.relatedTarget;
    if (next instanceof Node && rootRef.current?.contains(next)) return;
    setDragOver(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  async function send(text: string, files = pending) {
    const trimmed = text.trim();
    if ((!trimmed && !files.length) || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setAttachError(null);
    setInput("");

    const chatAttachments: ChatAttachment[] = files.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      previewUrl: f.previewUrl,
      kind: f.kind,
    }));

    const names = files.map((f) => f.name).join(", ");
    const prompt =
      trimmed ||
      (files.length
        ? `I uploaded ${names}. Please review the attachment${files.length > 1 ? "s" : ""} and tell me what you can extract.`
        : "");

    setMessages((m) => [
      ...m,
      {
        id: `u_${newId()}`,
        role: "user",
        content: trimmed || `Attached ${files.length} file${files.length > 1 ? "s" : ""}`,
        attachments: chatAttachments.length ? chatAttachments : undefined,
      },
    ]);
    // Keep object URLs alive for the message bubble; clear composer queue.
    setPending([]);

    try {
      const user = ensureSession();
      const created = [];
      for (const item of files) {
        const rawText = await readTextFile(item.file);
        created.push(
          ingestDocument({
            userId: user.id,
            filename: item.name,
            mimeType: item.mimeType,
            rawText,
          }),
        );
      }
      if (created.length) {
        const nextDocs = [...created, ...latest.current.documents];
        persistDocuments(nextDocs);
        latest.current = { ...latest.current, documents: nextDocs };
      }

      const workspace = buildWorkspace(user);
      const local = runAgentTurn(prompt, workspace);
      persistProfile(local.workspace.profile);
      persistRecommendations(local.workspace.recommendations);
      persistTasks(local.workspace.tasks);

      const assistantId = `a_${newId()}`;
      const ingestNote =
        created.length > 0
          ? `\n\nIngested ${created.length} attachment${created.length > 1 ? "s" : ""} into your PolicyWell workspace (verify on Upload when ready).`
          : "";
      setMessages((m) => [
        ...m,
        {
          id: assistantId,
          role: "assistant",
          content: `${local.reply}${ingestNote}`,
        },
      ]);

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
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
                ? {
                    ...msg,
                    content: `${enhanced.reply!.trim()}${ingestNote}`,
                  }
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
    void send(input, pending);
  }

  if (hideOnAgent) return null;

  return (
    <div
      ref={rootRef}
      className={`pw-ope${open ? " is-open" : ""}${dragOver ? " is-dragover" : ""}`}
      data-ope-widget
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
                {m.attachments && m.attachments.length > 0 && (
                  <div className="pw-ope-msg-attachments">
                    {m.attachments.map((a) =>
                      a.kind === "image" && a.previewUrl ? (
                        <a
                          key={a.id}
                          className="pw-ope-msg-thumb"
                          href={a.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={a.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.previewUrl} alt={a.name} />
                          <span>{a.name}</span>
                        </a>
                      ) : (
                        <span key={a.id} className="pw-ope-msg-file">
                          {a.kind === "pdf" ? "PDF" : "FILE"} · {a.name}
                        </span>
                      ),
                    )}
                  </div>
                )}
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="pw-ope-bubble pw-ope-bubble-assistant pw-ope-typing">
                Ope is thinking…
              </div>
            )}
          </div>

          {messages.length <= 2 && pending.length === 0 && (
            <div className="pw-ope-starters">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="pw-ope-starter"
                  disabled={busy}
                  onClick={() => void send(s, [])}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {pending.length > 0 && (
            <div className="pw-ope-pending" aria-label="Pending attachments">
              {pending.map((p) => (
                <div key={p.id} className="pw-ope-pending-chip">
                  {p.kind === "image" && p.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.previewUrl} alt="" className="pw-ope-pending-thumb" />
                  ) : (
                    <span className="pw-ope-pending-badge">
                      {p.kind === "pdf" ? "PDF" : "TXT"}
                    </span>
                  )}
                  <span className="pw-ope-pending-name" title={p.name}>
                    {p.name}
                  </span>
                  <button
                    type="button"
                    className="pw-ope-pending-remove"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => removePending(p.id)}
                    disabled={busy}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {attachError && <p className="pw-ope-attach-error">{attachError}</p>}
          {dragOver && (
            <p className="pw-ope-drop-hint">Drop PDF or screenshot to attach</p>
          )}

          <form className="pw-ope-composer" onSubmit={onSubmit}>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              accept={ACCEPT}
              multiple
              onChange={onFileInput}
            />
            <button
              type="button"
              className="pw-ope-attach"
              aria-label="Attach PDF or screenshot"
              title="Attach PDF or screenshot"
              disabled={busy || pending.length >= MAX_FILES}
              onClick={() => fileRef.current?.click()}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.48" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                pending.length
                  ? "Add a note about the attachment…"
                  : "Ask Ope or attach a file…"
              }
              aria-label="Message Ope"
              disabled={busy}
              autoComplete="off"
            />
            <button
              type="submit"
              className="pw-ope-send"
              disabled={busy || (!input.trim() && pending.length === 0)}
              aria-label="Send message"
            >
              Send
            </button>
          </form>

          <div className="pw-ope-chat-foot">
            <button
              type="button"
              className="pw-ope-foot-btn"
              onClick={() => clearPending()}
              disabled={!pending.length || busy}
            >
              Clear attachments
            </button>
            <Link href="/upload" onClick={() => setOpen(false)}>
              Full upload desk
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
