import { describe, it, expect } from "vitest";
import { tool } from "../../src/tools/compose_agent.js";

describe("compose_agent", () => {
  it("composes a system_prompt EN with framework", async () => {
    const out = await tool.handler({
      role_id: "technical-architect",
      persona_id: "direct-pragmatist",
      framework_id: "first-principles",
      skills: ["system design", "trade-off analysis"],
      context: "Design the migration path from monolith to event-driven services.",
      locale: "en",
      format: "system_prompt",
    });
    expect(out.format).toBe("system_prompt");
    expect(out.framework).toBe("first-principles");
    expect(out.composed_output).toMatch(/You are a Technical Architect/);
    expect(out.composed_output).toMatch(/First Principles/);
    expect(out.composed_output).toMatch(/system design, trade-off analysis/);
    expect(out.agent_id).toMatch(/[0-9a-f-]{36}/i);
    expect(out.composition_notes.length).toBeGreaterThan(0);
  });

  it("composes a json_definition FR without framework", async () => {
    const out = await tool.handler({
      role_id: "creative-director",
      persona_id: "playful-creative",
      context: "Lancer une campagne 360 pour une marque de matelas DTC en France.",
      locale: "fr",
      format: "json_definition",
    });
    expect(out.format).toBe("json_definition");
    expect(out.framework).toBeNull();
    const parsed = JSON.parse(out.composed_output);
    expect(parsed.locale).toBe("fr");
    expect(parsed.role.id).toBe("creative-director");
    expect(parsed.persona.id).toBe("playful-creative");
    expect(parsed.framework).toBeNull();
  });

  it("returns graceful fallback for unknown role_id (lesson #20 — no Zod hard reject)", async () => {
    // Schema widened (Approach A): unknown role_id → [Generic fallback] success response, NOT throw.
    const out = await tool.handler({
      // @ts-expect-error intentional unknown value to test graceful fallback
      role_id: "not-a-role",
      persona_id: "direct-pragmatist",
      context:
        "Some long enough context string that crosses the 20 char threshold.",
      locale: "en",
      format: "system_prompt",
    });
    expect(out.composed_output).toMatch(/\[Generic fallback\]/);
    expect(out.composed_output).toMatch(/not-a-role/);
    expect(out.composition_notes[0]).toMatch(/Generic composition/);
  });
});
