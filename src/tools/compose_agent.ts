import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  ROLE_ID,
  PERSONA_ID,
  FRAMEWORK_ID,
  COMPOSITION_FORMAT,
} from "../schemas/index.js";
import { getRoleById } from "../data/roles.js";
import { getPersonaById } from "../data/personas.js";
import { getFrameworkSteps } from "../data/framework-steps.js";
import { logger } from "../lib/logger.js";
import { t } from "../lib/i18n.js";
import { ComposerError } from "../lib/errors.js";
import { getEnrichmentEntry } from "../data/role-persona-examples.js";

export const inputSchema = z.object({
  role_id: ROLE_ID,
  persona_id: PERSONA_ID,
  framework_id: FRAMEWORK_ID.optional().describe(
    "Optional reasoning framework (composes with @vantageos/mcp-frameworks catalog)",
  ),
  skills: z
    .array(z.string().min(2).max(64))
    .max(10)
    .optional()
    .describe(
      "Optional list of skill names (custom strings or skill IDs from VantageRegistry)",
    ),
  context: z
    .string()
    .min(20)
    .max(500)
    .describe("Brief context for the agent's purpose (20-500 chars)"),
  locale: z
    .enum(["en", "fr"])
    .default("en")
    .describe("Locale: 'en' (default) | 'fr'"),
  format: COMPOSITION_FORMAT.default("system_prompt"),
  enrichment_level: z
    .enum(["minimal", "standard", "verbose"])
    .default("standard")
    .describe(
      "Enrichment depth: 'minimal' (v1.0.x compat — no enrichment sections) | 'standard' (default — adds EXAMPLES + DOS + DONTS) | 'verbose' (adds EXAMPLES + DOS + DONTS + OUTPUT FORMAT)",
    ),
});

// MINOR FIX #1: framework typed via FRAMEWORK_ID.nullable() (symmetric typing).
export const outputSchema = z.object({
  agent_id: z.string().describe("Generated UUID for this composition"),
  role: z.string(),
  persona: z.string(),
  framework: FRAMEWORK_ID.nullable(),
  skills: z.array(z.string()),
  composed_output: z
    .string()
    .describe("The composed agent representation in the requested format"),
  composition_notes: z
    .array(z.string())
    .describe("Notes on how the elements interact"),
  format: z.string(),
  fetchedAt: z.string().datetime(),
});

export type ComposeAgentInput = z.infer<typeof inputSchema>;
export type ComposeAgentOutput = z.infer<typeof outputSchema>;

function renderSystemPrompt(args: {
  roleName: string;
  voiceTraits: string[];
  frameworkName: string | null;
  frameworkSteps: string[] | null;
  skills: string[];
  context: string;
  locale: "en" | "fr";
}): string {
  const {
    roleName,
    voiceTraits,
    frameworkName,
    frameworkSteps,
    skills,
    context,
    locale,
  } = args;
  if (locale === "fr") {
    const lines: string[] = [];
    lines.push(`Tu es un·e ${roleName}.`);
    lines.push("");
    lines.push(`VOIX & TON : ${voiceTraits.join(", ")}.`);
    lines.push("");
    if (frameworkName && frameworkSteps) {
      lines.push(
        `FRAMEWORK DE RAISONNEMENT : Pour aborder les problèmes, utilise l'approche structurée de ${frameworkName} : ${frameworkSteps.join(" → ")}.`,
      );
    } else {
      lines.push(
        "FRAMEWORK DE RAISONNEMENT : aucun framework imposé ; raisonne pas-à-pas en explicitant tes hypothèses.",
      );
    }
    lines.push("");
    lines.push(
      `CAPACITÉS : ${skills.length > 0 ? skills.join(", ") : "non précisées"}.`,
    );
    lines.push("");
    lines.push(`CONTEXTE : ${context}.`);
    return lines.join("\n");
  }
  const lines: string[] = [];
  lines.push(`You are a ${roleName}.`);
  lines.push("");
  lines.push(`VOICE & TONE: ${voiceTraits.join(", ")}.`);
  lines.push("");
  if (frameworkName && frameworkSteps) {
    lines.push(
      `REASONING FRAMEWORK: When approaching problems, use ${frameworkName}'s structured approach: ${frameworkSteps.join(" → ")}.`,
    );
  } else {
    lines.push(
      "REASONING FRAMEWORK: none imposed; reason step by step and surface your assumptions.",
    );
  }
  lines.push("");
  lines.push(
    `CAPABILITIES: ${skills.length > 0 ? skills.join(", ") : "unspecified"}.`,
  );
  lines.push("");
  lines.push(`CONTEXT: ${context}.`);
  return lines.join("\n");
}

