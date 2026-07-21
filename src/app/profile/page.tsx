"use client";

import Link from "next/link";
import { AppNav, ConfidenceBadge, MissingList } from "@/components/ui";
import { useProfile, useSession } from "@/lib/use-workspace";

export default function ProfilePage() {
  const session = useSession();
  const profile = useProfile();

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please <Link href="/login" className="underline">sign in</Link>.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col">
        <AppNav role={session.role} />
        <main className="pw-shell py-16">
          <h1 className="font-display text-4xl text-pine mb-3">Household profile</h1>
          <p className="text-stone mb-6">No saved profile yet.</p>
          <Link href="/onboarding" className="pw-btn">
            Start conversational onboarding
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 space-y-8">
        <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-pine">{profile.displayName}</h1>
            <p className="text-stone mt-1">
              {profile.role} · {profile.email}
            </p>
          </div>
          <ConfidenceBadge value={profile.overallConfidence} />
        </div>

        <MissingList fields={profile.missingFields} />

        <div className="grid md:grid-cols-2 gap-5">
          <Section title="Household">
            <Item label="Marital status" value={profile.household.maritalStatus.value} />
            <Item label="Dependents" value={profile.household.dependentsCount.value} />
            <Item label="State" value={profile.household.state.value} />
            <Item label="Business owner" value={yn(profile.household.ownsBusiness.value)} />
            <Item
              label="Mortgage"
              value={
                profile.household.hasMortgage.value
                  ? `$${Number(profile.household.mortgageBalance.value ?? 0).toLocaleString()}`
                  : yn(profile.household.hasMortgage.value)
              }
            />
            <ul className="mt-3 space-y-1 text-sm text-stone">
              {profile.household.members.map((m) => (
                <li key={m.id}>
                  {m.name} · {m.relationship}
                  {m.age != null ? ` · ${m.age}` : ""}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Financial">
            <Item
              label="Annual income"
              value={
                profile.financial.annualIncome.value != null
                  ? `$${profile.financial.annualIncome.value.toLocaleString()}`
                  : null
              }
            />
          </Section>

          <Section title="Insurance">
            <Item label="Policy count" value={profile.insurance.policyCount.value} />
            <Item label="Lapse concern" value={yn(profile.insurance.worriedAboutLapse.value)} />
            {profile.insurance.policies.map((p) => (
              <div key={p.id} className="mt-3 text-sm border-t border-pine/10 pt-3">
                <div className="text-ink font-medium">
                  {p.carrier.value} · {p.productType.value}
                </div>
                <div className="text-stone">
                  Face ${Number(p.faceAmount.value ?? 0).toLocaleString()} · Cash $
                  {Number(p.cashValue.value ?? 0).toLocaleString()}
                </div>
              </div>
            ))}
          </Section>

          <Section title="Goals & retirement">
            <Item label="Retirement" value={yn(profile.goals.retirementPlanning.value)} />
            <Item label="Prevent lapse" value={yn(profile.goals.preventLapse.value)} />
            <Item label="Cash value" value={yn(profile.goals.maximizeCashValue.value)} />
            <Item label="Estate" value={yn(profile.goals.estatePlanning.value)} />
            <Item label="Current age" value={profile.retirement.currentAge.value} />
            <Item label="Target retirement age" value={profile.retirement.targetRetirementAge.value} />
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pw-panel p-5 animate-rise">
      <h2 className="font-display text-2xl text-pine mb-4">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Item({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-stone">{label}</span>
      <span className="text-ink text-right">{value ?? "—"}</span>
    </div>
  );
}

function yn(v: boolean | null | undefined) {
  if (v == null) return null;
  return v ? "Yes" : "No";
}
