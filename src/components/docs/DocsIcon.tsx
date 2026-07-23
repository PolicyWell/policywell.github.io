import type { DocsIconName } from "@/lib/docs-data";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DocsIcon({
  name,
  className = "h-5 w-5",
}: {
  name: DocsIconName;
  className?: string;
}) {
  switch (name) {
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
          <path d="M9.5 12.5l1.8 1.8 3.7-3.8" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15v-4" />
          <path d="M12 15V8" />
          <path d="M16 15v-6" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M5 6h14a2 2 0 012 2v7a2 2 0 01-2 2H10l-4 3v-3H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      );
    case "document":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M8 3h6l4 4v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z" />
          <path d="M14 3v4h4" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M12 3l1.4 5.2L18 10l-4.6 1.8L12 17l-1.4-5.2L6 10l4.6-1.8L12 3z" />
          <path d="M18 15l.7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7L18 15z" />
        </svg>
      );
    case "crm":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="16" cy="9" r="2" />
          <path d="M4 18c.8-2.4 2.7-3.5 5-3.5s4.2 1.1 5 3.5" />
          <path d="M14 18c.5-1.5 1.6-2.3 3.2-2.3 1.4 0 2.4.7 3 2.3" />
        </svg>
      );
    case "api":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M8 8l-4 4 4 4" />
          <path d="M16 8l4 4-4 4" />
          <path d="M13 6l-2 12" />
        </svg>
      );
    case "building":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M4 20V6l8-3 8 3v14" />
          <path d="M4 20h16" />
          <path d="M9 20v-5h6v5" />
          <path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01" />
        </svg>
      );
    case "webhook":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <circle cx="12" cy="6" r="2.5" />
          <circle cx="6.5" cy="16.5" r="2.5" />
          <circle cx="17.5" cy="16.5" r="2.5" />
          <path d="M12 8.5v3.2l-3.8 3.2" />
          <path d="M12 11.7l3.8 3.2" />
        </svg>
      );
    case "workflow":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <rect x="3" y="4" width="6" height="5" rx="1.5" />
          <rect x="15" y="4" width="6" height="5" rx="1.5" />
          <rect x="9" y="15" width="6" height="5" rx="1.5" />
          <path d="M6 9v2.5a2 2 0 002 2h8a2 2 0 002-2V9" />
          <path d="M12 13.5V15" />
        </svg>
      );
    case "brand":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M4 7h16v12H4z" />
          <path d="M8 7V5a4 4 0 018 0v2" />
          <path d="M9 12h6M9 15h4" />
        </svg>
      );
    case "sdk":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
          <path d="M8 8l-4 4 4 4" />
          <path d="M16 8l4 4-4 4" />
          <path d="M14 6l-4 12" />
        </svg>
      );
    default:
      return null;
  }
}
