"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/ui";
import { DEMO_USERS, buildDemoSeed } from "@/lib/seed";
import {
  clearWorkspaceData,
  saveDocuments,
  saveOnboardingRaw,
  saveProfile,
  saveSession,
} from "@/lib/storage";
import { createOnboardingState } from "@/lib/onboarding";
import { clearOnboardingBoot, notifyStore } from "@/lib/use-workspace";

const STEPS = [
  "Sign in as Alex (policyholder)",
  "Seed Mutual of Omaha IUL household + verified document",
  "Review conversational profile context",
  "Open agent workspace — scores, grounded Q&A, timeline",
  "Generate advisor/client report + capture feedback",
];

export default function DemoPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  function loadDemo() {
    clearWorkspaceData();
    clearOnboardingBoot();
    const user = DEMO_USERS[0];
    const { profile, documents } = buildDemoSeed(user);
    saveSession(user);
    saveProfile(profile);
    saveDocuments(documents);
    const onboarding = createOnboardingState(user.id, user.role, user.name, user.email);
    onboarding.profile = profile;
    onboarding.complete = true;
    onboarding.messages.push({
      id: "msg_demo",
      role: "assistant",
      content:
        "Demo seed loaded: married, three kids, TX mortgage, Mutual of Omaha IUL, retirement + lapse concern. Profile saved and document verified.",
      at: new Date().toISOString(),
    });
    saveOnboardingRaw(JSON.stringify(onboarding));
    notifyStore();
    setReady(true);
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="pw-shell py-8 flex items-center justify-between">
        <BrandMark />
        <Link href="/login" className="text-sm text-stone hover:text-pine">
          Sign in
        </Link>
      </div>
      <main className="pw-shell pb-16 max-w-3xl">
        <h1 className="font-display text-5xl text-pine animate-rise">Investor demo flow</h1>
        <p className="text-stone mt-4 animate-rise-delay leading-relaxed">
          End-to-end Sprint 1 walkthrough: context → onboarding → ingestion → scoring → reasoning →
          recommendations → human approval → feedback. No production deployment. Sample Mutual of Omaha IUL data included.
        </p>

        <ol className="mt-10 space-y-3 animate-rise-delay">
          {STEPS.map((step, i) => (
            <li key={step} className="pw-panel px-4 py-3 flex gap-3 items-start">
              <span className="font-display text-xl text-moss w-8">{i + 1}</span>
              <span className="text-ink pt-1">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3 animate-rise-delay-2">
          <button type="button" className="pw-btn" onClick={loadDemo}>
            Seed sample data
          </button>
          {ready && (
            <>
              <button
                type="button"
                className="pw-btn pw-btn-secondary"
                onClick={() => router.push("/workspace")}
              >
                Open workspace
              </button>
              <button
                type="button"
                className="pw-btn pw-btn-secondary"
                onClick={() => router.push("/report")}
              >
                Open report
              </button>
              <button
                type="button"
                className="pw-btn pw-btn-secondary"
                onClick={() => router.push("/profile")}
              >
                View profile
              </button>
            </>
          )}
        </div>

        {ready && (
          <p className="mt-4 text-sm text-ok animate-rise">
            Seed loaded for alex@example.com — Mutual of Omaha IUL in-force PDF verified.
          </p>
        )}
      </main>
    </div>
  );
}
