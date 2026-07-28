import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo";

type SiteBreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/**
 * Visible breadcrumb trail. Pair with breadcrumbJsonLd() for structured data.
 * First item is typically Home (`/`).
 */
export function SiteBreadcrumbs({
  items,
  className = "",
}: SiteBreadcrumbsProps) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={`pw-breadcrumbs ${className}`.trim()}
    >
      <ol className="pw-breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const href =
            item.path === "/"
              ? "/"
              : item.path.endsWith("/")
                ? item.path
                : `${item.path}/`;
          return (
            <li key={`${item.path}-${item.name}`} className="pw-breadcrumbs-item">
              {index > 0 ? (
                <span className="pw-breadcrumbs-sep" aria-hidden>
                  /
                </span>
              ) : null}
              {isLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={href}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
