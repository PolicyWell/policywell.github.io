import { describe, expect, it } from "vitest";
import { buildIndustryMeta, industryGlyph } from "./industry-meta";

describe("industry meta", () => {
  it("maps industry labels to glyphs", () => {
    expect(industryGlyph("Manufacturing")).toBe("factory");
    expect(industryGlyph("Retail")).toBe("cart");
    expect(industryGlyph("Healthcare & Social Assistance")).toBe("heart");
  });

  it("builds filter rows with counts", () => {
    const rows = buildIndustryMeta(["Retail", "Manufacturing"], {
      Retail: 4,
      Manufacturing: 9,
    });
    expect(rows).toEqual([
      { id: "Retail", label: "Retail", count: 4, glyph: "cart" },
      {
        id: "Manufacturing",
        label: "Manufacturing",
        count: 9,
        glyph: "factory",
      },
    ]);
  });
});
