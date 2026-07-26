import type { Metadata } from "next";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Get a Quote",
  description:
    "Request a PolicyWell coverage quote. A licensed advisor reviews every request.",
  path: "/quote",
});

export default function QuotePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Get a Quote", path: "/quote" },
        ])}
      />
      <SiteNav />
      <main className="pw-shell py-8 md:py-12 min-w-0 w-full">
        <section id="contact" className="pw-quote-page">
          <QuoteRequestForm />
        </section>
      </main>
    </div>
  );
}
