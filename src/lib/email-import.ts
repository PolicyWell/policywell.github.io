import { ingestDocument } from "./extraction";
import type { IngestedDocument } from "./types";

export interface ParsedEmail {
  from: string | null;
  subject: string | null;
  body: string;
}

/** Parse a raw pasted email (headers optional) into subject/from/body. */
export function parseEmail(raw: string): ParsedEmail {
  const lines = raw.split(/\r?\n/);
  let from: string | null = null;
  let subject: string | null = null;
  let bodyStart = 0;

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    const fromMatch = line.match(/^From:\s*(.+)$/i);
    const subjMatch = line.match(/^Subject:\s*(.+)$/i);
    if (fromMatch) {
      from = fromMatch[1].trim();
      bodyStart = Math.max(bodyStart, i + 1);
    } else if (subjMatch) {
      subject = subjMatch[1].trim();
      bodyStart = Math.max(bodyStart, i + 1);
    } else if (/^(To|Date|Cc):/i.test(line)) {
      bodyStart = Math.max(bodyStart, i + 1);
    } else if (line.trim() === "" && (from || subject)) {
      bodyStart = Math.max(bodyStart, i + 1);
      break;
    }
  }

  return {
    from,
    subject,
    body: lines.slice(bodyStart).join("\n").trim(),
  };
}

function slugify(text: string): string {
  return (
    text
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60) || "Email_Import"
  );
}

/** Email import channel: pasted email → parsed → ingested like any document. */
export function ingestEmail(userId: string, rawEmail: string): IngestedDocument {
  const parsed = parseEmail(rawEmail);
  const filename = `${slugify(parsed.subject ?? "Email Import")}.eml`;
  const doc = ingestDocument({
    userId,
    filename,
    mimeType: "message/rfc822",
    rawText: parsed.body,
  });
  return {
    ...doc,
    searchableText: `${doc.searchableText}\n${(parsed.from ?? "").toLowerCase()}\n${(parsed.subject ?? "").toLowerCase()}`,
  };
}
