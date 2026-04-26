import { describe, it, expect } from "vitest";
import { tool as composeTool } from "../../src/tools/compose_agent.js";
import { tool as validateTool } from "../../src/tools/validate_composition.js";
import { tool as suggestTool } from "../../src/tools/suggest_composition.js";
import { ComposerError } from "../../src/lib/errors.js";
import { t, listKeys, detectLocaleFromHeader } from "../../src/lib/i18n.js";
import { logger } from "../../src/lib/logger.js";

describe("branch coverage — compose_agent extra formats", () => {
  it("renders a markdown_card EN with framework", async () => {
    const out = await composeTool.handler({
      role_id: "tech-lead",
      persona_id: "warm-mentor",
      framework_id: "okr",
      skills: ["mentoring", "delivery planning"],
      context: "Coach a tech lead through their first quarterly planning cycle.",
      locale: "en",
      format: "markdown_card",
    });
    expect(out.format).toBe("markdown_card");
    expect(out.composed_output).toMatch(/# Composed Agent/);
    expect(out.composed_output).toMatch(/Tech Lead/);
    expect(out.composed_output).toMatch(/OKR/);
  });

  it("renders a markdown_card FR without framework and without skills", async () => {
    const out = await composeTool.handler({
      role_id: "researcher",
      persona_id: "formal-academic",
      context: "Synthétiser la littérature sur le carbone bleu côtier en deux pages.",
      locale: "fr",
      format: "markdown_card",
    });
    expect(out.composed_output).toMatch(/# Agent composé/);
    expect(out.composed_output).toMatch(/aucun/);
    expect(out.composed_output).toMatch(/non précisées/);
    expect(out.composition_notes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders a system_prompt FR without framework and without skills", async () => {
    const out = await composeTool.handler({
      role_id: "operations-manager",
      persona_id: "concise-executive",
      context: "Superviser un déploiement multi-régions sans interruption client.",
      locale: "fr",
      format: "system_prompt",
    });
    expect(out.composed_output).toMatch(/Tu es un·e Responsable des opérations/);
    expect(out.composed_output).toMatch(/non précisées/);
    expect(out.composed_output).toMatch(/aucun framework imposé/);
  });

  it("renders a json_definition EN with framework + skills", async () => {
    const out = await composeTool.handler({
      role_id: "data-analyst",
      persona_id: "precise-analyst",
      framework_id: "pareto",
      skills: ["SQL", "visualization"],
      context: "Identify the top causes of customer churn in the last 90 days.",
      locale: "en",
      format: "json_definition",
    });
    const parsed = JSON.parse(out.composed_output);
    expect(parsed.framework.id).toBe("pareto");
    expect(parsed.skills).toEqual(["SQL", "visualization"]);
    expect(parsed.locale).toBe("en");
  });
});

describe("branch coverage — validate_composition", () => {
  it("includes info-severity warnings on no framework + no skills", async () => {
    const out = await validateTool.handler({
      role_id: "senior-developer",
      persona_id: "direct-pragmatist",
      locale: "en",
    });
    const severities = out.warnings.map((w) => w.severity);
    expect(severities.filter((s) => s === "info").length).toBeGreaterThanOrEqual(2);
    expect(out.recommendations.length).toBeGreaterThanOrEqual(2);
    expect(out.recommendations_fr.length).toBeGreaterThanOrEqual(2);
  });

  it("warns when more than 10 skills are passed", async () => {
    const skills = Array.from({ length: 11 }, (_, i) => `skill-${i}`);
    const out = await validateTool.handler({
      role_id: "product-manager",
      persona_id: "concise-executive",
      framework_id: "okr",
      skills,
      locale: "fr",
    });
    expect(out.warnings.some((w) => w.severity === "warning")).toBe(true);
  });

  it("info-clash for warm-mentor + qa-engineer", async () => {
    const out = await validateTool.handler({
      role_id: "qa-engineer",
      persona_id: "warm-mentor",
      framework_id: "5-whys",
      skills: ["test strategy"],
      locale: "en",
    });
    expect(out.warnings.some((w) => w.severity === "info")).toBe(true);
  });
});

describe("branch coverage — suggest_composition recipe paths", () => {
  it("matches strategy recipe", async () => {
    const out = await suggestTool.handler({
      goal: "Define our 2026 strategy and competitive positioning for the European market.",
      locale: "en",
    });
    expect(out.suggestions.length).toBeGreaterThan(0);
    expect(
      out.suggestions.some((s) => s.role_id === "business-strategist"),
    ).toBe(true);
  });

  it("matches data recipe", async () => {
    const out = await suggestTool.handler({
      goal: "Build a metric dashboard to track activation and analytic funnels by cohort.",
      locale: "en",
    });
    expect(out.suggestions.some((s) => s.role_id === "data-analyst")).toBe(true);
  });

  it("matches copy recipe", async () => {
    const out = await suggestTool.handler({
      goal: "Write campaign headlines and brand voice guidelines for a new launch.",
      locale: "fr",
    });
    expect(out.suggestions.some((s) => s.role_id === "copywriter")).toBe(true);
  });

  it("matches innovation recipe", async () => {
    const out = await suggestTool.handler({
      goal: "Ideate a new product from a blank page for a B2B fintech in 2026.",
      locale: "en",
    });
    expect(
      out.suggestions.some((s) => s.role_id === "creative-director"),
    ).toBe(true);
  });

  it("matches operations recipe", async () => {
    const out = await suggestTool.handler({
      goal: "Tighten our incident response process and SLA management at scale.",
      locale: "en",
    });
    expect(
      out.suggestions.some(
        (s) => s.role_id === "operations-manager" || s.role_id === "technical-architect",
      ),
    ).toBe(true);
  });
});

describe("branch coverage — lib", () => {
  it("ComposerError carries code + locale + data", () => {
    const e = new ComposerError("ROLE_NOT_FOUND", "fr", { id: "ghost" });
    expect(e.code).toBe("ROLE_NOT_FOUND");
    expect(e.locale).toBe("fr");
    expect(e.data).toEqual({ id: "ghost" });
    expect(e.message).toContain("rôle");
  });

  it("i18n falls back to EN when key missing in FR", () => {
    expect(t("error.invalid_params", "fr")).toContain("Paramètres");
    expect(t("nonexistent.key", "fr")).toBe("nonexistent.key");
    expect(listKeys("en").length).toBeGreaterThan(0);
  });

  it("detects locale from header", () => {
    expect(detectLocaleFromHeader("fr")).toBe("fr");
    expect(detectLocaleFromHeader(["fr-FR"])).toBe("fr");
    expect(detectLocaleFromHeader("en-US")).toBe("en");
    expect(detectLocaleFromHeader(undefined)).toBe("en");
  });

  it("logger emits without throwing across levels", () => {
    expect(() => logger.info({ tool: "test", duration_ms: 1 })).not.toThrow();
    expect(() => logger.warn({ tool: "test" })).not.toThrow();
    expect(() => logger.error({ tool: "test", error: "boom" })).not.toThrow();
    expect(() => logger.debug({ tool: "test" })).not.toThrow();
  });
});
