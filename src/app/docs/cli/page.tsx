import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { SiteNav } from "@/components/ui";
import { markdownToHtml } from "@/lib/markdown";

export const metadata = {
  title: "CLI reference",
  description:
    "PolicyWell CLI for carriers, IMOs, enterprise technology teams, and batch workflows.",
};

export default async function CliDocsPage() {
  const mdPath = path.join(process.cwd(), "docs", "CLI_DESIGN.md");
  let md = await readFile(mdPath, "utf8");
  // Strip internal sprint / candidate framing from the public render.
  md = md
    .replace(/\*\*Status:\*\*[^\n]*/i, "**Status:** Preview")
    .replace(/Sprint\s+\d+[^\n.]*/gi, "CLI preview")
    .replace(/Gemini\/OpenAI/gi, "optional LLM phrasing")
    .replace(/no production deploy[^\n]*/gi, "enterprise rollout guidance")
    .replace(/not a freestyle chatbot/gi, "a structured automation interface");
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
          <span className="text-pine">CLI reference</span>
          <span className="text-[10px] uppercase tracking-wider text-moss border border-moss/25 rounded-full px-2 py-0.5">
            Preview
          </span>
        </div>
        <p className="mb-6 max-w-3xl text-stone text-sm leading-relaxed">
          Intended for carriers, IMOs, enterprise technology teams, developers,
          and batch workflows. Features marked as design examples may still be
          rolling out.
        </p>
        <article
          className="pw-docs animate-rise-delay max-w-3xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}