function renderJsonDefinition(args: {
  agentId: string;
  roleId: string;
  roleName: string;
  personaId: string;
  personaName: string;
  voiceTraits: string[];
  frameworkId: string | null;
  frameworkName: string | null;
  frameworkSteps: string[] | null;
  skills: string[];
  context: string;
  locale: "en" | "fr";
  enrichmentEntry?: import("../data/role-persona-examples.js").EnrichmentEntry;
  enrichmentLevel?: "minimal" | "standard" | "verbose";
}): string {
  const loc = args.locale;
  const entry = args.enrichmentEntry;
  const level = args.enrichmentLevel ?? "minimal";

  let enrichmentPayload: Record<string, unknown> | null = null;
  if (level !== "minimal" && entry) {
    const examples = loc === "fr" ? entry.examples.fr : entry.examples.en;
    const dos = loc === "fr" ? entry.dos.fr : entry.dos.en;
    const donts = loc === "fr" ? entry.donts.fr : entry.donts.en;
    enrichmentPayload = { examples, dos, donts };
    if (level === "verbose") {
      enrichmentPayload.output_format =
        loc === "fr" ? entry.output_format.fr : entry.output_format.en;
    }
  } else if (level !== "minimal" && !entry) {
    enrichmentPayload = {
      caveat:
        loc === "fr"
          ? "Couverture MVP-12 : cette combinaison n'est pas dans la matrice d'enrichissement — structure générique utilisée. Feuille de route : expansion incrémentale v1.1.x."
          : "MVP-12 coverage. Combo (role × persona) not in enrichment matrix — using generic structure. Roadmap: v1.1.x incremental expansion per user demand signal.",
    };
  }

  const payload: Record<string, unknown> = {
    agent_id: args.agentId,
    locale: args.locale,
    role: { id: args.roleId, name: args.roleName },
    persona: {
      id: args.personaId,
      name: args.personaName,
      voice_traits: args.voiceTraits,
    },
    framework:
      args.frameworkId && args.frameworkName
        ? {
            id: args.frameworkId,
            name: args.frameworkName,
            steps: args.frameworkSteps ?? [],
          }
        : null,
    skills: args.skills,
    context: args.context,
    composed_at: new Date().toISOString(),
  };

  if (enrichmentPayload) {
    payload.enrichment = enrichmentPayload;
  }

  return JSON.stringify(payload, null, 2);
}

