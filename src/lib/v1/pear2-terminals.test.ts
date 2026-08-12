import { describe, expect, it } from "vitest";
import { runPear2CliCommand } from "@/lib/v1/pear2-terminals";

describe("pear2 dual-terminal CLI", () => {
  it("runs funding against Malik seed", () => {
    const lines = runPear2CliCommand("funding");
    const blob = lines.map((l) => l.text).join("\n");
    expect(blob).toMatch(/Funding analysis/);
    expect(blob).toMatch(/Amount above no-lapse/);
  });

  it("lists better options from ask", () => {
    const lines = runPear2CliCommand('ask "any better options?"');
    const blob = lines.map((l) => l.text).join("\n");
    expect(blob).toMatch(/Foresters Financial/);
    expect(blob).toMatch(/Hypothetical/);
  });

  it("cashvalue at 52", () => {
    const lines = runPear2CliCommand("cashvalue --age 52");
    const blob = lines.map((l) => l.text).join("\n");
    expect(blob).toMatch(/39,719|39719/);
  });
});
