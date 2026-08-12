import Link from "next/link";

const ROLES = [
  {
    id: "ope",
    title: "Meet Ope",
    blurb: "Live conversational guide on every page",
    href: "/#meet-ope",
    visual: "ope" as const,
  },
  {
    id: "agent",
    title: "Intelligence agent",
    blurb: "Tool-grounded policy analysis & recommendations",
    href: "/agent/",
    visual: "agent" as const,
  },
  {
    id: "insights",
    title: "Book intelligence",
    blurb: "Ingest books · surface renewal opportunities",
    href: "/#intelligent-insights",
    visual: "insights" as const,
  },
  {
    id: "library",
    title: "Coverage library",
    blurb: "Industry benchmarks & requirement towers",
    href: "/platform/coverage-library/",
    visual: "library" as const,
  },
] as const;

export function HomeIntelligenceTeam() {
  return (
    <section className="pw-wc-team" aria-labelledby="pw-wc-team-heading">
      <div className="pw-shell pw-shell-wide">
        <div className="pw-wc-team-intro">
          <h2 id="pw-wc-team-heading" className="pw-wc-section-title">
            Your Insurance Intelligence Team
          </h2>
          <p className="pw-wc-section-lede">
            Partner with AI agents and coverage intelligence built for agencies,
            carriers, advisors, and commercial books — specialized to the work
            you already do.
          </p>
        </div>
        <ul className="pw-wc-team-grid">
          {ROLES.map((role) => (
            <li key={role.id}>
              <Link href={role.href} className="pw-wc-team-card">
                <div className={`pw-wc-team-visual pw-wc-team-visual-${role.visual}`}>
                  {role.visual === "ope" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/ope-mascot.png"
                      alt=""
                      width={160}
                      height={160}
                      className="pw-wc-team-ope"
                      decoding="async"
                    />
                  ) : (
                    <span className="pw-wc-team-glyph" aria-hidden />
                  )}
                </div>
                <div className="pw-wc-team-label">
                  <span className="pw-wc-team-title">{role.title}</span>
                  <span className="pw-wc-team-blurb">{role.blurb}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
