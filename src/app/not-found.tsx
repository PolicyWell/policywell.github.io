import Link from "next/link";
import { PolicyWell404Scene } from "@/components/PolicyWell404Scene";
import { BrandMark } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="pw-404">
      <PolicyWell404Scene />

      <div className="pw-404-ui">
        <header className="pw-404-nav">
          <BrandMark />
          <Link href="/" className="pw-404-nav-link">
            Home
          </Link>
        </header>

        <main className="pw-404-main">
          <p className="pw-404-eyebrow">Error 404</p>
          <h1 className="pw-404-title">This policy fell into the well.</h1>
          <p className="pw-404-copy">
            The page you requested could not be verified. Let’s get you back to
            covered ground.
          </p>
          <div className="pw-404-actions">
            <Link href="/" className="pw-btn">
              Back to home
            </Link>
            <Link href="/demo" className="pw-btn pw-btn-secondary">
              Product demo
            </Link>
            <Link href="/agent" className="pw-btn pw-btn-secondary">
              Talk to the agent
            </Link>
          </div>
          <p className="pw-404-hint">
            Move to explore · press and hold to glow
          </p>
        </main>
      </div>
    </div>
  );
}
