import type { Metadata } from "next";
import { Pear2CLI } from "@/components/pear2/Pear2CLI";
import { SiteNav } from "@/components/ui";
import { marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Pear 2 | Intelligent Insights | PolicyWell",
  description:
    "PolicyWell Pear 2 — commercial book intelligence combining ingest and opportunities in one CLI interface.",
  path: "/pear2",
  absoluteTitle: true,
});

export default function Pear2Page() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <SiteNav />
      <main className="pw-pear2-page">
        <div className="pw-shell pw-shell-wide">
          <Pear2CLI />
        </div>
      </main>
    </div>
  );
}
