import Link from "next/link";

export function CoverageConditionBuilder() {
  return (
    <aside
      className="pw-cl-condition"
      aria-label="Condition builder preview"
    >
      <div className="pw-cl-condition-head">
        <div>
          <p className="pw-cl-condition-kicker">Condition builder</p>
          <p className="pw-cl-condition-sub">
            Custom requirements described in plain language.
          </p>
        </div>
        <div className="pw-cl-condition-tabs" aria-hidden>
          <span className="is-on">Basic</span>
          <span>Pathways</span>
          <span>Branch</span>
        </div>
      </div>

      <div className="pw-cl-condition-window">
        <header>
          <strong>Basic condition builder</strong>
          <div className="pw-cl-condition-pills" aria-hidden>
            <em className="is-on">Basic</em>
            <em>Pathways</em>
            <em>Branch</em>
          </div>
        </header>
        <p className="pw-cl-condition-hint">
          Complete your condition to view a preview
        </p>
        <div className="pw-cl-condition-step">
          <span>1</span>
          <div>
            <strong>Target value</strong>
            <p>Define the value that should be satisfied by policy documents</p>
          </div>
        </div>
        <div className="pw-cl-condition-select" aria-hidden>
          Select an item
          <b>▾</b>
        </div>
        <div className="pw-cl-condition-tools" aria-hidden>
          <i />
          <i />
        </div>
      </div>

      <div className="pw-cl-hero-actions">
        <Link href="/demo/" className="pw-btn">
          Request demo access
        </Link>
        <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
          Book a call
        </Link>
      </div>
    </aside>
  );
}
