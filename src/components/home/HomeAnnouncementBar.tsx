import Link from "next/link";

/** Slim top strip — mirrors WithCoverage announcement format with PolicyWell product news. */
export function HomeAnnouncementBar() {
  return (
    <div className="pw-wc-announce">
      <Link
        href="/platform/coverage-library/"
        className="pw-wc-announce-link"
      >
        View our newest industry coverage library and the global insurance
        benchmarks — live data injected into our engine
        <span aria-hidden="true"> →</span>
      </Link>
    </div>
  );
}
