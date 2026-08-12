import { describe, expect, it } from "vitest";
import { getHtmlSitemapGroups } from "@/lib/html-sitemap";

describe("html sitemap", () => {
  it("groups public pages like a Gusto-style directory", () => {
    const groups = getHtmlSitemapGroups();
    const titles = groups.map((g) => g.title);
    expect(titles).toContain("Product");
    expect(titles).toContain("Solutions by Industry");
    expect(titles).toContain("Life Insurance");
    expect(titles).toContain("Coverage Library");
    expect(titles).toContain("Legal");

    const hrefs = groups.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs).toContain("/industries/");
    expect(hrefs).toContain("/life-insurance/");
    expect(hrefs).toContain("/sitemap/");
    expect(hrefs.every((h) => h.startsWith("/"))).toBe(true);
    expect(groups.every((g) => g.links.length > 0)).toBe(true);
  });
});
