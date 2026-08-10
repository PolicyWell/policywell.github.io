import Link from "next/link";

export function CoverageLibraryCta({
  title = "Benchmark-driven advice. Here now.",
  body = "Upload a commercial policy and run a gap assessment against a PolicyWell coverage profile — decision support with human review gates.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="pw-cl-cta" aria-label="Get started">
      <div className="pw-cl-cta-inner">
        <h2 className="pw-cl-cta-title">{title}</h2>
        <p className="pw-cl-cta-copy">{body}</p>
        <div className="pw-cl-hero-actions">
          <Link href="/demo/" className="pw-btn">
            Request demo access
          </Link>
          <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
            Book a call
          </Link>
        </div>
      </div>
    </section>
  );
}
