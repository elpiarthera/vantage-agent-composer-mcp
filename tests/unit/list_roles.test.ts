import { describe, it, expect } from "vitest";
import { tool } from "../../src/tools/list_roles.js";

describe("list_roles", () => {
  it("lists all 12 roles in EN locale", async () => {
    const out = await tool.handler({ category: "all", locale: "en" });
    expect(out.count).toBe(12);
    expect(out.roles).toHaveLength(12);
    expect(out.roles.every((r) => r.typical_skills.length > 0)).toBe(true);
    expect(out.roles.every((r) => r.typical_skills_fr.length > 0)).toBe(true);
    expect(new Date(out.fetchedAt).toString()).not.toBe("Invalid Date");
  });

  it("filters by category 'technical'", async () => {
    const out = await tool.handler({ category: "technical", locale: "fr" });
    expect(out.count).toBeGreaterThan(0);
    expect(out.roles.every((r) => r.category === "technical")).toBe(true);
    const ids = out.roles.map((r) => r.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "technical-architect",
        "senior-developer",
        "qa-engineer",
        "tech-lead",
      ]),
    );
  });

  it("rejects an invalid category", async () => {
    await expect(
      // @ts-expect-error — purposely passing wrong literal
      tool.handler({ category: "bogus", locale: "en" }),
    ).rejects.toThrow();
  });
});
