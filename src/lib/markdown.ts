/** Minimal markdown → HTML for PolicyWell docs pages (no extra dependency). */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineFormat(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="underline hover:text-pine">$1</a>',
  );
  return s;
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "---") {
      out.push('<hr class="my-8 border-pine/15" />');
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      out.push(
        `<pre class="pw-docs-pre"${lang ? ` data-lang="${escapeHtml(lang)}"` : ""}><code>${escapeHtml(body.join("\n"))}</code></pre>`,
      );
      continue;
    }

    if (line.startsWith("|") && i + 1 < lines.length && /^\|[\s-:|]+$/.test(lines[i + 1].trim())) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i]
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        if (!/^[\s-:|]+$/.test(lines[i].replace(/\|/g, ""))) {
          rows.push(cells);
        }
        i += 1;
      }
      if (rows.length) {
        const [head, ...body] = rows;
        out.push('<div class="overflow-x-auto my-5"><table class="pw-docs-table">');
        out.push(
          `<thead><tr>${head.map((c) => `<th>${inlineFormat(c)}</th>`).join("")}</tr></thead>`,
        );
        out.push("<tbody>");
        for (const row of body) {
          out.push(
            `<tr>${row.map((c) => `<td>${inlineFormat(c)}</td>`).join("")}</tr>`,
          );
        }
        out.push("</tbody></table></div>");
      }
      continue;
    }

    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = h[2];
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      out.push(
        `<h${level} id="${id}" class="pw-docs-h${level}">${inlineFormat(text)}</h${level}>`,
      );
      i += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      out.push(
        `<ol class="pw-docs-ol">${items.map((t) => `<li>${inlineFormat(t)}</li>`).join("")}</ol>`,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i += 1;
      }
      out.push(
        `<ul class="pw-docs-ul">${items.map((t) => `<li>${inlineFormat(t)}</li>`).join("")}</ul>`,
      );
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const paras: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("|") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("---") &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paras.push(lines[i]);
      i += 1;
    }
    out.push(`<p class="pw-docs-p">${inlineFormat(paras.join(" "))}</p>`);
  }

  return out.join("\n");
}
