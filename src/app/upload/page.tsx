"use client";

import Link from "next/link";
import { useState } from "react";
import { AppNav, ConfidenceBadge } from "@/components/ui";
import { ingestEmail } from "@/lib/email-import";
import {
  ingestDocument,
  searchDocuments,
  verifyDocument,
} from "@/lib/extraction";
import { field } from "@/lib/profile";
import {
  persistDocuments,
  useDocuments,
  useSession,
} from "@/lib/use-workspace";
import type { IngestedDocument } from "@/lib/types";

function GreenWell({ active }: { active: boolean }) {
  return (
    <div
      className={`pw-well-art${active ? " is-active" : ""}`}
      aria-hidden
    >
      <svg
        className="pw-well-svg"
        viewBox="0 0 200 168"
        role="img"
        focusable="false"
      >
        <defs>
          <linearGradient id="pwWellStone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5f9a7a" />
            <stop offset="55%" stopColor="#3d6b5a" />
            <stop offset="100%" stopColor="#214a3c" />
          </linearGradient>
          <linearGradient id="pwWellWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfe8d9" />
            <stop offset="100%" stopColor="#7fbf9a" />
          </linearGradient>
          <radialGradient id="pwWellGlow" cx="50%" cy="42%" r="48%">
            <stop offset="0%" stopColor="rgba(143, 175, 160, 0.55)" />
            <stop offset="100%" stopColor="rgba(143, 175, 160, 0)" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="148" rx="62" ry="10" fill="rgba(15, 47, 40, 0.1)" />
        <ellipse cx="100" cy="48" rx="58" ry="18" fill="url(#pwWellGlow)" />
        {/* well body */}
        <path
          d="M42 52c0 52 16 88 58 96 42-8 58-44 58-96"
          fill="url(#pwWellStone)"
        />
        {/* brick rings */}
        <path
          d="M48 78h104M52 100h96M58 120h84"
          stroke="rgba(245,250,247,0.18)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M70 66v70M100 60v80M130 66v70"
          stroke="rgba(10,31,26,0.18)"
          strokeWidth="2"
        />
        {/* rim */}
        <ellipse
          cx="100"
          cy="52"
          rx="58"
          ry="18"
          fill="#6fa888"
          stroke="#0f2f28"
          strokeWidth="3"
        />
        <ellipse cx="100" cy="52" rx="44" ry="12" fill="url(#pwWellWater)" />
        <ellipse
          cx="100"
          cy="50"
          rx="28"
          ry="6"
          fill="rgba(245,250,247,0.35)"
        />
        {/* document dropping in */}
        <g className="pw-well-doc">
          <rect
            x="86"
            y="18"
            width="28"
            height="34"
            rx="3"
            fill="#f5faf7"
            stroke="#0f2f28"
            strokeWidth="2"
          />
          <path d="M104 18v10h10" fill="#d5e4dc" stroke="#0f2f28" strokeWidth="2" />
          <path
            d="M92 36h16M92 42h12"
            stroke="#3d6b5a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export default function UploadPage() {
  const session = useSession();
  const docs = useDocuments();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [emailRaw, setEmailRaw] = useState("");
  const [dragging, setDragging] = useState(false);

  const resolvedActiveId = activeId ?? docs[0]?.id ?? null;
  const active = docs.find((d) => d.id === resolvedActiveId) ?? null;
  const visible = searchDocuments(docs, query);

  function persist(next: IngestedDocument[]) {
    persistDocuments(next);
  }

  function onFiles(files: FileList | null) {
    if (!files?.length || !session) return;
    const created: IngestedDocument[] = [];
    Array.from(files).forEach((file) => {
      created.push(
        ingestDocument({
          userId: session.id,
          filename: file.name,
          mimeType: file.type || "application/pdf",
        }),
      );
    });
    const next = [...created, ...docs];
    persist(next);
    setActiveId(created[0].id);
    setStatus(
      `Pulled ${created.length} document${created.length > 1 ? "s" : ""} from the well. Please verify.`,
    );
  }

  function updateField(key: keyof IngestedDocument["extraction"], raw: string) {
    if (!active) return;
    const numericKeys = new Set([
      "issueAge",
      "faceAmount",
      "cashValue",
      "targetPremium",
      "currentPremium",
      "deathBenefit",
      "coi",
      "loans",
    ]);
    let value: string | number | string[] | null = raw;
    if (numericKeys.has(key)) {
      value = raw === "" ? null : Number(raw.replace(/,/g, ""));
    }
    if (key === "riders") {
      value = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const updated = docs.map((d) =>
      d.id === active.id
        ? {
            ...d,
            extraction: {
              ...d.extraction,
              [key]: field(value as never, 1, "user_edit"),
            },
          }
        : d,
    );
    persist(updated);
  }

  function verify() {
    if (!active) return;
    const next = docs.map((d) => (d.id === active.id ? verifyDocument(d) : d));
    persist(next);
    setStatus("Human verification recorded. Structured JSON ready.");
  }

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please{" "}
          <Link href="/login" className="underline">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 space-y-8">
        <div className="animate-rise pw-well-intro">
          <p className="pw-well-eyebrow">PolicyWell</p>
          <h1 className="font-display text-4xl text-pine">
            Drop your policy into the well
          </h1>
          <p className="pw-well-lede">
            Policies, illustrations, and statements land in one green place —
            then PolicyWell reads them for coverage intelligence.
          </p>
        </div>

        <div
          className={`animate-rise-delay pw-well-drop${
            dragging ? " is-dragging" : ""
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFiles(e.dataTransfer.files);
          }}
        >
          <GreenWell active={dragging} />
          <div className="pw-well-drop-copy">
            <p className="pw-well-drop-title">
              {dragging
                ? "Release to drop it in"
                : "Drop your policy into the well"}
            </p>
            <p className="pw-well-drop-sub">
              Personal: policies · illustrations · applications · health
              questionnaires
              <br />
              Commercial: loss runs · certificates · schedules · payroll ·
              cyber questionnaires
            </p>
            <label className="pw-btn pw-well-browse cursor-pointer inline-flex">
              Choose from your device
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
          </div>
        </div>

        <details className="pw-panel p-5 animate-rise-delay">
          <summary className="font-display text-xl text-pine cursor-pointer">
            Email import
          </summary>
          <p className="text-sm text-stone mt-2 mb-3">
            Paste a forwarded email (headers optional).
          </p>
          <textarea
            className="pw-input min-h-[140px] font-mono text-xs"
            placeholder={
              "From: statements@carrier.example\nSubject: Annual Statement\n\nProduct: ...\nFace Amount: $..."
            }
            value={emailRaw}
            onChange={(e) => setEmailRaw(e.target.value)}
          />
          <button
            type="button"
            className="pw-btn mt-3"
            disabled={!emailRaw.trim()}
            onClick={() => {
              if (!session || !emailRaw.trim()) return;
              const doc = ingestEmail(session.id, emailRaw);
              persist([doc, ...docs]);
              setActiveId(doc.id);
              setEmailRaw("");
              setStatus(
                `Email imported as ${doc.filename}. Please verify extraction.`,
              );
            }}
          >
            Import email
          </button>
        </details>

        {status && <p className="text-sm text-ok animate-rise">{status}</p>}

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <section className="pw-panel p-5 animate-rise">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-2xl text-pine">Documents</h2>
              <input
                className="pw-input !py-2 max-w-[180px]"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <ul className="space-y-2">
              {visible.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(d.id)}
                    className={`w-full text-left rounded-xl px-3 py-3 transition-colors ${
                      d.id === resolvedActiveId
                        ? "bg-pine text-foam"
                        : "hover:bg-pine/5"
                    }`}
                  >
                    <div className="text-sm font-medium">{d.filename}</div>
                    <div
                      className={`text-xs mt-1 ${
                        d.id === resolvedActiveId
                          ? "text-foam/70"
                          : "text-stone"
                      }`}
                    >
                      {d.kind} · {Math.round(d.overallConfidence * 100)}%
                      {d.verified ? " · verified" : ""}
                    </div>
                  </button>
                </li>
              ))}
              {!visible.length && (
                <li className="text-sm text-stone">
                  Nothing in the well yet.
                </li>
              )}
            </ul>
          </section>

          <section className="pw-panel p-5 animate-rise-delay">
            {!active ? (
              <p className="text-stone">
                Select a document to review extraction.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-2xl text-pine">
                    Review & edit
                  </h2>
                  <ConfidenceBadge value={active.overallConfidence} />
                </div>
                <p className="text-xs text-stone whitespace-pre-wrap bg-white/50 rounded-xl p-3 max-h-36 overflow-auto">
                  {active.ocrText}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(
                    [
                      ["carrier", "Carrier"],
                      ["productName", "Product"],
                      ["productType", "Product type"],
                      ["issueAge", "Issue age"],
                      ["faceAmount", "Face amount"],
                      ["deathBenefit", "Death benefit"],
                      ["cashValue", "Cash value"],
                      ["targetPremium", "Target premium"],
                      ["currentPremium", "Current premium"],
                      ["coi", "COI"],
                      ["loans", "Loans"],
                    ] as const
                  ).map(([key, label]) => {
                    const f = active.extraction[key];
                    const val = Array.isArray(f.value)
                      ? f.value.join(", ")
                      : (f.value ?? "");
                    return (
                      <label key={key} className="text-sm text-stone">
                        {label}{" "}
                        <span className="text-[11px]">
                          ({Math.round(f.confidence * 100)}%)
                        </span>
                        <input
                          className="pw-input mt-1 !py-2"
                          value={String(val)}
                          onChange={(e) => updateField(key, e.target.value)}
                        />
                      </label>
                    );
                  })}
                  <label className="text-sm text-stone sm:col-span-2">
                    Riders
                    <input
                      className="pw-input mt-1 !py-2"
                      value={(active.extraction.riders.value ?? []).join(", ")}
                      onChange={(e) => updateField("riders", e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="pw-btn" onClick={verify}>
                    Confirm human verification
                  </button>
                  <Link href="/workspace" className="pw-btn pw-btn-secondary">
                    Open workspace
                  </Link>
                </div>
                <pre className="text-[11px] bg-pine text-foam/90 rounded-xl p-4 overflow-auto max-h-48">
                  {JSON.stringify(active.extraction, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
