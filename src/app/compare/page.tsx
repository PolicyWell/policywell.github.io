"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppNav } from "@/components/ui";
import { comparePolicies } from "@/lib/comparison";
import { modelFundingScenarios } from "@/lib/scenarios";
import { useDocuments, useProfile, useSession } from "@/lib/use-workspace";

export default function ComparePage() {
  const session = useSession();
  const profile = useProfile();
  const docs = useDocuments();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [proposedId, setProposedId] = useState<string | null>(null);

  const current =
    docs.find((d) => d.id === currentId) ?? docs[0] ?? null;
  const proposed =
    docs.find((d) => d.id === proposedId) ??
    docs.find((d) => d.id !== current?.id) ??
    null;

  const report = useMemo(() => {
    if (!current || !proposed || current.id === proposed.id) return null;
    return comparePolicies(current, proposed, profile ?? undefined);
  }, [current, proposed, profile]);

  const scenarios = useMemo(
    () => (current ? modelFundingScenarios(current.extraction) : []),
    [current],
  );

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
          <h1 className="font-display text-4xl text-pine">Policy comparison & scenarios</h1>
          <p className="text-stone mt-2 max-w-2xl">
            Deterministic side-by-side comparison with suitability questions,
            1035 warnings, and funding scenario projections. Recommendations
            remain subject to human approval.
          </p>
        </div>

        {docs.length < 1 ? (
          <p className="text-stone">
            No documents in the workspace. Upload documents or load a client from
            the <Link href="/clients" className="underline">roster</Link> /{" "}
            <Link href="/demo" className="underline">demo</Link>.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4 animate-rise-delay">
              <Selector
                label="Current policy"
                docs={docs}
                value={current?.id ?? ""}
                onChange={setCurrentId}
              />
              <Selector
                label="Proposed policy"
                docs={docs}
                value={proposed?.id ?? ""}
                onChange={setProposedId}
              />
            </div>

            {docs.length < 2 && (
              <p className="text-sm text-stone">
                Add a second document (e.g. a carrier quote) to compare against the
                current policy.
              </p>
            )}

            {report && (
              <section className="pw-panel p-6 animate-rise-delay space-y-5">
                <h2 className="font-display text-2xl text-pine">
                  {report.currentName} <span className="text-stone">vs</span>{" "}
                  {report.proposedName}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-stone border-b border-pine/10">
                        <th className="py-2 pr-4 font-normal">Attribute</th>
                        <th className="py-2 pr-4 font-normal">Current</th>
                        <th className="py-2 pr-4 font-normal">Proposed</th>
                        <th className="py-2 font-normal">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.rows.map((r) => (
                        <tr key={r.label} className="border-b border-pine/5 align-top">
                          <td className="py-2 pr-4 text-stone">{r.label}</td>
                          <td className="py-2 pr-4 text-ink">{r.current}</td>
                          <td className="py-2 pr-4 text-ink">{r.proposed}</td>
                          <td className="py-2 text-xs text-danger">{r.note ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-ink leading-relaxed">
                  {report.suitabilitySummary}
                </p>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <h3 className="font-display text-lg text-pine mb-2">
                      Questions requiring clarification
                    </h3>
                    <ul className="space-y-1 text-sm text-stone list-disc pl-5">
                      {report.questions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-pine mb-2">Warnings</h3>
                    <ul className="space-y-1 text-sm text-danger list-disc pl-5">
                      {report.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="text-[11px] text-stone">
                  Assumptions: {report.assumptions.join(" · ")}
                </p>
              </section>
            )}

            {current && scenarios.length > 0 && (
              <section className="pw-panel p-6 animate-rise-delay-2 space-y-4">
                <h2 className="font-display text-2xl text-pine">
                  Funding scenarios — {current.filename}
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {scenarios.map((s) => (
                    <div key={s.name} className="rounded-2xl bg-white/60 border border-pine/10 p-4">
                      <div className="text-sm font-medium text-ink">{s.name}</div>
                      <div className="text-xs text-stone mb-2">
                        ${s.annualPremium.toLocaleString()}/yr
                      </div>
                      {s.lapseYear ? (
                        <div className="text-sm text-danger">
                          Projected lapse in year {s.lapseYear}
                        </div>
                      ) : (
                        <div className="text-sm text-ok">
                          No lapse in {s.years.length} yrs · ends ~$
                          {s.endingCashValue.toLocaleString()}
                        </div>
                      )}
                      <MiniChart years={s.years.map((y) => y.cashValue)} />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-stone">
                  {scenarios[0].assumptions.join(" · ")}
                </p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Selector({
  label,
  docs,
  value,
  onChange,
}: {
  label: string;
  docs: { id: string; filename: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="text-sm text-stone">
      {label}
      <select
        className="pw-input mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {docs.map((d) => (
          <option key={d.id} value={d.id}>
            {d.filename}
          </option>
        ))}
      </select>
    </label>
  );
}

function MiniChart({ years }: { years: number[] }) {
  if (!years.length) return null;
  const max = Math.max(...years.map((v) => Math.abs(v)), 1);
  const w = 220;
  const h = 56;
  const points = years
    .map((v, i) => {
      const x = (i / Math.max(years.length - 1, 1)) * w;
      const y = h - (Math.max(v, 0) / max) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full" role="img" aria-label="Cash value projection">
      <polyline
        points={points}
        fill="none"
        stroke="var(--moss)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