function renderMarkdownCard(args: {
  agentId: string;
  roleName: string;
  personaName: string;
  voiceTraits: string[];
  frameworkName: string | null;
  frameworkSteps: string[] | null;
  skills: string[];
  context: string;
  locale: "en" | "fr";
}): string {
  const fr = args.locale === "fr";
  const headers = fr
    ? {
        title: "Agent composé",
        agentId: "ID de l'agent",
        role: "Rôle",
        persona: "Persona",
        voice: "Voix & ton",
        framework: "Framework de raisonnement",
        none: "aucun",
        skills: "Compétences",
        none_skills: "non précisées",
        context: "Contexte",
        steps: "Étapes",
      }
    : {
        title: "Composed Agent",
        agentId: "Agent ID",
        role: "Role",
        persona: "Persona",
        voice: "Voice & tone",
        framework: "Reasoning framework",
        none: "none",
        skills: "Skills",
        none_skills: "unspecified",
        context: "Context",
        steps: "Steps",
      };
  const lines: string[] = [];
  lines.push(`# ${headers.title}`);
  lines.push("");
  lines.push(`- **${headers.agentId}**: ${args.agentId}`);
  lines.push(`- **${headers.role}**: ${args.roleName}`);
  lines.push(`- **${headers.persona}**: ${args.personaName}`);
  lines.push(`- **${headers.voice}**: ${args.voiceTraits.join(", ")}`);
  lines.push(
    `- **${headers.framework}**: ${args.frameworkName ?? headers.none}`,
  );
  if (args.frameworkSteps && args.frameworkSteps.length > 0) {
    lines.push(`  - **${headers.steps}**: ${args.frameworkSteps.join(" → ")}`);
  }
  lines.push(
    `- **${headers.skills}**: ${args.skills.length > 0 ? args.skills.join(", ") : headers.none_skills}`,
  );
  lines.push("");
  lines.push(`## ${headers.context}`);
  lines.push("");
  lines.push(args.context);
  return lines.join("\n");
}

/**
 * Builds the enrichment block appended to any composed output format.
 * Returns empty string for "minimal" or when no matrix entry exists.
 */
function renderEnrichmentBlock(args: {
  roleId: string;
  personaId: string;
  level: "minimal" | "standard" | "verbose";
  locale: "en" | "fr";
}): string {
  const { roleId, personaId, level, locale } = args;
  if (level === "minimal") return "";

  const entry = getEnrichmentEntry(roleId, personaId);
  if (!entry) {
    // Graceful fallback: caveat only
    if (locale === "fr") {
      return "\n\n---\n⚠ Couverture MVP-12 : cette combinaison (rôle × persona) n'est pas dans la matrice d'enrichissement — structure générique utilisée. Feuille de route : expansion incrémentale v1.1.x selon les signaux de demande utilisateur.";
    }
    return "\n\n---\n⚠ MVP-12 coverage. Combo (role × persona) not in enrichment matrix — using generic structure. Roadmap: v1.1.x incremental expansion per user demand signal.";
  }

  const lines: string[] = [];

  // EXAMPLES + DOS + DONTS always in standard and verbose
  const examples = locale === "fr" ? entry.examples.fr : entry.examples.en;
  const dos = locale === "fr" ? entry.dos.fr : entry.dos.en;
  const donts = locale === "fr" ? entry.donts.fr : entry.donts.en;

  if (locale === "fr") {
    lines.push("\n\n---");
    lines.push("## EXEMPLES");
    examples.forEach((ex) => lines.push(`- ${ex}`));
    lines.push("\n## À FAIRE");
    dos.forEach((d) => lines.push(`- ${d}`));
    lines.push("\n## À ÉVITER");
    donts.forEach((d) => lines.push(`- ${d}`));
    if (level === "verbose") {
      lines.push("\n## FORMAT DE SORTIE ATTENDU");
      lines.push(entry.output_format.fr);
    }
  } else {
    lines.push("\n\n---");
    lines.push("## EXAMPLES");
    examples.forEach((ex) => lines.push(`- ${ex}`));
    lines.push("\n## DOS");
    dos.forEach((d) => lines.push(`- ${d}`));
    lines.push("\n## DONTS");
    donts.forEach((d) => lines.push(`- ${d}`));
    if (level === "verbose") {
      lines.push("\n## EXPECTED OUTPUT FORMAT");
      lines.push(entry.output_format.en);
    }
  }

  return lines.join("\n");
}

