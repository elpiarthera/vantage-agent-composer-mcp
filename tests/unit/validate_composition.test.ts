import { describe, it, expect } from "vitest";
import { tool } from "../../src/tools/validate_composition.js";

describe("validate_composition", () => {
  it("validates a clean combination", async () => {
    const out = await tool.handler({
      role_id: "executive-coach",
      persona_id: "warm-mentor",
      framework_id: "cynefin",
      skills: ["active listening", "powerful questions"],
      locale: "en",
    });
    expect(out.valid).toBe(true);
    expect(out.compatibility_score).toBeGreaterThanOrEqual(80);
    expect(out.warnings.every((w) => w.severity !== "error")).toBe(true);
  });

  it("flags a persona-role clash", async () => {
    const out = await tool.handler({
      role_id: "executive-coach",
      persona_id: "provocative-challenger",
      framework_id: "cynefin",
      skills: ["active listening"],
      locale: "fr",
    });
    expect(out.warnings.some((w) => w.severity === "warning")).toBe(true);
    expect(out.compatibility_score).toBeLessThan(100);
    // Bilingual presence.
    const w = out.warnings.find((x) => x.severity === "warning");
    expect(w?.message_fr.length).toBeGreaterThan(0);
  });

  it("rejects an invalid role_id", async () => {
    await expect(
      tool.handler({
        // @ts-expect-error
        role_id: "ghost",
        persona_id: "warm-mentor",
        locale: "en",
      }),
    ).rejects.toThrow();
  });
});
