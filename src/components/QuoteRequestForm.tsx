"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { BOOK_A_CALL_PATH } from "@/lib/book-a-call";
import { isUsState, StateTypeahead } from "@/components/StateTypeahead";

const BOOK_A_CALL_HREF = BOOK_A_CALL_PATH;

const PRIMARY_COVERAGES = [
  "Life Insurance",
  "Annuity",
  "General Liability",
  "Commercial Property",
  "Directors & Officers (D&O)",
  "Umbrella / Excess",
  "Workers' Compensation",
] as const;

const MORE_COVERAGES = [
  "Cyber Liability",
  "Professional Liability (E&O)",
  "Commercial Auto",
  "Crime / Fidelity",
  "Employment Practices (EPLI)",
] as const;

type QuoteFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  state: string;
  revenue: string;
  coverages: string[];
  helpMeDecide: boolean;
};

const INITIAL: QuoteFormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  state: "",
  revenue: "",
  coverages: [],
  helpMeDecide: false,
};

type QuoteRequestFormProps = {
  /** Pre-select / contextualize when embedded on an industry landing. */
  defaultIndustry?: string;
};

export function QuoteRequestForm({
  defaultIndustry = "",
}: QuoteRequestFormProps) {
  const [form, setForm] = useState<QuoteFormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showMoreCoverage, setShowMoreCoverage] = useState(false);

  const industryLabel = defaultIndustry.trim() || "your program";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const revenue = params.get("revenue")?.trim();
    if (revenue) {
      setForm((prev) => (prev.revenue ? prev : { ...prev, revenue }));
    }
  }, []);

  function update<K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function toggleCoverage(label: string) {
    setForm((prev) => {
      const next = prev.coverages.includes(label)
        ? prev.coverages.filter((c) => c !== label)
        : [...prev.coverages, label];
      return { ...prev, coverages: next, helpMeDecide: false };
    });
    setError("");
  }

  function onHelpMeDecide() {
    setForm((prev) => ({
      ...prev,
      helpMeDecide: !prev.helpMeDecide,
      coverages: prev.helpMeDecide ? prev.coverages : [],
    }));
    setError("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError("Email or phone is required so we can send your quote.");
      return;
    }
    if (!form.state || !isUsState(form.state)) {
      setError("Select a US state of headquarters from the suggestions.");
      return;
    }
    if (!form.helpMeDecide && form.coverages.length === 0) {
      setError("Select at least one coverage, or choose Help me decide.");
      return;
    }
    if (!form.revenue.trim()) {
      setError("Enter your annual revenue estimate.");
      return;
    }
    setSubmitted(true);
  }

  const asideCopy = defaultIndustry
    ? `Send us your policy and a licensed advisor benchmarks your ${industryLabel.toLowerCase()} insurance across 60+ carriers, showing the gaps and the savings. If your program is already solid, we'll tell you.`
    : "Send us your policy and a licensed advisor benchmarks your coverage across 60+ carriers, showing the gaps and the savings. If your program is already solid, we'll tell you.";

  if (submitted) {
    return (
      <div className="pw-quote-shell pw-quote-shell-success animate-rise">
        <aside className="pw-quote-aside">
          <div className="pw-quote-aside-inner">
            <h2 className="pw-quote-aside-title">
              Focus on the work.
              <br />
              We&apos;ll be your risk team.
            </h2>
            <p className="pw-quote-aside-copy">
              A licensed PolicyWell advisor has your request and will follow up
              — usually within the next hour.
            </p>
          </div>
        </aside>
        <div className="pw-quote-panel">
          <div className="pw-quote-success">
            <p className="pw-quote-eyebrow">Quote requested</p>
            <h2 className="font-display text-3xl text-pine">
              We received your request.
            </h2>
            <p className="text-stone mt-3 max-w-md">
              This is decision support for coverage — not a bindable quote or
              underwriting decision.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={BOOK_A_CALL_HREF} className="pw-btn">
                Book a call
              </Link>
              <Link href="/agent" className="pw-btn pw-btn-secondary">
                Talk to the agent
              </Link>
              <button
                type="button"
                className="pw-btn pw-btn-secondary"
                onClick={() => {
                  setSubmitted(false);
                  setForm(INITIAL);
                  setShowMoreCoverage(false);
                }}
              >
                Submit another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const coverageOptions = showMoreCoverage
    ? [...PRIMARY_COVERAGES, ...MORE_COVERAGES]
    : [...PRIMARY_COVERAGES];

  return (
    <div className="pw-quote-shell animate-rise">
      <aside className="pw-quote-aside">
        <div className="pw-quote-aside-inner">
          <h2 className="pw-quote-aside-title">
            Focus on the work.
            <br />
            We&apos;ll be your risk team.
          </h2>
          <p className="pw-quote-aside-copy">{asideCopy}</p>
          <Link href={BOOK_A_CALL_HREF} className="pw-quote-aside-cta">
            Or book a call instead
          </Link>
        </div>
      </aside>

      <div className="pw-quote-panel">
        <form className="pw-quote-form" onSubmit={onSubmit} noValidate>
          <header className="pw-quote-form-header">
            <p className="pw-quote-eyebrow">Your quote</p>
            <h1 className="pw-quote-form-title">Get your free quote</h1>
          </header>

          <div className="pw-quote-grid">
            <label className="pw-quote-field">
              <span>
                Name <abbr title="required">*</abbr>
              </span>
              <input
                className="pw-input"
                name="name"
                autoComplete="name"
                placeholder="Shawn White"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </label>
            <label className="pw-quote-field">
              <span>Company</span>
              <input
                className="pw-input"
                name="company"
                autoComplete="organization"
                placeholder="Maverick Trucking Inc."
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
              />
            </label>
            <label className="pw-quote-field">
              <span>
                Email <abbr title="required">*</abbr>
              </span>
              <input
                className="pw-input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </label>
            <label className="pw-quote-field">
              <span>
                Phone <abbr title="required">*</abbr>
              </span>
              <input
                className="pw-input"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="(470) 887-0449"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </label>
          </div>

          <label className="pw-quote-field">
            <span>
              State of headquarters <abbr title="required">*</abbr>
            </span>
            <StateTypeahead
              value={form.state}
              onChange={(state) => update("state", state)}
              required
            />
          </label>
          <p className="pw-quote-help">
            Email or phone is required, so add at least one and we can send your
            quote.
          </p>

          <fieldset className="pw-quote-coverage">
            <legend>
              Coverage <abbr title="required">*</abbr>
            </legend>
            <p className="pw-quote-coverage-hint">Select all that apply.</p>
            <div className="pw-quote-pills" role="group" aria-label="Coverage">
              {coverageOptions.map((label) => {
                const active = form.coverages.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    className={`pw-quote-pill${active ? " is-active" : ""}`}
                    aria-pressed={active}
                    onClick={() => toggleCoverage(label)}
                  >
                    {label}
                  </button>
                );
              })}
              {!showMoreCoverage ? (
                <button
                  type="button"
                  className="pw-quote-pill is-more"
                  onClick={() => setShowMoreCoverage(true)}
                >
                  + More coverage
                </button>
              ) : null}
            </div>
            <div className="pw-quote-decide-row">
              <span className="pw-quote-decide-label">Not sure what you need?</span>
              <button
                type="button"
                className={`pw-quote-pill${form.helpMeDecide ? " is-active" : ""}`}
                aria-pressed={form.helpMeDecide}
                onClick={onHelpMeDecide}
              >
                Help me decide
              </button>
            </div>
          </fieldset>

          <label className="pw-quote-field">
            <span>
              Annual revenue <abbr title="required">*</abbr>
            </span>
            <div className="pw-quote-revenue">
              <span aria-hidden>$</span>
              <input
                className="pw-input"
                name="revenue"
                inputMode="decimal"
                placeholder="e.g. 2,000,000"
                value={form.revenue}
                onChange={(e) => update("revenue", e.target.value)}
                required
              />
            </div>
            <p className="pw-quote-help pw-quote-help-tight">
              Your best estimate is fine. We quote businesses at every stage.
            </p>
          </label>

          {error ? <p className="pw-quote-error">{error}</p> : null}

          <button type="submit" className="pw-btn pw-quote-submit">
            Get my quote
          </button>
          <p className="pw-quote-footnote">
            A licensed advisor reviews every request, usually a reply within the
            next hour.
          </p>
        </form>
      </div>
    </div>
  );
}