export const tool = {
  name: "compose_agent",
  description:
    "Compose a complete AI agent definition by mixing a Role + Persona + Framework + Skills. Use this whenever the user wants to design an agent, define a sub-agent's identity, or specify a custom AI assistant — even if they don't say 'compose' explicitly.",
  description_fr:
    "Compose une définition complète d'agent IA en mixant Rôle + Persona + Framework + Skills. Utilise-le quand l'utilisateur veut concevoir un agent, définir un sous-agent ou spécifier un assistant IA custom — même s'il ne dit pas 'composer' explicitement.",
  inputSchema,
  outputSchema,
  handler: async (input: ComposeAgentInput): Promise<ComposeAgentOutput> => {
    const t0 = Date.now();
    const parsed = inputSchema.parse(input);
    const role = getRoleById(parsed.role_id);
    if (!role) throw new ComposerError("ROLE_NOT_FOUND", parsed.locale);
    const persona = getPersonaById(parsed.persona_id);
    if (!persona) throw new ComposerError("PERSONA_NOT_FOUND", parsed.locale);

    const fwEntry = parsed.framework_id
      ? getFrameworkSteps(parsed.framework_id)
      : null;

    const locale = parsed.locale;
    const roleName = locale === "fr" ? role.name_fr : role.name;
    const personaName = locale === "fr" ? persona.name_fr : persona.name;
    const voiceTraits =
      locale === "fr" ? persona.voice_traits_fr : persona.voice_traits;
    const frameworkName = fwEntry
      ? locale === "fr"
        ? fwEntry.name_fr
        : fwEntry.name
      : null;
    const frameworkSteps = fwEntry
      ? locale === "fr"
        ? fwEntry.steps_fr
        : fwEntry.steps
      : null;

    const skills = parsed.skills ?? [];
    const agentId = randomUUID();

    const enrichmentEntry = getEnrichmentEntry(role.id, persona.id);
    const enrichmentBlock = renderEnrichmentBlock({
      roleId: role.id,
      personaId: persona.id,
      level: parsed.enrichment_level,
      locale,
    });

    let composedOutput: string;
    if (parsed.format === "system_prompt") {
      composedOutput =
        renderSystemPrompt({
          roleName,
          voiceTraits,
          frameworkName,
          frameworkSteps,
          skills,
          context: parsed.context,
          locale,
        }) + enrichmentBlock;
    } else if (parsed.format === "json_definition") {
      // For JSON format, enrichment is embedded inside the JSON object (not appended as text)
      composedOutput = renderJsonDefinition({
        agentId,
        roleId: role.id,
        roleName,
        personaId: persona.id,
        personaName,
        voiceTraits,
        frameworkId: fwEntry?.id ?? null,
        frameworkName,
        frameworkSteps,
        skills,
        context: parsed.context,
        locale,
        enrichmentEntry,
        enrichmentLevel: parsed.enrichment_level,
      });
    } else {
      composedOutput =
        renderMarkdownCard({
          agentId,
          roleName,
          personaName,
          voiceTraits,
          frameworkName,
          frameworkSteps,
          skills,
          context: parsed.context,
          locale,
        }) + enrichmentBlock;
    }

    const compositionNotes: string[] = [];
    compositionNotes.push(
      fwEntry
        ? t("compose.note.framework_used", locale)
        : t("compose.note.no_framework", locale),
    );
    if (skills.length === 0) {
      compositionNotes.push(t("validate.skills_empty", locale));
    }

    const result: ComposeAgentOutput = {
      agent_id: agentId,
      role: role.id,
      persona: persona.id,
      framework: fwEntry?.id ?? null,
      skills,
      composed_output: composedOutput,
      composition_notes: compositionNotes,
      format: parsed.format,
      fetchedAt: new Date().toISOString(),
    };
    const validated = outputSchema.parse(result);
    logger.info({
      tool: "compose_agent",
      duration_ms: Date.now() - t0,
      format: parsed.format,
      framework: fwEntry?.id ?? null,
    });
    return validated;
  },
};
