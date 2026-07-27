"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BOOK_A_CALL_PATH } from "@/lib/book-a-call";
import { isUsState, StateTypeahead } from "@/components/StateTypeahead";

const BOOK_A_CALL_HREF = BOOK_A_CALL_PATH;

export type QuoteLine = "personal" | "commercial";

/** Business / commercial lines — no life or annuity products. */
const COMMERCIAL_PRIMARY = [
  "General Liability",
  "Commercial Property",
  "Directors & Officers (D&O)",
  "Umbrella / Excess",
  "Workers' Compensation",
] as const;

const COMMERCIAL_MORE = [
  "Cyber Liability",
  "Professional Liability (E&O)",
  "Commercial Auto",
  "Crime / Fidelity",
  "Employment Practices (EPLI)",
] as const;

/** Life + annuity products — coverage / policy focused. */
const PERSONAL_PRIMARY = [
  "Term Life",
  "Whole Life",
  "Indexed Universal Life (IUL)",
  "Annuity",
] as const;

const PERSONAL_MORE = [
  "Variable Annuity",
  "Fixed Indexed Annuity",
  "Fixed Annuity",
  "Immediate Annuity (SPIA)",
] as const;

const PERSONAL_FOCUS = [
  "Review my current policies",
  "Need more protection",
  "Compare or replace coverage",
] as const;

type QuoteFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  state: string;
  revenue: string;
  coverages: string[];
  focus: string[];
  policyNotes: string;
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
  focus: [],
  policyNotes: "",
  helpMeDecide: false,
};

type QuoteRequestFormProps = {
  /** Which funnel to show. Defaults to commercial when omitted. */
  line?: QuoteLine;
  /**
   * When true (dedicated /quote page), visitor can switch between
   * Life & Annuities and Business Insurance funnels.
   */
  allowLineSwitch?: boolean;
  /** Pre-select / contextualize when embedded on an industry landing. */
  defaultIndustry?: string;
  /** Industry page path used to preselect personal products. */
  defaultPath?: string;
};

function personalProductsFromPath(path: string): string[] {
  const p = path.replace(/\/+$/, "");
  if (!p) return [];
  if (p.includes("immediate-annuity")) return ["Immediate Annuity (SPIA)"];
  if (p.includes("fixed-indexed-annuity")) return ["Fixed Indexed Annuity"];
  if (p.includes("variable-annuity")) return ["Variable Annuity"];
  if (p.includes("fixed-annuity")) return ["Fixed Annuity"];
  if (p.includes("indexed-universal-life")) {
    return ["Indexed Universal Life (IUL)"];
  }
  if (p.includes("whole-life")) return ["Whole Life"];
  if (p.includes("term-insurance") || p.includes("cash-back-offer-term")) {
    return ["Term Life"];
  }
  if (p.startsWith("/annuities")) return ["Annuity"];
  if (p.startsWith("/life-insurance") || p === "/financial-products") {
    return ["Term Life", "Whole Life", "Indexed Universal Life (IUL)"];
  }
  return [];
}

