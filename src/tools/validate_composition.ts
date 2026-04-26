import { z } from "zod";
import { ROLE_ID, PERSONA_ID, FRAMEWORK_ID } from "../schemas/index.js";
import { getRoleById } from "../data/roles.js";
import { getPersonaById } from "../data/personas.js";
import { getFrameworkSteps } from "../data/framework-steps.js";
import { logger } from "../lib/logger.js";
import { ComposerError } from "../lib/errors.js";

export const inputSchema = z.object({
  role_id: ROLE_ID,
  persona_id: PERSONA_ID,
  framework_id: FRAMEWORK_ID.optional(),
  skills: z.array(z.string()).optional(),
  locale: z
    .enum(["en", "fr"])
    .default("en")
    .describe("Locale: 'en' (default) | 'fr'"),
});

export const outputSchema = z.object({
  valid: z.boolean(),
  warnings: z.array(
    z.object({
      severity: z.enum(["info", "warning", "error"]),
      message: z.string(),
      message_fr: z.string(),
    }),
  ),
  recommendations: z.array(z.string()),
  recommendations_fr: z.array(z.string()),
  compatibility_score: z.number().min(0).max(100),
  fetchedAt: z.string().datetime(),
});

export type ValidateCompositionInput = z.infer<typeof inputSchema>;
export type ValidateCompositionOutput = z.infer<typeof outputSchema>;

interface BilingualWarning {
  severity: "info" | "warning" | "error";
  message: string;
  message_fr: string;
}

interface ClashRule {
  persona: z.infer<typeof PERSONA_ID>;
  role: z.infer<typeof ROLE_ID>;
  severity: "info" | "warning" | "error";
  message: string;
  message_fr: string;
}

const PERSONA_ROLE_CLASHES: ClashRule[] = [
  {
    persona: "provocative-challenger",
    role: "warm-mentor" as never, // not a role; placeholder to keep types narrow
    severity: "warning",
    message:
      "provocative-challenger persona conflicts with mentoring roles; expect harsh feedback by default.",
    message_fr:
      "Le persona provocateur entre en conflit avec les rôles de mentorat ; attends-toi à un feedback sec par défaut.",
  },
];

// Real persona-role compatibility matrix (the rule above used a placeholder
// to illustrate type safety; we now express the real clashes between a
// persona axis and a role's interaction style).
interface PersonaRoleClash {
  persona: z.infer<typeof PERSONA_ID>;
  role: z.infer<typeof ROLE_ID>;
  severity: "info" | "warning" | "error";
  message: string;
  message_fr: string;
}

const REAL_CLASHES: PersonaRoleClash[] = [
  {
    persona: "provocative-challenger",
    role: "executive-coach",
    severity: "warning",
    message:
      "A provocative-challenger persona clashes with the holding-space stance expected of an executive-coach.",
    message_fr:
      "Le persona challengeur provocateur entre en conflit avec la posture d'écoute attendue d'un coach exécutif.",
  },
  {
    persona: "playful-creative",
    role: "qa-engineer",
    severity: "info",
    message:
      "A playful-creative persona is unusual for a QA-engineer role; the agent may downplay rigour.",
    message_fr:
      "Un persona créatif joueur est inhabituel pour un rôle d'ingénieur QA ; l'agent risque de minorer la rigueur.",
  },
  {
    persona: "concise-executive",
    role: "researcher",
    severity: "info",
    message:
      "A concise-executive persona may compress nuances a researcher role usually preserves.",
    message_fr:
      "Un persona exécutif concis peut écraser les nuances qu'un rôle de chercheur préserve d'habitude.",
  },
  {
    persona: "warm-mentor",
    role: "qa-engineer",
    severity: "info",
    message:
      "A warm-mentor persona softens findings; ensure escalation paths remain explicit for production-blocking bugs.",
    message_fr:
      "Un persona mentor bienveillant adoucit les constats ; garde des chemins d'escalade explicites pour les bugs bloquants.",
  },
  {
    persona: "empathetic-listener",
    role: "operations-manager",
    severity: "info",
    message:
      "Empathetic-listener persona may slow incident triage if applied without escalation rules.",
    message_fr:
      "Le persona écoutant empathique peut ralentir le triage d'incidents s'il est appliqué sans règles d'escalade.",
  },
];

