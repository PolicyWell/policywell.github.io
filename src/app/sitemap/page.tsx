import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import { getHtmlSitemapGroups } from "@/lib/html-sitemap";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Sitemap", path: "/sitemap" },
] as const;

export const metadata: Metadata = marketingMetadata({
  title: "Sitemap | PolicyWell",
  description:
    "Explore every PolicyWell page — product, industries, coverage library, and company — in one directory.",
  path: "/sitemap",
  absoluteTitle: true,
});

export default function HtmlSitemapPage() {
  const groups = getHtmlSitemapGroups();

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...CRUMBS])} />
      <SiteNav />
      <main className="pw-sitemap">
        <div className="pw-shell">
          <SiteBreadcrumbs items={[...CRUMBS]} />
          <header className="pw-sitemap-header">
            <h1 className="pw-sitemap-title">Sitemap</h1>
          </header>
          <nav aria-label="Sitemap">
            <div className="pw-sitemap-grid">
              {groups.map((group) => (
                <section key={group.title} className="pw-sitemap-group">
                  <h2 className="pw-sitemap-group-title">{group.title}</h2>
                  <ul className="pw-sitemap-list">
                    {group.links.map((item) => (
                      <li key={`${group.title}-${item.href}`}>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </nav>
        </div>
      </main>
    </div>
  );
}
