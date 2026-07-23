import Link from "next/link";
import { DocsIcon } from "@/components/docs/DocsIcon";
import type { DocsUseCase } from "@/lib/docs-data";

/** Mintlify/Natural-style card: icon on top, title, short description. */
export function UseCaseCard({ useCase }: { useCase: DocsUseCase }) {
  return (
    <Link href={`/docs/guides/${useCase.slug}`} className="pw-docs-card">
      <div className="pw-docs-card-icon" aria-hidden>
        <DocsIcon name={useCase.icon} className="h-[18px] w-[18px]" />
      </div>
      <h3 className="pw-docs-card-title">{useCase.title}</h3>
      <p className="pw-docs-card-summary">{useCase.summary}</p>
    </Link>
  );
}

export function StatusBadge({ status }: { status: DocsUseCase["status"] }) {
  return (
    <span className={`pw-docs-status pw-docs-status-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}
