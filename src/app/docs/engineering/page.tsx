import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { markdownToHtml } from "@/lib/markdown";

export const metadata = {
  title: "Engineering",
  description: "PolicyWell architecture and engineering reference.",
};

export default async function EngineeringDocsPage() {
  const mdPath = path.join(process.cwd(), "docs", "ENGINEERING_MANUAL.md");
  const md = await readFile(mdPath, "utf8");
  const html = markdownToHtml(md);

  return (
    <article className="pw-docs-article">
      <header className="pw-docs-article-header">
        <p className="pw-docs-eyebrow">
          <Link href="/docs" className="pw-docs-inline-link">
            Platform
          </Link>
        </p>
        <h1>Engineering</h1>
        <p className="pw-docs-lede">
          Architecture and implementation reference for the PolicyWell
          intelligence platform.
        </p>
      </header>
      <div
        className="pw-docs markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
