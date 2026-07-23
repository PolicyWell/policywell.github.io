"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppNav, ConfidenceBadge, MissingList } from "@/components/ui";
import {
  applyProfileEdits,
  processOnboardingTurn,
} from "@/lib/onboarding";
import {
  persistProfile,
  useOnboardingState,
  useSession,
} from "@/lib/use-workspace";

export default function OnboardingPage() {
  const session = useSession();
  const [state, setState] = useOnboardingState(session);
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const profile = state?.profile;

  const suggestions = useMemo(
    () => [
      "I'm married and have three kids.",
      "I live in TX and I have a mortgage.",
      "I own a business and make about $180k a year.",
      "I'm 42 and planning for retirement.",
      "I have an indexed universal life policy.",
      "I'm worried about my policy lapsing.",
    ],
    [],
  );

  function send(text: string) {
    if (!state || !text.trim()) return;
    setState(processOnboardingTurn(state, text.trim()));
    setInput("");
    setSaved(false);
  }

  function save() {
    if (!state) return;
    const complete = {
      ...state.profile,
      onboardingComplete: true,
    };
    persistProfile(complete);
    setState({ ...state, profile: complete, complete: true });
    setSaved(true);
  }

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">Please <Link href="/login" className="underline">sign in</Link> to begin onboarding.</p>
      </div>
    );
  }

  if (!state || !profile) {
    return <div className="pw-shell py-20 text-stone">Loading interview…</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <section className="animate-rise">
          <h1 className="font-display text-4xl text-pine mb-2">Conversational onboarding</h1>
          <p className="text-stone mb-6 max-w-xl">
            Not a form — an interview. Say things like “I have three kids” and PolicyWell structures your household, goals, and insurance context.
          </p>

          <div className="pw-panel p-4 md:p-6 min-h-[420px] flex flex-col shadow-[var(--shadow-soft)]">
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[52vh] pr-1">
              {state.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-pine text-foam"
                      : "ml-auto bg-white/80 text-ink border border-pine/10"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                className="pw-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me about your household, policies, or goals…"
              />
              <button type="submit" className="pw-btn shrink-0">
                Send
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-pine/15 text-stone hover:text-pine hover:border-pine/30 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="animate-rise-delay space-y-4">
          <div className="pw-panel p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-2xl text-pine">Extracted profile</h2>
              <ConfidenceBadge value={profile.overallConfidence} />
            </div>
            <MissingList fields={profile.missingFields} />

            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Marital status" value={profile.household.maritalStatus.value} conf={profile.household.maritalStatus.confidence} />
              <Row label="Dependents" value={profile.household.dependentsCount.value} conf={profile.household.dependentsCount.confidence} />
              <Row label="State" value={profile.household.state.value} conf={profile.household.state.confidence} />
              <Row label="Mortgage" value={profile.household.hasMortgage.value == null ? null : profile.household.hasMortgage.value ? `Yes${profile.household.mortgageBalance.value != null ? ` · $${profile.household.mortgageBalance.value.toLocaleString()}` : ""}` : "No"} conf={profile.household.hasMortgage.confidence} />
              <Row label="Income" value={profile.financial.annualIncome.value != null ? `$${profile.financial.annualIncome.value.toLocaleString()}` : null} conf={profile.financial.annualIncome.confidence} />
              <Row label="Age" value={profile.retirement.currentAge.value} conf={profile.retirement.currentAge.confidence} />
              <Row label="Policies" value={profile.insurance.policyCount.value} conf={profile.insurance.policyCount.confidence} />
              <Row label="Carrier" value={profile.carrier.primaryCarrier.value} conf={profile.carrier.primaryCarrier.confidence} />
              <Row
                label="Goals"
                value={[
                  profile.goals.retirementPlanning.value && "Retirement",
                  profile.goals.preventLapse.value && "Prevent lapse",
                  profile.goals.maximizeCashValue.value && "Cash value",
                  profile.goals.estatePlanning.value && "Estate",
                ]
                  .filter(Boolean)
                  .join(", ") || null}
                conf={Math.max(
                  profile.goals.retirementPlanning.confidence,
                  profile.goals.preventLapse.confidence,
                  profile.goals.maximizeCashValue.confidence,
                  0,
                )}
              />
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="pw-btn" onClick={save}>
                Save profile
              </button>
              <button
                type="button"
                className="pw-btn pw-btn-secondary"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Close editor" : "Edit extracted info"}
              </button>
            </div>
            {saved && (
              <p className="mt-3 text-sm text-ok">
                Profile saved. Continue to{" "}
                <Link href="/upload" className="underline">
                  document upload
                </Link>{" "}
                or{" "}
                <Link href="/workspace" className="underline">
                  workspace
                </Link>
                .
              </p>
            )}
          </div>

          {editing && (
            <div className="pw-panel p-5 space-y-3">
              <h3 className="font-display text-xl text-pine">Edit</h3>
              <EditField
                label="State"
                defaultValue={profile.household.state.value ?? ""}
                onCommit={(v) =>
                  setState({
                    ...state,
                    profile: applyProfileEdits(profile, { state: v || null }),
                  })
                }
              />
              <EditField
                label="Dependents"
                defaultValue={String(profile.household.dependentsCount.value ?? "")}
                onCommit={(v) =>
                  setState({
                    ...state,
                    profile: applyProfileEdits(profile, {
                      dependentsCount: v ? Number(v) : null,
                    }),
                  })
                }
              />
              <EditField
                label="Annual income"
                defaultValue={String(profile.financial.annualIncome.value ?? "")}
                onCommit={(v) =>
                  setState({
                    ...state,
                    profile: applyProfileEdits(profile, {
                      annualIncome: v ? Number(v) : null,
                    }),
                  })
                }
              />
              <EditField
                label="Current age"
                defaultValue={String(profile.retirement.currentAge.value ?? "")}
                onCommit={(v) =>
                  setState({
                    ...state,
                    profile: applyProfileEdits(profile, {
                      currentAge: v ? Number(v) : null,
                    }),
                  })
                }
              />
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function Row({
  label,
  value,
  conf,
}: {
  label: string;
  value: string | number | null | undefined;
  conf: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-pine/5 pb-2">
      <dt className="text-stone">{label}</dt>
      <dd className="text-right">
        <div className="text-ink">{value ?? "—"}</div>
        <div className="text-[11px] text-stone">{Math.round(conf * 100)}%</div>
      </dd>
    </div>
  );
}

function EditField({
  label,
  defaultValue,
  onCommit,
}: {
  label: string;
  defaultValue: string;
  onCommit: (v: string) => void;
}) {
  const [v, setV] = useState(defaultValue);
  return (
    <label className="block text-sm text-stone">
      {label}
      <div className="mt-1 flex gap-2">
        <input className="pw-input" value={v} onChange={(e) => setV(e.target.value)} />
        <button type="button" className="pw-btn pw-btn-secondary !py-2" onClick={() => onCommit(v)}>
          Apply
        </button>
      </div>
    </label>
  );
}
