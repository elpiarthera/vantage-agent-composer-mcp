import { z } from "zod";

/**
 * Canonical 12 role identifiers — single source of truth.
 * Critical Rule #4 : no z.any anywhere ; all role inputs go through this enum.
 */
export const ROLE_ID = z
  .enum([
    "technical-architect",
    "senior-developer",
    "qa-engineer",
    "data-analyst",
    "product-manager",
    "creative-director",
    "copywriter",
    "researcher",
    "business-strategist",
    "operations-manager",
    "tech-lead",
    "executive-coach",
  ])
  .describe(
    "Role: 'technical-architect' | 'senior-developer' | 'qa-engineer' | 'data-analyst' | 'product-manager' | 'creative-director' | 'copywriter' | 'researcher' | 'business-strategist' | 'operations-manager' | 'tech-lead' | 'executive-coach' (12 roles)",
  );
export type RoleId = z.infer<typeof ROLE_ID>;

/**
 * Canonical 10 persona identifiers — single source of truth.
 */
export const PERSONA_ID = z
  .enum([
    "socratic-questioner",
    "direct-pragmatist",
    "warm-mentor",
    "formal-academic",
    "playful-creative",
    "concise-executive",
    "detailed-explainer",
    "provocative-challenger",
    "empathetic-listener",
    "precise-analyst",
  ])
  .describe(
    "Persona: 'socratic-questioner' | 'direct-pragmatist' | 'warm-mentor' | 'formal-academic' | 'playful-creative' | 'concise-executive' | 'detailed-explainer' | 'provocative-challenger' | 'empathetic-listener' | 'precise-analyst' (10 personas)",
  );
export type PersonaId = z.infer<typeof PERSONA_ID>;

/**
 * Canonical 16 framework identifiers — mirrored from @vantageos/mcp-frameworks.
 * Cross-server composability : these IDs MUST stay in sync with the frameworks
 * server. We keep this as a flat enum (no runtime dep) so this server can
 * compose offline.
 */
export const FRAMEWORK_ID = z
  .enum([
    "design-thinking",
    "lean-startup",
    "swot",
    "okr",
    "mece",
    "first-principles",
    "5-whys",
    "eisenhower",
    "raci",
    "ooda",
    "bcg-matrix",
    "porter-5-forces",
    "pareto",
    "hofstede",
    "cynefin",
    "mckinsey-7s",
  ])
  .describe(
    "Framework: 'design-thinking' | 'lean-startup' | 'swot' | 'okr' | 'mece' | 'first-principles' | '5-whys' | 'eisenhower' | 'raci' | 'ooda' | 'bcg-matrix' | 'porter-5-forces' | 'pareto' | 'hofstede' | 'cynefin' | 'mckinsey-7s' (16 — mirrored from @vantageos/mcp-frameworks)",
  );
export type FrameworkId = z.infer<typeof FRAMEWORK_ID>;

export const LOCALE = z
  .enum(["en", "fr"])
  .describe("Locale: 'en' (default) | 'fr'");
export type Locale = z.infer<typeof LOCALE>;

export const ROLE_CATEGORY = z
  .enum(["technical", "creative", "analytical", "operational", "leadership"])
  .describe(
    "Role category: 'technical' | 'creative' | 'analytical' | 'operational' | 'leadership'",
  );
export type RoleCategory = z.infer<typeof ROLE_CATEGORY>;

export const PERSONA_AXIS = z
  .enum(["formality", "energy", "directness", "domain_focus"])
  .describe(
    "Persona axis: 'formality' | 'energy' | 'directness' | 'domain_focus'",
  );
export type PersonaAxis = z.infer<typeof PERSONA_AXIS>;

export const COMPOSITION_FORMAT = z
  .enum(["system_prompt", "json_definition", "markdown_card"])
  .describe(
    "Output format: 'system_prompt' (default) | 'json_definition' | 'markdown_card'",
  );
export type CompositionFormat = z.infer<typeof COMPOSITION_FORMAT>;
