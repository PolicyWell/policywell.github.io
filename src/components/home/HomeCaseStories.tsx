import Link from "next/link";

const STORIES = [
  {
    title: "Harbor Fab commercial renewals",
    line: "PolicyWell surfaces at-risk renewals and peril heatmaps for fabrication books.",
    href: "/#reports",
    tag: "Reports",
  },
  {
    title: "Book-of-business opportunities",
    line: "Ingest HOA, trucking, and commercial books — then list gold-path vs lapse risk.",
    href: "/#intelligent-insights",
    tag: "Intelligent Insights",
  },
  {
    title: "Coverage Library benchmarks",
    line: "Industry towers and requirements so proposals cite a real market standard.",
    href: "/platform/coverage-library/",
    tag: "Coverage Library",
  },
  {
    title: "Meet Ope on every page",
    line: "A conversational guide that captures who you are and walks coverage questions live.",
    href: "/#meet-ope",
    tag: "Meet Ope",
  },
] as const;

export function HomeCaseStories() {
  return (
    <section className="pw-wc-stories" aria-labelledby="pw-wc-stories-heading">
      <div className="pw-shell pw-shell-wide">
        <div className="pw-wc-stories-head">
          <h2 id="pw-wc-stories-heading" className="pw-wc-section-title">
            Why Teams Trust PolicyWell
          </h2>
          <Link href="/demo/" className="pw-wc-btn-outline">
            See the product
          </Link>
        </div>
        <ul className="pw-wc-stories-track">
          {STORIES.map((s) => (
            <li key={s.title}>
              <Link href={s.href} className="pw-wc-story-card">
                <span className="pw-wc-story-tag">{s.tag}</span>
                <h3 className="pw-wc-story-title">{s.title}</h3>
                <p className="pw-wc-story-line">{s.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