export function QuoteRequestForm({
  line: lineProp,
  allowLineSwitch = false,
  defaultIndustry = "",
  defaultPath = "",
}: QuoteRequestFormProps) {
  const initialLine: QuoteLine = lineProp ?? "commercial";
  const [line, setLine] = useState<QuoteLine>(initialLine);
  const [form, setForm] = useState<QuoteFormState>(() => ({
    ...INITIAL,
    coverages:
      (lineProp ?? "commercial") === "personal"
        ? personalProductsFromPath(defaultPath)
        : [],
  }));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showMoreCoverage, setShowMoreCoverage] = useState(false);

  const isPersonal = line === "personal";
  const industryLabel = defaultIndustry.trim() || "your program";

  useEffect(() => {
    if (lineProp) setLine(lineProp);
  }, [lineProp]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("line")?.trim().toLowerCase();
    if (!lineProp && (fromQuery === "personal" || fromQuery === "commercial")) {
      setLine(fromQuery);
      if (fromQuery === "personal") {
        setForm((prev) =>
          prev.coverages.length
            ? prev
            : {
                ...prev,
                coverages: personalProductsFromPath(defaultPath),
              },
        );
      }
    }
    if (line === "commercial" || (!lineProp && fromQuery !== "personal")) {
      const revenue = params.get("revenue")?.trim();
      if (revenue) {
        setForm((prev) => (prev.revenue ? prev : { ...prev, revenue }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from URL
  }, []);

  const coverageOptions = useMemo(() => {
    if (isPersonal) {
      return showMoreCoverage
        ? [...PERSONAL_PRIMARY, ...PERSONAL_MORE]
        : [...PERSONAL_PRIMARY];
    }
    return showMoreCoverage
      ? [...COMMERCIAL_PRIMARY, ...COMMERCIAL_MORE]
      : [...COMMERCIAL_PRIMARY];
  }, [isPersonal, showMoreCoverage]);

  function switchLine(next: QuoteLine) {
    setLine(next);
    setError("");
    setShowMoreCoverage(false);
    setForm({
      ...INITIAL,
      coverages:
        next === "personal" ? personalProductsFromPath(defaultPath) : [],
    });
    if (typeof window !== "undefined" && allowLineSwitch) {
      const url = new URL(window.location.href);
      url.searchParams.set("line", next);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function update<K extends keyof QuoteFormState>(
    key: K,
    value: QuoteFormState[K],
  ) {
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

  function toggleFocus(label: string) {
    setForm((prev) => {
      const next = prev.focus.includes(label)
        ? prev.focus.filter((c) => c !== label)
        : [...prev.focus, label];
      return { ...prev, focus: next, helpMeDecide: false };
    });
    setError("");
  }

  function onHelpMeDecide() {
    setForm((prev) => ({
      ...prev,
      helpMeDecide: !prev.helpMeDecide,
      coverages: prev.helpMeDecide ? prev.coverages : [],
      focus: prev.helpMeDecide ? prev.focus : [],
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
      setError(
        isPersonal
          ? "Select a US state of residence from the suggestions."
          : "Select a US state of headquarters from the suggestions.",
      );
      return;
    }
    if (!form.helpMeDecide && form.coverages.length === 0) {
      setError(
        isPersonal
          ? "Select at least one product, or choose Help me decide."
          : "Select at least one coverage, or choose Help me decide.",
      );
      return;
    }
    if (isPersonal) {
      if (!form.helpMeDecide && form.focus.length === 0) {
        setError(
          "Tell us whether you want a policy review, more protection, or a comparison.",
        );
        return;
      }
    } else if (!form.revenue.trim()) {
      setError("Enter your annual revenue estimate.");
      return;
    }
    setSubmitted(true);
  }

  const asideCopy = isPersonal
    ? defaultIndustry
      ? `Share your current ${industryLabel.toLowerCase()} policies and a licensed advisor reviews protection, funding, and gaps across 60+ carriers. If your coverage is already solid, we'll tell you.`
      : "Share your current life or annuity policies and a licensed advisor reviews protection, funding, and gaps across 60+ carriers. If your coverage is already solid, we'll tell you."
    : defaultIndustry
      ? `Send us your policy and a licensed advisor benchmarks your ${industryLabel.toLowerCase()} insurance across 60+ carriers, showing the gaps and the savings. If your program is already solid, we'll tell you.`
      : "Send us your policy and a licensed advisor benchmarks your coverage across 60+ carriers, showing the gaps and the savings. If your program is already solid, we'll tell you.";

  const formTitle = isPersonal
    ? "Life & annuity coverage review"
    : "Get your free quote";
  const formEyebrow = isPersonal ? "Life & annuities" : "Business insurance";
  const submitLabel = isPersonal ? "Request coverage review" : "Get my quote";

  if (submitted) {
    return (
      <div className="pw-quote-shell pw-quote-shell-success animate-rise">
        <aside className="pw-quote-aside">
          <div className="pw-quote-aside-inner">
            <h2 className="pw-quote-aside-title">
              {isPersonal ? (
                <>
                  Protection first.
                  <br />
                  We&apos;ll review the policies.
                </>
              ) : (
                <>
                  Focus on the work.
                  <br />
                  We&apos;ll be your risk team.
                </>
              )}
            </h2>
            <p className="pw-quote-aside-copy">
              A licensed PolicyWell advisor has your request and will follow up
              — usually within the next hour.
            </p>
          </div>
        </aside>
        <div className="pw-quote-panel">
          <div className="pw-quote-success">
            <p className="pw-quote-eyebrow">
              {isPersonal ? "Review requested" : "Quote requested"}
            </p>
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
                  setForm({
                    ...INITIAL,
                    coverages: isPersonal
                      ? personalProductsFromPath(defaultPath)
                      : [],
                  });
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

  return (
    <div className="pw-quote-shell animate-rise">
      <aside className="pw-quote-aside">
        <div className="pw-quote-aside-inner">
          <h2 className="pw-quote-aside-title">
            {isPersonal ? (
              <>
                Protection first.
                <br />
                We&apos;ll review the policies.
              </>
            ) : (
              <>
                Focus on the work.
                <br />
                We&apos;ll be your risk team.
              </>
            )}
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
            <p className="pw-quote-eyebrow">{formEyebrow}</p>
            <h1 className="pw-quote-form-title">{formTitle}</h1>
          </header>

          {allowLineSwitch ? (
            <fieldset className="pw-quote-coverage pw-quote-line-switch">
              <legend>What do you need?</legend>
              <div
                className="pw-quote-pills"
                role="group"
                aria-label="Quote type"
              >
                <button
                  type="button"
                  className={`pw-quote-pill${line === "personal" ? " is-active" : ""}`}
                  aria-pressed={line === "personal"}
                  onClick={() => switchLine("personal")}
                >
                  Life &amp; Annuities
                </button>
                <button
                  type="button"
                  className={`pw-quote-pill${line === "commercial" ? " is-active" : ""}`}
                  aria-pressed={line === "commercial"}
                  onClick={() => switchLine("commercial")}
                >
                  Business Insurance
                </button>
              </div>
            </fieldset>
          ) : null}

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
            {!isPersonal ? (
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
            ) : null}
            <label className="pw-quote-field">
              <span>
                Email <abbr title="required">*</abbr>
              </span>
              <input
                className="pw-input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={
                  isPersonal ? "you@email.com" : "you@company.com"
                }
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
              {isPersonal ? "State of residence" : "State of headquarters"}{" "}
              <abbr title="required">*</abbr>
            </span>
            <StateTypeahead
              value={form.state}
              onChange={(state) => update("state", state)}
              required
            />
          </label>
          <p className="pw-quote-help">
            Email or phone is required, so add at least one and we can follow
            up.
          </p>

          <fieldset className="pw-quote-coverage">
            <legend>
              {isPersonal ? "Product" : "Coverage"}{" "}
              <abbr title="required">*</abbr>
            </legend>
            <p className="pw-quote-coverage-hint">Select all that apply.</p>
            <div
              className="pw-quote-pills"
              role="group"
              aria-label={isPersonal ? "Product" : "Coverage"}
            >
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
                  {isPersonal ? "+ More products" : "+ More coverage"}
                </button>
              ) : null}
            </div>
            {!isPersonal ? (
              <div className="pw-quote-decide-row">
                <span className="pw-quote-decide-label">
                  Not sure what you need?
                </span>
                <button
                  type="button"
                  className={`pw-quote-pill${form.helpMeDecide ? " is-active" : ""}`}
                  aria-pressed={form.helpMeDecide}
                  onClick={onHelpMeDecide}
                >
                  Help me decide
                </button>
              </div>
            ) : null}
          </fieldset>

          {isPersonal ? (
            <>
              <fieldset className="pw-quote-coverage">
                <legend>
                  Current coverage <abbr title="required">*</abbr>
                </legend>
                <p className="pw-quote-coverage-hint">
                  Focus on the policies and protection you have today — not
                  business revenue.
                </p>
                <div
                  className="pw-quote-pills"
                  role="group"
                  aria-label="Current coverage focus"
                >
                  {PERSONAL_FOCUS.map((label) => {
                    const active = form.focus.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        className={`pw-quote-pill${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => toggleFocus(label)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="pw-quote-decide-row">
                  <span className="pw-quote-decide-label">
                    Not sure where to start?
                  </span>
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
                <span>Current policies (optional)</span>
                <textarea
                  className="pw-input pw-quote-notes"
                  name="policyNotes"
                  rows={3}
                  placeholder="Carrier, product type, face amount / income amount, issue year — whatever you know."
                  value={form.policyNotes}
                  onChange={(e) => update("policyNotes", e.target.value)}
                />
                <p className="pw-quote-help pw-quote-help-tight">
                  A short description of what you already own helps the advisor
                  review protection gaps faster.
                </p>
              </label>
            </>
          ) : (
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
          )}

          {error ? <p className="pw-quote-error">{error}</p> : null}

          <button type="submit" className="pw-btn pw-quote-submit">
            {submitLabel}
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
