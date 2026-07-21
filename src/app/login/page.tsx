"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/ui";
import { authenticateDemo } from "@/lib/seed";
import { clearWorkspaceData } from "@/lib/storage";
import { clearOnboardingBoot, persistSession } from "@/lib/use-workspace";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alex@example.com");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = authenticateDemo(email);
    if (!user) {
      setError("Unknown demo user. Try alex@example.com, jordan@advisors.example, or morgan@carrier.example");
      return;
    }
    persistSession(user);
    const destination =
      user.role === "imo"
        ? "/imo"
        : user.role === "advisor"
          ? "/clients"
          : user.role === "carrier"
            ? "/carrier"
            : "/agent";
    router.push(destination);
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="pw-shell py-8">
        <BrandMark />
      </div>
      <main className="pw-shell flex-1 flex items-center pb-16">
        <div className="w-full max-w-md animate-rise">
          <h1 className="font-display text-4xl text-pine mb-3">Sign in</h1>
          <p className="text-stone mb-8">
            Same intelligence engine. Different permissions unlock different capabilities.
          </p>
          <form onSubmit={onSubmit} className="pw-panel p-6 space-y-4 shadow-[var(--shadow-soft)]">
            <label className="block text-sm text-stone">
              Email
              <input
                className="pw-input mt-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
              />
            </label>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button type="submit" className="pw-btn w-full">
              Continue
            </button>
          </form>
          <div className="mt-6 text-sm text-stone space-y-2">
            <p>Demo accounts:</p>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  className="underline hover:text-pine"
                  onClick={() => setEmail("alex@example.com")}
                >
                  alex@example.com
                </button>{" "}
                — policyholder
              </li>
              <li>
                <button
                  type="button"
                  className="underline hover:text-pine"
                  onClick={() => setEmail("jordan@advisors.example")}
                >
                  jordan@advisors.example
                </button>{" "}
                — advisor
              </li>
              <li>
                <button
                  type="button"
                  className="underline hover:text-pine"
                  onClick={() => setEmail("morgan@carrier.example")}
                >
                  morgan@carrier.example
                </button>{" "}
                — carrier
              </li>
              <li>
                <button
                  type="button"
                  className="underline hover:text-pine"
                  onClick={() => setEmail("casey@imo.example")}
                >
                  casey@imo.example
                </button>{" "}
                — IMO
              </li>
            </ul>
            <button
              type="button"
              className="mt-4 text-xs uppercase tracking-wider text-moss"
              onClick={() => {
                clearWorkspaceData();
                clearOnboardingBoot();
                setError("");
              }}
            >
              Clear local workspace data
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
