import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BrandMark } from "@/components/ui";

/** Placeholder so static export can emit the protected detail shell. */
export function generateStaticParams() {
  return [{ policyId: "_" }];
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const { policyId } = await params;
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-pine/10 bg-foam/70 backdrop-blur-md sticky top-0 z-20">
        <div className="pw-shell flex items-center justify-between gap-3 py-4">
          <BrandMark />
          <div className="flex items-center gap-4">
            <Link
              href="/policies/"
              className="text-sm text-stone hover:text-pine"
            >
              All policies
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="pw-shell py-10 space-y-3">
        <h1 className="font-display text-4xl text-pine">Policy</h1>
        <p className="text-stone font-mono text-sm break-all">{policyId}</p>
        <p className="text-stone max-w-xl">
          Policy detail wiring comes next. Access follows case authorization via
          RLS.
        </p>
      </main>
    </div>
  );
}