function detectClashes(
  roleId: z.infer<typeof ROLE_ID>,
  personaId: z.infer<typeof PERSONA_ID>,
): BilingualWarning[] {
  const out: BilingualWarning[] = [];
  for (const c of REAL_CLASHES) {
    if (c.role === roleId && c.persona === personaId) {
      out.push({
        severity: c.severity,
        message: c.message,
        message_fr: c.message_fr,
      });
    }
  }
  return out;
}

export const tool = {
  name: "validate_composition",
  description:
    "Validate a Role + Persona + Framework + Skills composition for compatibility and best practices. Use this whenever the user wants to check an agent design before deploying it, or asks 'is this combination good' — even if they don't say 'validate' explicitly.",
  description_fr:
    "Valide une composition Rôle + Persona + Framework + Skills pour la compatibilité et les bonnes pratiques. Utilise-le quand l'utilisateur veut vérifier un design d'agent avant déploiement ou demande 'est-ce une bonne combinaison' — même s'il ne dit pas 'valider' explicitement.",
  inputSchema,
  outputSchema,
  handler: async (
    input: ValidateCompositionInput,
  ): Promise<ValidateCompositionOutput> => {
    const t0 = Date.now();
    const parsed = inputSchema.parse(input);

    const role = getRoleById(parsed.role_id);
    if (!role) throw new ComposerError("ROLE_NOT_FOUND", parsed.locale);
    const persona = getPersonaById(parsed.persona_id);
    if (!persona) throw new ComposerError("PERSONA_NOT_FOUND", parsed.locale);
    if (parsed.framework_id) {
      // Will return undefined only if missing; map keys cover all enum values.
      const fw = getFrameworkSteps(parsed.framework_id);
      if (!fw) throw new ComposerError("FRAMEWORK_NOT_FOUND", parsed.locale);
    }

    const warnings: BilingualWarning[] = [];
    const recommendations: string[] = [];
    const recommendations_fr: string[] = [];

    // Persona-role clash detection.
    warnings.push(...detectClashes(parsed.role_id, parsed.persona_id));

    // Framework optional info.
    if (!parsed.framework_id) {
      warnings.push({
        severity: "info",
        message:
          "No framework selected; the agent will rely on its default reasoning.",
        message_fr:
          "Aucun framework sélectionné ; l'agent s'appuiera sur son raisonnement par défaut.",
      });
      recommendations.push(
        "Consider attaching a framework_id (e.g., '5-whys' for diagnostics, 'okr' for goal alignment).",
      );
      recommendations_fr.push(
        "Envisage d'attacher un framework_id (ex. '5-whys' pour le diagnostic, 'okr' pour l'alignement d'objectifs).",
      );
    }

    // Skills empty info.
    const skills = parsed.skills ?? [];
    if (skills.length === 0) {
      warnings.push({
        severity: "info",
        message: "No skills provided; consider adding 1-3 skills.",
        message_fr:
          "Aucune compétence fournie ; envisage d'en ajouter 1 à 3.",
      });
      recommendations.push(
        `Pick 1-3 skills typical for the ${role.name} role (e.g., ${role.typical_skills.slice(0, 3).join(", ")}).`,
      );
      recommendations_fr.push(
        `Choisis 1 à 3 compétences typiques du rôle ${role.name_fr} (ex. ${role.typical_skills_fr.slice(0, 3).join(", ")}).`,
      );
    } else if (skills.length > 10) {
      warnings.push({
        severity: "warning",
        message: "More than 10 skills risks diluting the agent's focus.",
        message_fr:
          "Plus de 10 compétences risquent de diluer le focus de l'agent.",
      });
    }

    // Compatibility score : start at 100, subtract per warning by severity.
    let score = 100;
    for (const w of warnings) {
      if (w.severity === "info") score -= 5;
      else if (w.severity === "warning") score -= 15;
      else score -= 30;
    }
    if (score < 0) score = 0;
    const valid = !warnings.some((w) => w.severity === "error");

    const result: ValidateCompositionOutput = {
      valid,
      warnings,
      recommendations,
      recommendations_fr,
      compatibility_score: score,
      fetchedAt: new Date().toISOString(),
    };
    const validated = outputSchema.parse(result);
    logger.info({
      tool: "validate_composition",
      duration_ms: Date.now() - t0,
      score,
      n_warnings: warnings.length,
    });
    void PERSONA_ROLE_CLASHES;
    return validated;
  },
};
