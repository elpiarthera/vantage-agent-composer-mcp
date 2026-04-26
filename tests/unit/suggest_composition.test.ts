import { describe, it, expect } from "vitest";
import { tool } from "../../src/tools/suggest_composition.js";

describe("suggest_composition", () => {
  it("suggests technical roles + 5-whys/cynefin for production debugging", async () => {
    const out = await tool.handler({
      goal: "Build an agent that helps debug production incidents and reduce mean time to recovery.",
      locale: "en",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    expect(out.suggestions.length).toBeLessThanOrEqual(3);
    const roleIds = out.suggestions.map((s) => s.role_id);
    expect(roleIds.some((r) =>
      ["technical-architect", "qa-engineer", "tech-lead"].includes(r),
    )).toBe(true);
    const fwIds = out.suggestions.map((s) => s.framework_id);
    expect(fwIds.some((f) => f === "5-whys" || f === "cynefin")).toBe(true);
    // Scores monotonically non-increasing (sorted desc).
    const scores = out.suggestions.map((s) => s.fit_score);
    for (let i = 1; i < scores.length; i++) {
      const prev = scores[i - 1];
      const cur = scores[i];
      expect(prev !== undefined && cur !== undefined && prev >= cur).toBe(true);
    }
  });

  it("falls back to a generic suggestion on ambiguous goal", async () => {
    const out = await tool.handler({
      goal: "I want a helpful assistant but I am not sure what for exactly yet.",
      locale: "fr",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    expect(out.suggestions.length).toBeLessThanOrEqual(3);
    expect(out.suggestions[0]?.rationale_fr.length).toBeGreaterThan(0);
  });

  it("rejects a too-short goal", async () => {
    await expect(
      tool.handler({
        goal: "too short",
        locale: "en",
      }),
    ).rejects.toThrow();
  });
});
