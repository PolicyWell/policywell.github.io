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
import {
  humanizeOpeReply,
  identityAck,
  loadOpeIdentity,
  mergeIdentity,
  opeWelcome,
  parseIdentityFromMessage,
  recordOpeChat,
  saveOpeIdentity,
  type OpeChatIdentity,
} from "@/lib/ope-chat";
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

const STARTERS_INTRO = [
  "I'm Alex",
  "Jordan — jordan@firm.com",
  "Just browsing coverage options",
];

const STARTERS_KNOWN = [
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

function looksLikeIdentityOnly(text: string, patch: Partial<OpeChatIdentity>): boolean {
  if (!patch.name && !patch.email) return false;
  const stripped = text
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "")
    .replace(
      /(?:my name is|i'?m|i am|this is|it'?s|call me|hi|hello|hey|name[:\s]+)/gi,
      "",
    )
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = stripped.split(" ").filter(Boolean);
  if (words.length <= 4) return true;
  if (
    patch.name &&
    stripped.toLowerCase() === patch.name.toLowerCase()
  ) {
    return true;
  }
  return false;
}

export function MeetOpeWidget() {
  const pathname = usePathname();
  const hideOnAgent =
    pathname === "/agent" ||
    pathname === "/agent/" ||
    pathname?.startsWith("/agent/") ||
    pathname === "/pear" ||
    pathname === "/pear/" ||
    pathname?.startsWith("/pear/") ||
    pathname === "/pear2" ||
    pathname === "/pear2/" ||
    pathname?.startsWith("/pear2/") ||
    pathname === "/pear-x" ||
    pathname === "/pear-x/" ||
    pathname?.startsWith("/pear-x/");

  const [open, setOpen] = useState(false);
  const [identity, setIdentity] = useState<OpeChatIdentity | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "ope-welcome", role: "assistant", content: opeWelcome(null) },
  ]);
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
  const identityRef = useRef<OpeChatIdentity | null>(null);
  const askedEmailRef = useRef(false);
  const seqRef = useRef(0);
  const hydratedRef = useRef(false);

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
    identityRef.current = identity;
  }, [identity]);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const stored = loadOpeIdentity();
    if (stored) {
      setIdentity(stored);
      identityRef.current = stored;
      setMessages([
        { id: "ope-welcome", role: "assistant", content: opeWelcome(stored) },
      ]);
      seqRef.current = 1;
    }
  }, []);

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

  function ensureSession(nameHint?: string): SessionUser {
    const current = latest.current.session;
    if (current) {
      if (nameHint && current.name === "Guest Analyst") {
        const updated = { ...current, name: nameHint };
        persistSession(updated);
        return updated;
      }
      return current;
    }
    const guest: SessionUser = {
      id: "user_guest",
      email: identityRef.current?.email || "guest@policywell.local",
      name: nameHint || identityRef.current?.name || "Guest Analyst",
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

  async function persistTurn(
    nextIdentity: OpeChatIdentity | null,
    turnMessages: { role: "user" | "assistant" | "system"; content: string }[],
  ) {
    if (!nextIdentity?.name) return;
    const seqStart = seqRef.current;
    seqRef.current = seqStart + turnMessages.length;
    const result = await recordOpeChat({
      identity: nextIdentity,
      pagePath: pathname || "/",
      messages: turnMessages,
      messageSeqStart: seqStart,
    });
    if (result.ok && result.data.leadId) {
      const withLead = { ...nextIdentity, leadId: result.data.leadId };
      saveOpeIdentity(withLead);
      setIdentity(withLead);
      identityRef.current = withLead;
    }
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

    const userBubble: ChatMessage = {
      id: `u_${newId()}`,
      role: "user",
      content: trimmed || `Attached ${files.length} file${files.length > 1 ? "s" : ""}`,
      attachments: chatAttachments.length ? chatAttachments : undefined,
    };

    setMessages((m) => [...m, userBubble]);
    setPending([]);

    try {
      const priorIdentity = identityRef.current;
      const patch = trimmed ? parseIdentityFromMessage(trimmed) : {};
      const nextIdentity = mergeIdentity(priorIdentity, patch);
      const capturedSomething =
        Boolean(patch.name && patch.name !== priorIdentity?.name) ||
        Boolean(patch.email && patch.email !== priorIdentity?.email) ||
        Boolean(patch.company && patch.company !== priorIdentity?.company);

      if (nextIdentity) {
        saveOpeIdentity(nextIdentity);
        setIdentity(nextIdentity);
        identityRef.current = nextIdentity;
        // Keep workspace profile name in sync so tool replies don't say "Jordan"/Guest.
        const syncedUser = ensureSession(nextIdentity.name);
        const currentProfile =
          latest.current.profile ??
          createEmptyProfile(
            syncedUser.id,
            syncedUser.role,
            nextIdentity.name,
            nextIdentity.email || syncedUser.email,
          );
        if (
          currentProfile.displayName !== nextIdentity.name ||
          (nextIdentity.email && currentProfile.email !== nextIdentity.email)
        ) {
          const syncedProfile = {
            ...currentProfile,
            displayName: nextIdentity.name,
            email: nextIdentity.email || currentProfile.email,
            updatedAt: new Date().toISOString(),
          };
          persistProfile(syncedProfile);
          latest.current = { ...latest.current, profile: syncedProfile };
        }
      }

      const identityOnly =
        !files.length &&
        Boolean(trimmed) &&
        looksLikeIdentityOnly(trimmed, patch) &&
        capturedSomething;

      if (identityOnly && nextIdentity) {
        const ack = identityAck(nextIdentity, patch);
        const assistantId = `a_${newId()}`;
        setMessages((m) => [
          ...m,
          { id: assistantId, role: "assistant", content: ack },
        ]);
        void persistTurn(nextIdentity, [
          { role: "user", content: userBubble.content },
          { role: "assistant", content: ack },
        ]);
        return;
      }

      const user = ensureSession(nextIdentity?.name);
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
      const local = runAgentTurn(prompt, workspace, { mode: "ope" });
      persistProfile(local.workspace.profile);
      persistRecommendations(local.workspace.recommendations);
      persistTasks(local.workspace.tasks);

      let reply = humanizeOpeReply(local.reply, nextIdentity);
      if (
        nextIdentity?.name &&
        !nextIdentity.email &&
        !askedEmailRef.current &&
        capturedSomething === false
      ) {
        askedEmailRef.current = true;
        reply += `\n\nBy the way — what's the best email if we need to follow up?`;
      } else if (!nextIdentity?.name && !askedEmailRef.current) {
        askedEmailRef.current = true;
        reply += `\n\nQuick one — who should I say I'm chatting with?`;
      }

      const ingestNote =
        created.length > 0
          ? `\n\nIngested ${created.length} attachment${created.length > 1 ? "s" : ""} into your PolicyWell workspace (verify on Upload when ready).`
          : "";

      const assistantId = `a_${newId()}`;
      setMessages((m) => [
        ...m,
        {
          id: assistantId,
          role: "assistant",
          content: `${reply}${ingestNote}`,
        },
      ]);

      const historyForApi = [...messages, userBubble]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-8)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
            workspace: local.workspace,
            mode: "ope",
            visitorName: nextIdentity?.name,
            history: historyForApi,
          }),
        });
        if (res.ok) {
          const enhanced = (await res.json()) as {
            usedLlm?: boolean;
            reply?: string;
          };
          if (enhanced.usedLlm && enhanced.reply?.trim()) {
            const polished = humanizeOpeReply(
              enhanced.reply.trim(),
              nextIdentity,
            );
            const finalReply = `${polished}${ingestNote}`;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: finalReply }
                  : msg,
              ),
            );
            void persistTurn(nextIdentity, [
              { role: "user", content: userBubble.content },
              { role: "assistant", content: finalReply },
            ]);
            return;
          }
        }
      } catch {
        // Keep grounded local reply.
      }

      void persistTurn(nextIdentity, [
        { role: "user", content: userBubble.content },
        { role: "assistant", content: `${reply}${ingestNote}` },
      ]);
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

  const starters = identity?.name ? STARTERS_KNOWN : STARTERS_INTRO;
  const showStarters =
    messages.length <= 2 && pending.length === 0 && !busy;

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
              <h2 className="pw-ope-title">
                {identity?.name ? `Chat with ${identity.name.split(" ")[0]}` : "Live chat"}
              </h2>
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
                Ope is typing…
              </div>
            )}
          </div>

          {showStarters && (
            <div className="pw-ope-starters">
              {starters.map((s) => (
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
                  : identity?.name
                    ? `Message Ope…`
                    : "Your name, or ask Ope anything…"
              }
              aria-label="Message Ope"
              disabled={busy}
              autoComplete="name"
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
              Open the well
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
