import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { SiteNav } from "@/components/ui";
import { markdownToHtml } from "@/lib/markdown";

export const metadata = {
  title: "Engineering manual — PolicyWell Docs",
  description: "PolicyWell engineering manual and sprint status.",
};

export default async function EngineeringDocsPage() {
  const mdPath = path.join(process.cwd(), "docs", "ENGINEERING_MANUAL.md");
  const md = await readFile(mdPath, "utf8");
  const html = markdownToHtml(md);

  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="pw-shell py-10 md:py-14">
        <div className="mb-8 animate-rise flex flex-wrap items-center gap-3 text-sm text-stone">
          <Link href="/docs" className="hover:text-pine transition-colors">
            Docs
          </Link>
          <span aria-hidden>/</span>
          <span className="text-pine">Engineering manual</span>
        </div>
        <article
          className="pw-docs animate-rise-delay max-w-3xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}
