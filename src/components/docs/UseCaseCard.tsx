import Link from "next/link";
import { DocsIcon } from "@/components/docs/DocsIcon";
import type { DocsUseCase } from "@/lib/docs-data";

export function UseCaseCard({ useCase }: { useCase: DocsUseCase }) {
  return (
    <Link
      href={`/docs/guides/${useCase.slug}`}
      className="pw-docs-card"
    >
      <div className="pw-docs-card-icon" aria-hidden>
        <DocsIcon name={useCase.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="pw-docs-card-title">{useCase.title}</h3>
          <span className={`pw-docs-status pw-docs-status-${useCase.status.toLowerCase()}`}>
            {useCase.status}
          </span>
        </div>
        <p className="pw-docs-card-summary">{useCase.summary}</p>
      </div>
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
