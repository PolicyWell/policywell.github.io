"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { persistSession } from "@/lib/use-workspace";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    persistSession(null);
    router.push("/login/");
    router.refresh();
  }

  return (
    <button
      type="button"
      className={className || "text-sm text-stone hover:text-pine underline"}
      onClick={() => void onLogout()}
      disabled={pending}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
