/** Lightweight dashboard mockups for the WithCoverage-style platform carousel. */

export function PoliciesMock() {
  const rows = [
    {
      holder: "Harbor Fab LLC",
      plan: "GL + Property package",
      status: "Active",
      premium: "$4,280",
    },
    {
      holder: "Northline Logistics",
      plan: "Motor truck cargo",
      status: "Active",
      premium: "$6,140",
    },
    {
      holder: "Cedar Ridge HOA",
      plan: "Master association",
      status: "Renewing",
      premium: "$18,920",
    },
    {
      holder: "Summit Oak Advisors",
      plan: "E&O + Cyber",
      status: "Active",
      premium: "$2,415",
    },
  ] as const;

  return (
    <div className="pw-wc-dash">
      <DashSidebar active="Policies" items={SIDEBAR_CORE} />
      <div className="pw-wc-dash-main">
        <header className="pw-wc-dash-top">
          <h3>Policies</h3>
          <div className="pw-wc-dash-tabs">
            <span className="is-on">Active</span>
            <span>Drafts</span>
          </div>
        </header>
        <div className="pw-wc-dash-stats">
          <div>
            <strong>$31,755</strong>
            <span>Total monthly premium</span>
          </div>
          <div>
            <strong>48</strong>
            <span>Active policies</span>
          </div>
          <div>
            <strong>Live</strong>
            <span>Book intelligence</span>
          </div>
        </div>
        <table className="pw-wc-dash-table">
          <thead>
            <tr>
              <th>Policy holder</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.holder}>
                <td>{r.holder}</td>
                <td>{r.plan}</td>
                <td>
                  <span
                    className={`pw-wc-dash-badge${
                      r.status === "Renewing" ? " is-warn" : ""
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td>{r.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ClaimsMock() {
  return (
    <div className="pw-wc-dash">
      <DashSidebar active="Claims" items={SIDEBAR_CORE} />
      <div className="pw-wc-dash-main">
        <header className="pw-wc-dash-top">
          <h3>Claims</h3>
          <div className="pw-wc-dash-tabs">
            <span className="is-on">Active</span>
            <span>Archived</span>
            <span>All</span>
          </div>
        </header>
        <div className="pw-wc-dash-charts">
          <figure>
            <figcaption>Active per month</figcaption>
            <div className="pw-wc-bars" aria-hidden>
              {[42, 58, 36, 70, 48, 62, 55].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={i % 3 === 1 ? "is-gold" : undefined}
                />
              ))}
            </div>
          </figure>
          <figure>
            <figcaption>Active by status</figcaption>
            <div className="pw-wc-bars" aria-hidden>
              {[80, 45, 30, 55, 25].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </figure>
        </div>
        <ul className="pw-wc-dash-list">
          <li>
            <span>PW-4817 · Harbor Fab water damage</span>
            <span className="pw-wc-dash-badge">Open</span>
          </li>
          <li>
            <span>PW-3920 · Northline cargo delay</span>
            <span className="pw-wc-dash-badge is-warn">Review</span>
          </li>
          <li>
            <span>PW-2881 · Cedar Ridge slip &amp; fall</span>
            <span className="pw-wc-dash-badge">Open</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function CoverageMock() {
  const certs = [
    {
      id: "COI-2041",
      status: "Verified",
      insured: "Harbor Fab LLC",
      carrier: "Pacific Crest",
    },
    {
      id: "COI-2042",
      status: "Pending",
      insured: "Summit Oak Advisors",
      carrier: "Northline Specialty",
    },
    {
      id: "COI-2043",
      status: "Verified",
      insured: "Cedar Ridge HOA",
      carrier: "Rivermark",
    },
  ] as const;

  return (
    <div className="pw-wc-dash">
      <DashSidebar active="Coverage" items={SIDEBAR_CORE} />
      <div className="pw-wc-dash-main">
        <header className="pw-wc-dash-top">
          <h3>Coverage Library</h3>
        </header>
        <div className="pw-wc-dash-stats">
          <div>
            <strong>12</strong>
            <span>Pending review</span>
          </div>
          <div>
            <strong>5</strong>
            <span>Requesting verification</span>
          </div>
        </div>
        <table className="pw-wc-dash-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Insured</th>
              <th>Carrier</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  <span
                    className={`pw-wc-dash-badge${
                      c.status === "Pending" ? " is-warn" : ""
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td>{c.insured}</td>
                <td>{c.carrier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExposuresMock() {
  const cats = ["Property", "Auto", "Workers Comp", "Cyber"] as const;
  return (
    <div className="pw-wc-dash">
      <DashSidebar active="Exposures" items={SIDEBAR_EXPOSURE} />
      <div className="pw-wc-dash-main">
        <header className="pw-wc-dash-top">
          <h3>Exposures</h3>
        </header>
        <div className="pw-wc-dash-split">
          <ul className="pw-wc-dash-cats">
            {cats.map((c, i) => (
              <li key={c} className={i === 0 ? "is-on" : undefined}>
                {c}
              </li>
            ))}
          </ul>
          <div className="pw-wc-dash-map" aria-hidden>
            <svg viewBox="0 0 320 200" className="pw-wc-dash-map-svg">
              <rect width="320" height="200" fill="#eef3f0" rx="8" />
              <path
                d="M40 140 C80 90, 120 70, 170 85 C210 98, 250 70, 290 95 L290 170 L40 170 Z"
                fill="#c5d6cc"
              />
              <circle cx="92" cy="110" r="6" fill="#3d6b5a" />
              <circle cx="150" cy="95" r="6" fill="#3d6b5a" />
              <circle cx="210" cy="120" r="6" fill="#c2a15a" />
              <circle cx="248" cy="88" r="6" fill="#3d6b5a" />
            </svg>
            <p>Locations · hazard risk overlay</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RenewalsMock() {
  const rows = [
    {
      topic: "Insurance needs",
      detail: "Package is adequate; cyber limit short vs peer set.",
    },
    {
      topic: "Renewal timing",
      detail: "Primary GL renews in 47 days — prep market options now.",
    },
    {
      topic: "Funding path",
      detail: "Scenario B lowers deductible exposure $50k → $10k.",
    },
    {
      topic: "Proposal status",
      detail: "Harbor Fab deck ready for advisor approval.",
    },
  ] as const;

  return (
    <div className="pw-wc-dash">
      <DashSidebar active="Renewals" items={SIDEBAR_CORE} />
      <div className="pw-wc-dash-main">
        <header className="pw-wc-dash-top">
          <h3>Sales &amp; renewals</h3>
        </header>
        <p className="pw-wc-dash-kicker">
          Highlights from a PolicyWell renewal discussion
        </p>
        <h4 className="pw-wc-dash-sub">Goals and executive summary</h4>
        <table className="pw-wc-dash-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.topic}>
                <td>{r.topic}</td>
                <td>{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SIDEBAR_CORE = [
  "Home",
  "Policies",
  "Claims",
  "Coverage",
  "Exposures",
  "Renewals",
  "Analytics",
  "Users",
] as const;

const SIDEBAR_EXPOSURE = [
  "Home",
  "Events",
  "Locations",
  "Exposures",
  "Policies",
  "Docs",
  "People",
  "Renewals",
] as const;

function DashSidebar({
  active,
  items,
}: {
  active: string;
  items: readonly string[];
}) {
  return (
    <aside className="pw-wc-dash-side" aria-hidden>
      <p className="pw-wc-dash-brand">PolicyWell</p>
      <ul>
        {items.map((item) => (
          <li key={item} className={item === active ? "is-on" : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}
