import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BrandMark } from "@/components/ui";

export default function AppHomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-pine/10 bg-foam/70 backdrop-blur-md sticky top-0 z-20">
        <div className="pw-shell flex items-center justify-between gap-3 py-4">
          <BrandMark />
          <LogoutButton />
        </div>
      </header>
      <main className="pw-shell py-10 space-y-6">
        <div>
          <h1 className="font-display text-4xl text-pine">Your workspace</h1>
          <p className="text-stone mt-2 max-w-xl">
            You are signed in with Supabase Auth. Cases and policies stay private
            under row-level security.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/cases/" className="pw-btn">
            Cases
          </Link>
          <Link href="/policies/" className="pw-btn-secondary">
            Policies
          </Link>
        </div>
      </main>
    </div>
  );
}
