import { z } from "zod";
import { ROLE_ID, PERSONA_ID, FRAMEWORK_ID } from "../schemas/index.js";
import { ROLES } from "../data/roles.js";
import { PERSONAS } from "../data/personas.js";
import { FRAMEWORK_STEPS } from "../data/framework-steps.js";
import { ROLE_KEYWORDS, scoreRoleKeywords } from "../data/role-keywords.js";
import { logger } from "../lib/logger.js";

export const inputSchema = z.object({
  goal: z
    .string()
    .min(20)
    .max(300)
    .describe("Goal: what you want the agent to accomplish (20-300 chars)"),
  constraints: z
    .array(z.string())
    .max(5)
    .optional()
    .describe("Optional constraints (e.g. 'must be concise', 'no jargon')"),
  locale: z
    .enum(["en", "fr"])
    .default("en")
    .describe("Locale: 'en' (default) | 'fr'"),
});

// MINOR FIX #2: role_id, persona_id, framework_id use ROLE_ID/PERSONA_ID/FRAMEWORK_ID enums.
export const outputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        role_id: ROLE_ID,
        persona_id: PERSONA_ID,
        framework_id: FRAMEWORK_ID.nullable(),
        rationale: z.string(),
        rationale_fr: z.string(),
        fit_score: z.number().min(0).max(100),
      }),
    )
    .max(3),
  fetchedAt: z.string().datetime(),
});

export type SuggestCompositionInput = z.infer<typeof inputSchema>;
export type SuggestCompositionOutput = z.infer<typeof outputSchema>;

interface ScoredSuggestion {
  role_id: z.infer<typeof ROLE_ID>;
  persona_id: z.infer<typeof PERSONA_ID>;
  framework_id: z.infer<typeof FRAMEWORK_ID> | null;
  rationale: string;
  rationale_fr: string;
  fit_score: number;
}

/**
 * Per-role persona + framework assignment table.
 * Maps role_id → best {persona_id, framework_id, rationale EN+FR, base_score}.
 * base_score is the score used when the role wins by keyword match.
 * fit_score returned = base_score (0-100).
 */
const ROLE_COMPOSITIONS: Record<
  string,
  {
    persona_id: z.infer<typeof PERSONA_ID>;
    framework_id: z.infer<typeof FRAMEWORK_ID> | null;
    rationale: string;
    rationale_fr: string;
    base_score: number;
  }
> = {
  "copywriter": {
    persona_id: "playful-creative",
    framework_id: null,
    rationale:
      "Content and copy work benefits from a playful creative persona; an explicit framework would over-constrain ideation.",
    rationale_fr:
      "Le travail de contenu et de copie gagne avec un persona créatif joueur ; un framework explicite contraindrait trop l'idéation.",
    base_score: 88,
  },
  "creative-director": {
    persona_id: "playful-creative",
    framework_id: "design-thinking",
    rationale:
      "Creative direction benefits from a Design Thinking loop to move from empathy to prototype.",
    rationale_fr:
      "La direction créative gagne avec une boucle Design Thinking pour passer de l'empathie au prototype.",
    base_score: 86,
  },
  "data-analyst": {
    persona_id: "precise-analyst",
    framework_id: "pareto",
    rationale:
      "Data work pairs naturally with a precise-analyst voice and a Pareto lens to surface the vital few.",
    rationale_fr:
      "Le travail data se marie naturellement avec une voix d'analyste rigoureux et une lecture Pareto pour faire émerger l'essentiel.",
    base_score: 84,
  },
  "product-manager": {
    persona_id: "direct-pragmatist",
    framework_id: "eisenhower",
    rationale:
      "When everything feels urgent, a PM with the Eisenhower matrix forces a single quadrant per task.",
    rationale_fr:
      "Quand tout semble urgent, un·e PM avec la matrice d'Eisenhower force un seul quadrant par tâche.",
    base_score: 87,
  },
  "technical-architect": {
    persona_id: "direct-pragmatist",
    framework_id: "5-whys",
    rationale:
      "Architecture decisions need a technical owner who can drive a root-cause loop without sentiment.",
    rationale_fr:
      "Les décisions d'architecture réclament un·e architecte technique capable de mener une boucle de cause racine sans pathos.",
    base_score: 90,
  },
  "tech-lead": {
    persona_id: "direct-pragmatist",
    framework_id: "first-principles",
    rationale:
      "Engineering delivery needs a pragmatic lead who challenges assumptions via first-principles thinking.",
    rationale_fr:
      "La delivery technique nécessite un lead pragmatique qui remet en cause les hypothèses par les premiers principes.",
    base_score: 85,
  },
  "senior-developer": {
    persona_id: "precise-analyst",
    framework_id: "first-principles",
    rationale:
      "Complex code tasks benefit from an analytical, first-principles approach to avoid cargo-cult solutions.",
    rationale_fr:
      "Les tâches de code complexes gagnent avec une approche analytique et premiers principes pour éviter les solutions cargo-cult.",
    base_score: 83,
  },
  "qa-engineer": {
    persona_id: "precise-analyst",
    framework_id: "cynefin",
    rationale:
      "QA precision plus a Cynefin classification keeps the team out of premature fixes when the situation is complex or chaotic.",
    rationale_fr:
      "La précision QA et un classement Cynefin évitent les correctifs prématurés quand la situation est complexe ou chaotique.",
    base_score: 85,
  },
  "researcher": {
    persona_id: "formal-academic",
    framework_id: "mece",
    rationale:
      "Research outputs read better with a formal-academic voice structured by a MECE decomposition.",
    rationale_fr:
      "Les livrables de recherche se lisent mieux avec une voix formelle académique structurée par une décomposition MECE.",
    base_score: 86,
  },
  "business-strategist": {
    persona_id: "concise-executive",
    framework_id: "swot",
    rationale:
      "Strategic asks land best with an executive-concise voice and a SWOT scaffold for evidence.",
    rationale_fr:
      "Les demandes stratégiques passent mieux avec une voix exécutive concise et un cadre SWOT comme support de preuves.",
    base_score: 88,
  },
  "operations-manager": {
    persona_id: "concise-executive",
    framework_id: "raci",
    rationale:
      "Operations questions resolve faster with a concise-executive voice and a RACI to remove ownership ambiguity.",
    rationale_fr:
      "Les questions opérationnelles se résolvent plus vite avec une voix exécutive concise et un RACI pour lever l'ambiguïté de responsabilité.",
    base_score: 83,
  },
  "executive-coach": {
    persona_id: "warm-mentor",
    framework_id: "cynefin",
    rationale:
      "Coaching contexts call for a warm mentor voice and a sense-making framework, not a checklist.",
    rationale_fr:
      "Les contextes de coaching appellent une voix de mentor bienveillant et un cadre de sense-making, pas une checklist.",
    base_score: 90,
  },
};

