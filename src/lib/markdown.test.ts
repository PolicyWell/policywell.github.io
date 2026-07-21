import { describe, expect, it } from "vitest";
import { markdownToHtml } from "./markdown";

describe("markdownToHtml", () => {
  it("renders headings, code, and tables used by CLI docs", () => {
    const html = markdownToHtml(
      [
        "# Title",
        "",
        "Use `pw login`.",
        "",
        "| A | B |",
        "|---|---|",
        "| 1 | 2 |",
        "",
        "```bash",
        "pw whoami",
        "```",
      ].join("\n"),
    );
    expect(html).toContain('id="title"');
    expect(html).toContain("<code>pw login</code>");
    expect(html).toContain("<th>");
    expect(html).toContain("pw whoami");
  });
});
