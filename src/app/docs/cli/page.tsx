import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { markdownToHtml } from "@/lib/markdown";
import { sanitizePublicDocsMarkdown } from "@/lib/sanitize-public-docs";

export const metadata = {
  title: "CLI",
  description:
    "Compliance-first PolicyWell CLI (pw) for producers, IMOs, carriers, and clients.",
};

export default async function CliDocsPage() {
  const mdPath = path.join(process.cwd(), "docs", "CLI_DESIGN.md");
  const md = sanitizePublicDocsMarkdown(await readFile(mdPath, "utf8"));
  const html = markdownToHtml(md);

  return (
    <article className="pw-docs-article">
      <header className="pw-docs-article-header">
        <div className="pw-docs-title-row">
          <h1>CLI</h1>
          <span className="pw-docs-status pw-docs-status-preview">Preview</span>
        </div>
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
