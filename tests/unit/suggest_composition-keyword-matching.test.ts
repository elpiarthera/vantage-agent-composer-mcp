/**
 * suggest_composition-keyword-matching.test.ts
 * Tests for GitHub issue #3 fix: keyword index FR+EN per role.
 * "Rédiger des posts LinkedIn" must return copywriter, not tech-lead fallback.
 */
import { describe, it, expect } from "vitest";
import { tool } from "../../src/tools/suggest_composition.js";

describe("suggest_composition — keyword matching (Issue #3 fix)", () => {
  it("FR: 'Rédiger des posts LinkedIn pour X' → top match copywriter", async () => {
    const out = await tool.handler({
      goal: "Rédiger des posts LinkedIn pour promouvoir notre nouvelle offre de service.",
      locale: "fr",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    expect(out.suggestions[0]?.role_id).toBe("copywriter");
  });

  it("EN: 'Write LinkedIn posts and tweets for product launch' → top match copywriter", async () => {
    const out = await tool.handler({
      goal: "Write LinkedIn posts and tweets for our product launch campaign this quarter.",
      locale: "en",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    expect(out.suggestions[0]?.role_id).toBe("copywriter");
  });

  it("EN: 'Build a CI/CD pipeline and deploy infra' → top match tech-lead or senior-developer", async () => {
    const out = await tool.handler({
      goal: "Build a CI/CD pipeline to deploy our infrastructure automatically on every merge.",
      locale: "en",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    const topRole = out.suggestions[0]?.role_id;
    expect(["tech-lead", "senior-developer", "technical-architect"]).toContain(topRole);
  });

  it("EN: 'Run a market analysis on competitors' → top match business-strategist or data-analyst", async () => {
    const out = await tool.handler({
      goal: "Run a market analysis on our main competitors and assess our positioning strategy.",
      locale: "en",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    const topRole = out.suggestions[0]?.role_id;
    expect(["business-strategist", "data-analyst", "researcher"]).toContain(topRole);
  });

  it("FR: 'Auditer notre stratégie produit' → top match product-manager or business-strategist", async () => {
    const out = await tool.handler({
      goal: "Auditer notre stratégie produit et proposer une nouvelle roadmap pour Q3 2026.",
      locale: "fr",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    const topRole = out.suggestions[0]?.role_id;
    expect(["product-manager", "business-strategist"]).toContain(topRole);
  });

  it("Ambiguous/empty-signal goal → fallback tech-lead (generic)", async () => {
    const out = await tool.handler({
      goal: "I want a helpful assistant but I am not sure what for exactly yet.",
      locale: "en",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    // Fallback case: tech-lead should be top suggestion
    expect(out.suggestions[0]?.role_id).toBe("tech-lead");
    // Rationale should exist
    expect(out.suggestions[0]?.rationale.length).toBeGreaterThan(0);
    expect(out.suggestions[0]?.rationale_fr.length).toBeGreaterThan(0);
  });

  it("fit_scores are monotonically non-increasing", async () => {
    const out = await tool.handler({
      goal: "Rédiger des posts LinkedIn pour promouvoir notre nouvelle offre de service.",
      locale: "fr",
    });
    const scores = out.suggestions.map((s) => s.fit_score);
    for (let i = 1; i < scores.length; i++) {
      const prev = scores[i - 1];
      const cur = scores[i];
      expect(prev !== undefined && cur !== undefined && prev >= cur).toBe(true);
    }
  });

  it("FR: newsletter rédaction → copywriter", async () => {
    const out = await tool.handler({
      goal: "Rédiger une newsletter mensuelle pour fidéliser notre base clients existante.",
      locale: "fr",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    expect(out.suggestions[0]?.role_id).toBe("copywriter");
  });

  it("EN: data analysis + dashboard → data-analyst", async () => {
    const out = await tool.handler({
      goal: "Analyze our sales data and create a KPI dashboard to track quarterly metrics.",
      locale: "en",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    expect(out.suggestions[0]?.role_id).toBe("data-analyst");
  });

  it("EN: coaching leadership feedback → executive-coach", async () => {
    const out = await tool.handler({
      goal: "Coach our senior managers on leadership and help them deliver meaningful feedback to their teams.",
      locale: "en",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    expect(out.suggestions[0]?.role_id).toBe("executive-coach");
  });
});
