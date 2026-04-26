import { describe, it, expect } from "vitest";
import { tool } from "../../src/tools/list_personas.js";

describe("list_personas", () => {
  it("lists all 10 personas in EN locale", async () => {
    const out = await tool.handler({ axis: "all", locale: "en" });
    expect(out.count).toBe(10);
    expect(out.personas).toHaveLength(10);
    expect(out.personas.every((p) => p.voice_traits.length > 0)).toBe(true);
    expect(out.personas.every((p) => p.voice_traits_fr.length > 0)).toBe(true);
  });

  it("filters by axis 'directness'", async () => {
    const out = await tool.handler({ axis: "directness", locale: "fr" });
    expect(out.count).toBeGreaterThan(0);
    expect(out.personas.every((p) => p.axis === "directness")).toBe(true);
    const ids = out.personas.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "socratic-questioner",
        "direct-pragmatist",
        "provocative-challenger",
      ]),
    );
  });

  it("rejects an invalid axis", async () => {
    await expect(
      // @ts-expect-error
      tool.handler({ axis: "bogus", locale: "en" }),
    ).rejects.toThrow();
  });
});
