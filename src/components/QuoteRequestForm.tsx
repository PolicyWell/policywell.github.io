"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

const INDUSTRIES = [
  "Individuals & families",
  "Precision manufacturing",
  "Professional services",
  "Technology / SaaS",
  "Healthcare",
  "Construction",
  "Retail / hospitality",
  "Financial services",
  "Transportation / logistics",
  "Other",
] as const;

type QuoteFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  state: string;
  industry: string;
};

const INITIAL: QuoteFormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  state: "",
  industry: "",
};

export function QuoteRequestForm() {
  const [form, setForm] = useState<QuoteFormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const stateOptions = useMemo(() => US_STATES, []);

  function update<K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    if (!form.state) {
      setError("Select the state of headquarters.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="pw-quote-success animate-rise">
        <p className="pw-quote-eyebrow">Quote requested</p>
        <h2 className="font-display text-3xl text-pine">We received your request.</h2>
        <p className="text-stone mt-3 max-w-md">
          A licensed PolicyWell advisor will review your details and follow up,
          usually within the next hour. This is decision support for coverage -
          not a bindable quote or underwriting decision.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/agent" className="pw-btn">
            Talk to the agent
          </Link>
          <Link href="/commercial" className="pw-btn pw-btn-secondary">
            Commercial risk
          </Link>
          <button
            type="button"
            className="pw-btn pw-btn-secondary"
            onClick={() => {
              setSubmitted(false);
              setForm(INITIAL);
            }}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="pw-quote-form" onSubmit={onSubmit} noValidate>
      <header className="pw-quote-form-header">
        <p className="pw-quote-eyebrow">Your quote</p>
        <h1 className="font-display text-3xl md:text-4xl text-pine">
          Get your free quote
        </h1>
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
            placeholder="Jordan Lee"
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
            placeholder="Acme Inc."
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
            placeholder="(415) 738-7727"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>
      </div>

      <label className="pw-quote-field">
        <span>
          State of headquarters <abbr title="required">*</abbr>
        </span>
        <select
          className="pw-input pw-quote-select"
          name="state"
          value={form.state}
          onChange={(e) => update("state", e.target.value)}
          required
        >
          <option value="">Start typing your state…</option>
          {stateOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>
      <p className="pw-quote-help">
        Email or phone is required, so add at least one and we can send your quote.
      </p>

      <label className="pw-quote-field">
        <span>What industry are you in?</span>
        <select
          className="pw-input pw-quote-select"
          name="industry"
          value={form.industry}
          onChange={(e) => update("industry", e.target.value)}
        >
          <option value="">Select your industry</option>
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </label>
      <p className="pw-quote-help">
        We&apos;ll tailor the coverage options and questions below to your industry.
      </p>

      {error && <p className="pw-quote-error">{error}</p>}

      <button type="submit" className="pw-btn pw-quote-submit">
        Get my quote
      </button>
      <p className="pw-quote-footnote">
        A licensed advisor reviews every request, usually a reply within the next
        hour.
      </p>
    </form>
  );
}
