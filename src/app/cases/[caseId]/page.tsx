import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BrandMark } from "@/components/ui";

/** Placeholder so static export can emit the protected detail shell. */
export function generateStaticParams() {
  return [{ caseId: "_" }];
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-pine/10 bg-foam/70 backdrop-blur-md sticky top-0 z-20">
        <div className="pw-shell flex items-center justify-between gap-3 py-4">
          <BrandMark />
          <div className="flex items-center gap-4">
            <Link href="/cases/" className="text-sm text-stone hover:text-pine">
              All cases
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="pw-shell py-10 space-y-3">
        <h1 className="font-display text-4xl text-pine">Case</h1>
        <p className="text-stone font-mono text-sm break-all">{caseId}</p>
        <p className="text-stone max-w-xl">
          Case detail wiring comes next. RLS already scopes rows to authorized
          users.
        </p>
      </main>
    </div>
  );
}
