"use client";

import Link from "next/link";
import { useState } from "react";
import { AppNav, ConfidenceBadge } from "@/components/ui";
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

export default function UploadPage() {
  const session = useSession();
  const docs = useDocuments();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

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
    setStatus(`OCR + extraction complete for ${created.length} file(s). Please verify.`);
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
          Please <Link href="/login" className="underline">sign in</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 space-y-8">
        <div className="animate-rise">
          <h1 className="font-display text-4xl text-pine">Insurance ingestion</h1>
          <p className="text-stone mt-2 max-w-2xl">
            Upload policy PDFs, illustrations, ledgers, or 1035 forms. OCR runs locally in the Sprint 1 engine, AI extracts structured fields, and you verify before anything is trusted.
          </p>
        </div>

        <div
          className="animate-rise-delay pw-panel p-8 border-dashed border-2 border-pine/20 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
        >
          <p className="font-display text-2xl text-pine mb-2">Drag & drop</p>
          <p className="text-stone text-sm mb-4">PDF · Illustration · Annual statement · In-force ledger · 1035</p>
          <label className="pw-btn cursor-pointer inline-flex">
            Choose files
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>
          <p className="mt-4 text-xs text-stone">
            Tip: name a file with “Mutual” or “IUL” to seed the Mutual of Omaha extraction demo.
          </p>
        </div>

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
                      d.id === resolvedActiveId ? "bg-pine text-foam" : "hover:bg-pine/5"
                    }`}
                  >
                    <div className="text-sm font-medium">{d.filename}</div>
                    <div className={`text-xs mt-1 ${d.id === resolvedActiveId ? "text-foam/70" : "text-stone"}`}>
                      {d.kind} · {Math.round(d.overallConfidence * 100)}%
                      {d.verified ? " · verified" : ""}
                    </div>
                  </button>
                </li>
              ))}
              {!visible.length && (
                <li className="text-sm text-stone">No documents yet.</li>
              )}
            </ul>
          </section>

          <section className="pw-panel p-5 animate-rise-delay">
            {!active ? (
              <p className="text-stone">Select a document to review extraction.</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-2xl text-pine">Review & edit</h2>
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
                    const val = Array.isArray(f.value) ? f.value.join(", ") : f.value ?? "";
                    return (
                      <label key={key} className="text-sm text-stone">
                        {label}{" "}
                        <span className="text-[11px]">({Math.round(f.confidence * 100)}%)</span>
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
