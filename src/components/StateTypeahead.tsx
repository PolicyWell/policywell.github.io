"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

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

const STATE_ABBREVS: Record<string, (typeof US_STATES)[number]> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export function isUsState(value: string): boolean {
  return (US_STATES as readonly string[]).includes(value);
}

function filterStates(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...US_STATES];

  const abbrevHit = STATE_ABBREVS[q.toUpperCase()];
  const starts: string[] = [];
  const contains: string[] = [];
  const seen = new Set<string>();

  if (abbrevHit) {
    starts.push(abbrevHit);
    seen.add(abbrevHit);
  }

  for (const state of US_STATES) {
    if (seen.has(state)) continue;
    const lower = state.toLowerCase();
    if (lower.startsWith(q)) starts.push(state);
    else if (lower.includes(q)) contains.push(state);
  }

  return [...starts, ...contains];
}

type StateTypeaheadProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
};

/** Suggested-type combobox for US state of headquarters. */
export function StateTypeahead({
  value,
  onChange,
  name = "state",
  required = false,
}: StateTypeaheadProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => filterStates(query).slice(0, 8), [query]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function selectState(state: string) {
    setQuery(state);
    onChange(state);
    setOpen(false);
    setActiveIndex(0);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) =>
        suggestions.length === 0 ? 0 : Math.min(i + 1, suggestions.length - 1),
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && open && suggestions[activeIndex]) {
      e.preventDefault();
      selectState(suggestions[activeIndex]);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="pw-state-typeahead" ref={rootRef}>
      <input
        className="pw-input"
        name={name}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && suggestions[activeIndex]
            ? `${listId}-${activeIndex}`
            : undefined
        }
        autoComplete="address-level1"
        placeholder="Start typing your state…"
        value={query}
        required={required}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          setOpen(true);
          setActiveIndex(0);
          // Keep form value in sync only when it exactly matches a state,
          // or clear it while the user is still typing.
          if (isUsState(next)) onChange(next);
          else if (value) onChange("");
        }}
        onFocus={() => {
          setOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={onKeyDown}
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          className="pw-state-suggestions"
          role="listbox"
          aria-label="Suggested states"
        >
          {suggestions.map((state, index) => (
            <li key={state} role="presentation">
              <button
                type="button"
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`pw-state-suggestion${
                  index === activeIndex ? " is-active" : ""
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => {
                  // Prevent input blur before selection.
                  e.preventDefault();
                  selectState(state);
                }}
              >
                {state}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query.trim() && suggestions.length === 0 ? (
        <p className="pw-state-empty" role="status">
          No matching state. Try a full name or abbreviation.
        </p>
      ) : null}
    </div>
  );
}
