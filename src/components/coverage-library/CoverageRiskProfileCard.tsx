import Link from "next/link";
import type { CoverageProfile } from "@/lib/coverage-library";

export function CoverageRiskProfileCard({
  profile,
}: {
  profile: CoverageProfile;
}) {
  return (
    <aside
      className="pw-cl-risk-card"
      aria-label={`${profile.name} risk profile`}
    >
      <header className="pw-cl-risk-card-chrome">
        <span className="pw-cl-window-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <p>Risk profile</p>
      </header>

      <div className="pw-cl-risk-card-body">
        <div className="pw-cl-risk-card-title-row">
          <span className="pw-cl-risk-card-mark" aria-hidden>
            PW
          </span>
          <strong>
            {profile.industry} · {profile.name}
          </strong>
        </div>

        <div className="pw-cl-risk-card-block">
          <p className="pw-cl-risk-card-label">From</p>
          <p className="pw-cl-risk-card-from">PolicyWell Coverage Library</p>
        </div>

        <div className="pw-cl-risk-card-block">
          <p className="pw-cl-risk-card-label">About</p>
          <p className="pw-cl-risk-card-about">
            {profile.summary.length > 160
              ? `${profile.summary.slice(0, 157).trim()}…`
              : profile.summary}
          </p>
        </div>

        <div className="pw-cl-risk-card-block">
          <div className="pw-cl-risk-card-protection-head">
            <p className="pw-cl-risk-card-label">Protection</p>
            <strong>{profile.completionScore}%</strong>
          </div>
          <div className="pw-cl-risk-card-bar" aria-hidden>
            <span
              style={{
                width: `${Math.max(8, Math.min(100, profile.completionScore))}%`,
              }}
            />
          </div>
        </div>

        <div className="pw-cl-risk-card-block">
          <p className="pw-cl-risk-card-label">Assets</p>
          <ul className="pw-cl-risk-card-assets">
            {profile.assetTypes.slice(0, 4).map((asset) => (
              <li key={asset}>{asset}</li>
            ))}
          </ul>
        </div>

        <Link
          href={`/platform/coverage-library/${profile.slug}/`}
          className="pw-cl-risk-card-cta"
        >
          Use risk profile
        </Link>
        <p className="pw-cl-risk-card-footnote">
          <Link href="/demo/">Request access</Link> to apply this profile in a
          live gap assessment.
        </p>
      </div>
    </aside>
  );
}
