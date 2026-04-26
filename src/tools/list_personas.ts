import { z } from "zod";
import { PERSONAS, getPersonasByAxis } from "../data/personas.js";
import { logger } from "../lib/logger.js";

export const inputSchema = z.object({
  axis: z
    .enum(["formality", "energy", "directness", "domain_focus", "all"])
    .default("all")
    .describe("Filter personas by axis"),
  locale: z.enum(["en", "fr"]).default("en").describe("Locale for descriptions"),
});

export const outputSchema = z.object({
  personas: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      name_fr: z.string(),
      axis: z.string(),
      voice_traits: z.array(z.string()),
      voice_traits_fr: z.array(z.string()),
      sample_phrase: z.string(),
      sample_phrase_fr: z.string(),
    }),
  ),
  count: z.number(),
  fetchedAt: z.string().datetime(),
});

export type ListPersonasInput = z.infer<typeof inputSchema>;
export type ListPersonasOutput = z.infer<typeof outputSchema>;

export const tool = {
  name: "list_personas",
  description:
    "List all available agent personas — voice, tone, communication style. Use this whenever the user wants to discover personas to shape an agent's communication style — even if they don't say 'list' explicitly.",
  description_fr:
    "Liste tous les personas d'agent disponibles — voix, ton, style de communication. Utilise-le quand l'utilisateur veut découvrir des personas pour façonner le style de communication d'un agent — même s'il ne dit pas 'lister' explicitement.",
  inputSchema,
  outputSchema,
  handler: async (input: ListPersonasInput): Promise<ListPersonasOutput> => {
    const t0 = Date.now();
    const parsed = inputSchema.parse(input);
    const filtered = getPersonasByAxis(parsed.axis);
    const result: ListPersonasOutput = {
      personas: filtered.map((p) => ({
        id: p.id,
        name: p.name,
        name_fr: p.name_fr,
        axis: p.axis,
        voice_traits: p.voice_traits,
        voice_traits_fr: p.voice_traits_fr,
        sample_phrase: p.sample_phrase,
        sample_phrase_fr: p.sample_phrase_fr,
      })),
      count: filtered.length,
      fetchedAt: new Date().toISOString(),
    };
    const validated = outputSchema.parse(result);
    logger.info({ tool: "list_personas", duration_ms: Date.now() - t0 });
    void PERSONAS;
    return validated;
  },
};
