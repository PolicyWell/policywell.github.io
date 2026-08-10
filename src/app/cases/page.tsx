import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BrandMark } from "@/components/ui";

export default function CasesPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-pine/10 bg-foam/70 backdrop-blur-md sticky top-0 z-20">
        <div className="pw-shell flex items-center justify-between gap-3 py-4">
          <BrandMark />
          <div className="flex items-center gap-4">
            <Link href="/app/" className="text-sm text-stone hover:text-pine">
              App
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="pw-shell py-10 space-y-3">
        <h1 className="font-display text-4xl text-pine">Cases</h1>
        <p className="text-stone max-w-xl">
          Insurance cases for your account will appear here. Access is limited to
          cases you own or are assigned to produce.
        </p>
      </main>
    </div>
  );
}
