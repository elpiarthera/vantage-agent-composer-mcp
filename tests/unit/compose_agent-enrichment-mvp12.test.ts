/**
 * Tests for compose_agent enrichment MVP-12 (issue #4)
 *
 * Covers:
 * 1. combo 1 (copywriter + direct-pragmatist) standard → EXAMPLES + DOS + DONTS
 * 2. combo 1 minimal → no enrichment (rétrocompat v1.0.x)
 * 3. combo 1 verbose → EXAMPLES + DOS + DONTS + OUTPUT FORMAT
 * 4. Combo NOT in matrix → graceful fallback + caveat present
 * 5. Locale FR for combo 2 (business-strategist + precise-analyst) → FR enrichment
 */

import { describe, it, expect } from "vitest";
import { tool } from "../../src/tools/compose_agent.js";

const BASE_CONTEXT = "Testing enrichment level for agent composition MVP-12.";

describe("compose_agent enrichment MVP-12", () => {
  it("TC-1: copywriter + direct-pragmatist standard → EXAMPLES + DOS + DONTS present", async () => {
    const result = await tool.handler({
      role_id: "copywriter",
      persona_id: "direct-pragmatist",
      context: BASE_CONTEXT,
      locale: "en",
      format: "system_prompt",
      enrichment_level: "standard",
    });

    expect(result.composed_output).toContain("EXAMPLES");
    expect(result.composed_output).toContain("DOS");
    expect(result.composed_output).toContain("DONTS");
    // OUTPUT FORMAT should NOT be present in standard
    expect(result.composed_output).not.toContain("EXPECTED OUTPUT FORMAT");
  });

  it("TC-2: copywriter + direct-pragmatist minimal → no enrichment sections (v1.0.x rétrocompat)", async () => {
    const result = await tool.handler({
      role_id: "copywriter",
      persona_id: "direct-pragmatist",
      context: BASE_CONTEXT,
      locale: "en",
      format: "system_prompt",
      enrichment_level: "minimal",
    });

    expect(result.composed_output).not.toContain("EXAMPLES");
    expect(result.composed_output).not.toContain("DOS");
    expect(result.composed_output).not.toContain("DONTS");
    expect(result.composed_output).not.toContain("EXPECTED OUTPUT FORMAT");
    // Should still have base role/voice content
    expect(result.composed_output).toContain("Copywriter");
  });

  it("TC-3: copywriter + direct-pragmatist verbose → EXAMPLES + DOS + DONTS + OUTPUT FORMAT present", async () => {
    const result = await tool.handler({
      role_id: "copywriter",
      persona_id: "direct-pragmatist",
      context: BASE_CONTEXT,
      locale: "en",
      format: "system_prompt",
      enrichment_level: "verbose",
    });

    expect(result.composed_output).toContain("EXAMPLES");
    expect(result.composed_output).toContain("DOS");
    expect(result.composed_output).toContain("DONTS");
    expect(result.composed_output).toContain("EXPECTED OUTPUT FORMAT");
  });

  it("TC-4: combo NOT in matrix (copywriter + warm-mentor) → graceful fallback + caveat present", async () => {
    const result = await tool.handler({
      role_id: "copywriter",
      persona_id: "warm-mentor",
      context: BASE_CONTEXT,
      locale: "en",
      format: "system_prompt",
      enrichment_level: "standard",
    });

    // Should still produce output (no crash)
    expect(result.composed_output).toBeTruthy();
    // Caveat must be present
    expect(result.composed_output).toContain("MVP-12 coverage");
    expect(result.composed_output).toContain("not in enrichment matrix");
    expect(result.composed_output).toContain("Roadmap");
  });

  it("TC-5: FR locale for combo 2 (business-strategist + precise-analyst) → FR enrichment sections", async () => {
    const result = await tool.handler({
      role_id: "business-strategist",
      persona_id: "precise-analyst",
      context: "Analyser notre positionnement sur le marché français des outils développeurs.",
      locale: "fr",
      format: "system_prompt",
      enrichment_level: "standard",
    });

    expect(result.composed_output).toContain("EXEMPLES");
    expect(result.composed_output).toContain("À FAIRE");
    expect(result.composed_output).toContain("À ÉVITER");
    // English headers should NOT be present
    expect(result.composed_output).not.toContain("EXAMPLES");
    expect(result.composed_output).not.toContain("DOS");
  });

  it("TC-6: verbose FR locale → FR sections including FORMAT DE SORTIE ATTENDU", async () => {
    const result = await tool.handler({
      role_id: "business-strategist",
      persona_id: "precise-analyst",
      context: "Analyser notre positionnement sur le marché français des outils développeurs.",
      locale: "fr",
      format: "system_prompt",
      enrichment_level: "verbose",
    });

    expect(result.composed_output).toContain("FORMAT DE SORTIE ATTENDU");
  });

  it("TC-7: NOT-in-matrix combo with FR locale → FR caveat text", async () => {
    const result = await tool.handler({
      role_id: "copywriter",
      persona_id: "warm-mentor",
      context: BASE_CONTEXT,
      locale: "fr",
      format: "system_prompt",
      enrichment_level: "standard",
    });

    expect(result.composed_output).toContain("Couverture MVP-12");
    expect(result.composed_output).toContain("matrice d'enrichissement");
  });
});