/**
 * Score all roles against the goal using the keyword index.
 * Returns top N (up to 3) matched roles with their compositions.
 * If no role scores > 0, returns generic fallback (tech-lead).
 *
 * Fix for GitHub issue #3: keyword index FR+EN ensures "rédiger posts LinkedIn"
 * correctly returns copywriter instead of the generic tech-lead fallback.
 */
function scoreSuggestions(goal: string): ScoredSuggestion[] {
  const lower = goal.toLowerCase();

  // Score each role
  const scored: Array<{ role_id: string; score: number }> = ROLE_KEYWORDS.map(
    (entry) => ({
      role_id: entry.role_id,
      score: scoreRoleKeywords(lower, entry),
    }),
  );

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Filter to roles with score > 0 and take top 3
  const matched = scored.filter((r) => r.score > 0).slice(0, 3);

  if (matched.length === 0) {
    // Generic fallback when no keyword matches
    return [
      {
        role_id: "tech-lead",
        persona_id: "direct-pragmatist",
        framework_id: "first-principles",
        rationale:
          "Generic ask defaults to a tech lead with a direct voice and a first-principles loop to surface assumptions.",
        rationale_fr:
          "Demande générique : par défaut, un lead technique direct avec une boucle premiers principes pour révéler les hypothèses.",
        fit_score: 70,
      },
      {
        role_id: "product-manager",
        persona_id: "concise-executive",
        framework_id: "okr",
        rationale:
          "Backup recommendation: product-manager + concise-executive + OKR aligns intent with measurable outcomes.",
        rationale_fr:
          "Recommandation de secours : product-manager + exécutif concis + OKR aligne l'intention sur des résultats mesurables.",
        fit_score: 65,
      },
    ];
  }

  // Build suggestions from matched roles
  const suggestions: ScoredSuggestion[] = matched.map((r) => {
    const comp = ROLE_COMPOSITIONS[r.role_id];
    if (!comp) {
      // Defensive fallback for unknown role_id
      return {
        role_id: "tech-lead" as z.infer<typeof ROLE_ID>,
        persona_id: "direct-pragmatist" as z.infer<typeof PERSONA_ID>,
        framework_id: "first-principles" as z.infer<typeof FRAMEWORK_ID>,
        rationale: "Matched role composition not found — defaulting to tech-lead.",
        rationale_fr: "Composition du rôle introuvable — retour sur tech-lead.",
        fit_score: 70,
      };
    }

    // Normalize fit_score: scale keyword score into 0-100 range capped at base_score
    // base_score is the max possible for this role when it wins cleanly
    const normalizedScore = Math.min(comp.base_score, comp.base_score - 2 + Math.min(r.score * 2, 4));

    return {
      role_id: r.role_id as z.infer<typeof ROLE_ID>,
      persona_id: comp.persona_id,
      framework_id: comp.framework_id,
      rationale: comp.rationale,
      rationale_fr: comp.rationale_fr,
      fit_score: normalizedScore,
    };
  });

  // Ensure scores are monotonically non-increasing (already sorted by keyword score,
  // but enforce in case of ties)
  for (let i = 1; i < suggestions.length; i++) {
    const prev = suggestions[i - 1];
    const cur = suggestions[i];
    if (prev && cur && cur.fit_score > prev.fit_score) {
      suggestions[i] = { ...cur, fit_score: prev.fit_score };
    }
  }

  return suggestions;
}

export const tool = {
  name: "suggest_composition",
  description:
    "Suggest the best 1-3 Role + Persona + Framework combinations for a given goal. Use this whenever the user is unsure how to compose an agent or asks 'which kind of agent should I build for X' — even if they don't say 'suggest' explicitly.",
  description_fr:
    "Suggère les 1 à 3 meilleures combinaisons Rôle + Persona + Framework pour un objectif donné. Utilise-le quand l'utilisateur hésite sur comment composer un agent ou demande 'quel type d'agent construire pour X' — même s'il ne dit pas 'suggérer' explicitement.",
  inputSchema,
  outputSchema,
  handler: async (
    input: SuggestCompositionInput,
  ): Promise<SuggestCompositionOutput> => {
    const t0 = Date.now();
    const parsed = inputSchema.parse(input);
    const suggestions = scoreSuggestions(parsed.goal);
    const result: SuggestCompositionOutput = {
      suggestions,
      fetchedAt: new Date().toISOString(),
    };
    const validated = outputSchema.parse(result);
    logger.info({
      tool: "suggest_composition",
      duration_ms: Date.now() - t0,
      n_suggestions: suggestions.length,
    });
    void ROLES;
    void PERSONAS;
    void FRAMEWORK_STEPS;
    return validated;
  },
};
