import { z } from "zod";
import { ROLE_ID, PERSONA_ID, FRAMEWORK_ID } from "../schemas/index.js";
import { ROLES } from "../data/roles.js";
import { PERSONAS } from "../data/personas.js";
import { FRAMEWORK_STEPS } from "../data/framework-steps.js";
import { logger } from "../lib/logger.js";

export const inputSchema = z.object({
  goal: z
    .string()
    .min(20)
    .max(300)
    .describe("What you want the agent to accomplish"),
  constraints: z
    .array(z.string())
    .max(5)
    .optional()
    .describe("Optional constraints (e.g. 'must be concise', 'no jargon')"),
  locale: z.enum(["en", "fr"]).default("en"),
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
 * Lightweight keyword-driven heuristic. The point is *not* full NLP — the spec
 * §8 evals only require that the suggestions are deterministic, scored, and
 * align with obvious goals (e.g., "debug production incidents" → technical
 * roles + 5-whys). Real ranking is a Phase 2 LLM-assisted refinement.
 */
function scoreSuggestions(goal: string): ScoredSuggestion[] {
  const lower = goal.toLowerCase();
  const candidates: ScoredSuggestion[] = [];

  // Keyword buckets → weighted role/persona/framework triples.
  const recipes: Array<{
    keywords: string[];
    suggestion: ScoredSuggestion;
  }> = [
    {
      keywords: ["debug", "incident", "outage", "bug", "production", "rollback"],
      suggestion: {
        role_id: "technical-architect",
        persona_id: "direct-pragmatist",
        framework_id: "5-whys",
        rationale:
          "Production incidents need a technical owner who can drive a root-cause loop without sentiment.",
        rationale_fr:
          "Les incidents en production réclament un·e architecte technique capable de mener une boucle de cause racine sans pathos.",
        fit_score: 92,
      },
    },
    {
      keywords: ["debug", "incident", "outage", "bug", "production", "rollback"],
      suggestion: {
        role_id: "qa-engineer",
        persona_id: "precise-analyst",
        framework_id: "cynefin",
        rationale:
          "QA precision plus a Cynefin classification keeps the team out of premature fixes when the situation is complex or chaotic.",
        rationale_fr:
          "La précision QA et un classement Cynefin évitent les correctifs prématurés quand la situation est complexe ou chaotique.",
        fit_score: 85,
      },
    },
    {
      keywords: ["strategy", "roadmap", "market", "competitive", "positioning"],
      suggestion: {
        role_id: "business-strategist",
        persona_id: "concise-executive",
        framework_id: "swot",
        rationale:
          "Strategic asks land best with an executive-concise voice and a SWOT scaffold for evidence.",
        rationale_fr:
          "Les demandes stratégiques passent mieux avec une voix exécutive concise et un cadre SWOT comme support de preuves.",
        fit_score: 88,
      },
    },
    {
      keywords: ["coach", "leadership", "feedback", "team morale"],
      suggestion: {
        role_id: "executive-coach",
        persona_id: "warm-mentor",
        framework_id: "cynefin",
        rationale:
          "Coaching contexts call for a warm mentor voice and a sense-making framework, not a checklist.",
        rationale_fr:
          "Les contextes de coaching appellent une voix de mentor bienveillant et un cadre de sense-making, pas une checklist.",
        fit_score: 90,
      },
    },
    {
      keywords: ["copy", "headline", "campaign", "brand voice", "marketing"],
      suggestion: {
        role_id: "copywriter",
        persona_id: "playful-creative",
        framework_id: null,
        rationale:
          "Copy work benefits from a playful creative persona; an explicit framework would over-constrain ideation.",
        rationale_fr:
          "Le travail de copie gagne avec un persona créatif joueur ; un framework explicite contraindrait trop l'idéation.",
        fit_score: 80,
      },
    },
    {
      keywords: ["research", "literature", "study", "evidence"],
      suggestion: {
        role_id: "researcher",
        persona_id: "formal-academic",
        framework_id: "mece",
        rationale:
          "Research outputs read better with a formal-academic voice structured by a MECE decomposition.",
        rationale_fr:
          "Les livrables de recherche se lisent mieux avec une voix formelle académique structurée par une décomposition MECE.",
        fit_score: 86,
      },
    },
    {
      keywords: ["prioriti", "overload", "too many", "backlog", "decide between"],
      suggestion: {
        role_id: "product-manager",
        persona_id: "direct-pragmatist",
        framework_id: "eisenhower",
        rationale:
          "When everything feels urgent, a PM with the Eisenhower matrix forces a single quadrant per task.",
        rationale_fr:
          "Quand tout semble urgent, un·e PM avec la matrice d'Eisenhower force un seul quadrant par tâche.",
        fit_score: 87,
      },
    },
    {
      keywords: ["data", "analytic", "metric", "dashboard", "kpi"],
      suggestion: {
        role_id: "data-analyst",
        persona_id: "precise-analyst",
        framework_id: "pareto",
        rationale:
          "Data work pairs naturally with a precise-analyst voice and a Pareto lens to surface the vital few.",
        rationale_fr:
          "Le travail data se marie naturellement avec une voix d'analyste rigoureux et une lecture Pareto pour faire émerger l'essentiel.",
        fit_score: 84,
      },
    },
    {
      keywords: ["operation", "process", "scale", "vendor", "sla"],
      suggestion: {
        role_id: "operations-manager",
        persona_id: "concise-executive",
        framework_id: "raci",
        rationale:
          "Operations questions resolve faster with a concise-executive voice and a RACI to remove ownership ambiguity.",
        rationale_fr:
          "Les questions opérationnelles se résolvent plus vite avec une voix exécutive concise et un RACI pour lever l'ambiguïté de responsabilité.",
        fit_score: 83,
      },
    },
    {
      keywords: ["new product", "innovate", "blank page", "ideate"],
      suggestion: {
        role_id: "creative-director",
        persona_id: "playful-creative",
        framework_id: "design-thinking",
        rationale:
          "Greenfield innovation work benefits from a creative direction lens and a Design Thinking loop.",
        rationale_fr:
          "Le travail d'innovation en page blanche gagne avec un regard de direction créative et une boucle Design Thinking.",
        fit_score: 89,
      },
    },
  ];

  for (const recipe of recipes) {
    if (recipe.keywords.some((k) => lower.includes(k))) {
      candidates.push(recipe.suggestion);
    }
  }

  // Always provide a sensible fallback if nothing matched.
  if (candidates.length === 0) {
    candidates.push({
      role_id: "tech-lead",
      persona_id: "direct-pragmatist",
      framework_id: "first-principles",
      rationale:
        "Generic ask defaults to a tech lead with a direct voice and a first-principles loop to surface assumptions.",
      rationale_fr:
        "Demande générique : par défaut, un lead technique direct avec une boucle premiers principes pour révéler les hypothèses.",
      fit_score: 70,
    });
    candidates.push({
      role_id: "product-manager",
      persona_id: "concise-executive",
      framework_id: "okr",
      rationale:
        "Backup recommendation: product-manager + concise-executive + OKR aligns intent with measurable outcomes.",
      rationale_fr:
        "Recommandation de secours : product-manager + exécutif concis + OKR aligne l'intention sur des résultats mesurables.",
      fit_score: 65,
    });
  }

  // De-duplicate by role+persona+framework triple.
  const seen = new Set<string>();
  const unique = candidates.filter((c) => {
    const key = `${c.role_id}|${c.persona_id}|${c.framework_id ?? "none"}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort descending by fit_score, take top 3.
  unique.sort((a, b) => b.fit_score - a.fit_score);
  return unique.slice(0, 3);
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
