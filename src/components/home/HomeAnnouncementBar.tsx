import Link from "next/link";

/** Slim top strip — mirrors WithCoverage announcement format with PolicyWell product news. */
export function HomeAnnouncementBar() {
  return (
    <div className="pw-wc-announce">
      <Link href="/#meet-ope" className="pw-wc-announce-link">
        Meet Ope — PolicyWell&apos;s live insurance guide is now on every page
        <span aria-hidden="true"> →</span>
      </Link>
    </div>
  );
}
