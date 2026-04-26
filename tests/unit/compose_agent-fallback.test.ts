import { describe, it, expect } from "vitest";
import { tool } from "../../src/tools/compose_agent.js";

/**
 * Graceful fallback tests for compose_agent — lesson #20.
 *
 * MVP-12 coverage: unknown role_id OR persona_id must return a [Generic fallback]
 * success response (not isError, not throw) per spec MVP-12 + Pi rule.
 */
describe("compose_agent — graceful fallback for unknown enums", () => {
  it("returns [Generic fallback] for unknown role_id with known persona", async () => {
    const out = await tool.handler({
      // @ts-expect-error intentional unknown value
      role_id: "data-scientist",
      persona_id: "direct-pragmatist",
      context: "30+ chars context for test — data scientist ML pipeline design",
      framework_id: "first-principles",
      locale: "en",
      format: "system_prompt",
    });
    expect(out.composed_output).toMatch(/\[Generic fallback\]/);
    expect(out.composed_output).toMatch(/No handcrafted enrichment/);
    expect(out.composed_output).toMatch(/data-scientist/);
    expect(out.composition_notes[0]).toMatch(/Generic composition/);
  });

  it("returns [Generic fallback] for known role_id with unknown persona", async () => {
    const out = await tool.handler({
      role_id: "technical-architect",
      // @ts-expect-error intentional unknown value
      persona_id: "mystery-persona",
      context: "30+ chars context for test — unknown persona graceful handling",
      locale: "en",
      format: "system_prompt",
    });
    expect(out.composed_output).toMatch(/\[Generic fallback\]/);
    expect(out.composed_output).toMatch(/No handcrafted enrichment/);
    expect(out.composed_output).toMatch(/mystery-persona/);
    expect(out.composition_notes[0]).toMatch(/Generic composition/);
  });

  it("returns [Generic fallback] for both unknown role_id and persona_id", async () => {
    const out = await tool.handler({
      // @ts-expect-error intentional unknown values
      role_id: "data-scientist",
      // @ts-expect-error
      persona_id: "mystery-persona",
      context: "30+ chars context for test — both unknown role and persona",
      locale: "en",
      format: "system_prompt",
    });
    expect(out.composed_output).toMatch(/\[Generic fallback\]/);
    expect(out.composed_output).toMatch(/No handcrafted enrichment/);
    expect(out.composed_output).toMatch(/data-scientist/);
    expect(out.composed_output).toMatch(/mystery-persona/);
  });

  it("still works normally for all 12 known roles (technical-architect smoke)", async () => {
    const out = await tool.handler({
      role_id: "technical-architect",
      persona_id: "direct-pragmatist",
      framework_id: "first-principles",
      context: "Design the migration path from monolith to event-driven microservices.",
      locale: "en",
      format: "system_prompt",
    });
    expect(out.composed_output).toMatch(/You are a Technical Architect/);
    expect(out.composed_output).toMatch(/First Principles/);
    expect(out.composed_output).not.toMatch(/\[Generic fallback\]/);
  });

  it("still works normally for known role — product-manager (second known role smoke)", async () => {
    const out = await tool.handler({
      role_id: "product-manager",
      persona_id: "concise-executive",
      context: "Define the roadmap for a SaaS analytics product targeting mid-market.",
      locale: "en",
      format: "json_definition",
    });
    const parsed = JSON.parse(out.composed_output);
    expect(parsed.role.id).toBe("product-manager");
    expect(parsed.persona.id).toBe("concise-executive");
    expect(out.composed_output).not.toMatch(/Generic fallback/);
  });
});
