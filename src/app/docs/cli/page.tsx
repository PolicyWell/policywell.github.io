import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { markdownToHtml } from "@/lib/markdown";

export const metadata = {
  title: "CLI",
  description:
    "Compliance-first PolicyWell CLI (pw) for producers, IMOs, carriers, and clients.",
};

export default async function CliDocsPage() {
  const mdPath = path.join(process.cwd(), "docs", "CLI_DESIGN.md");
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
        <h1>CLI</h1>
        <p className="pw-docs-lede">
          Compliance-first PolicyWell CLI for producers, IMOs, carriers, and
          enterprise technology teams.
        </p>
      </header>
      <div
        className="pw-docs markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
