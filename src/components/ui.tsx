import Link from "next/link";

export function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-baseline gap-2">
      <span
        className={`font-display text-pine tracking-tight ${
          large ? "text-4xl md:text-6xl" : "text-xl"
        }`}
      >
        PolicyWell
      </span>
      {!large && (
        <span className="text-[10px] uppercase tracking-[0.18em] text-stone">
          v0.1
        </span>
      )}
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="pw-shell flex items-center justify-between py-6 animate-rise">
      <BrandMark />
      <nav className="flex items-center gap-3 text-sm text-stone">
        <Link href="/agent" className="hover:text-pine transition-colors">
          Agent
        </Link>
        <Link href="/deck" className="hover:text-pine transition-colors">
          Deck
        </Link>
        <Link href="/docs" className="hover:text-pine transition-colors">
          Docs
        </Link>
        <Link href="/demo" className="hover:text-pine transition-colors">
          Investor demo
        </Link>
        <Link href="/login" className="pw-btn pw-btn-secondary !py-2 !px-4 text-sm">
          Sign in
        </Link>
      </nav>
    </header>
  );
}

export function AppNav({ role }: { role?: string }) {
  const links = [
    { href: "/agent", label: "Agent" },
    { href: "/docs", label: "Docs" },
    { href: "/workspace", label: "Workspace" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/profile", label: "Profile" },
    { href: "/upload", label: "Upload" },
    { href: "/compare", label: "Compare" },
    { href: "/tasks", label: "Tasks" },
    { href: "/report", label: "Report" },
  ];
  if (role === "advisor" || role === "imo") {
    links.unshift({ href: "/clients", label: "Clients" });
  }
  if (role === "imo") {
    links.unshift({ href: "/imo", label: "IMO dashboard" });
  }
  if (role === "broker_dealer" || role === "imo") {
    links.unshift({ href: "/firm", label: "Firm" });
  }
  if (role === "carrier") {
    links.push({ href: "/carrier", label: "Carrier console" });
  }
  return (
    <header className="border-b border-pine/10 bg-foam/70 backdrop-blur-md sticky top-0 z-20">
      <div className="pw-shell flex flex-wrap items-center justify-between gap-3 py-4">
        <BrandMark />
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-full text-stone hover:text-pine hover:bg-pine/5 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {role && (
            <span className="ml-2 text-xs uppercase tracking-wider text-moss">
              {role}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 80 ? "text-ok bg-ok/10" : pct >= 50 ? "text-amber bg-amber/15" : "text-danger bg-danger/10";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      Confidence {pct}%
    </span>
  );
}

export function MissingList({ fields }: { fields: string[] }) {
  if (!fields.length) {
    return (
      <p className="text-sm text-ok">No critical gaps highlighted.</p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {fields.map((f) => (
        <li
          key={f}
          className="text-xs px-2.5 py-1 rounded-full bg-danger/10 text-danger"
        >
          Missing: {f}
        </li>
      ))}
    </ul>
  );
}
