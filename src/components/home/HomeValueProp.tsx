import Link from "next/link";

export function HomeValueProp() {
  return (
    <section className="pw-wc-value" aria-labelledby="pw-wc-value-heading">
      <div className="pw-shell pw-shell-wide pw-wc-value-row">
        <h2 id="pw-wc-value-heading" className="pw-wc-value-title">
          Replace Spreadsheet Chaos With An Agentic Insurance Operating System
        </h2>
        <Link href="/platform/" className="pw-wc-btn-outline">
          Learn more
        </Link>
      </div>
    </section>
  );
}
