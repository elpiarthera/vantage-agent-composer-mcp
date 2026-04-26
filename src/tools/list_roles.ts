import { z } from "zod";
import { ROLES, getRolesByCategory } from "../data/roles.js";
import { logger } from "../lib/logger.js";

export const inputSchema = z.object({
  category: z
    .enum(["technical", "creative", "analytical", "operational", "leadership", "all"])
    .default("all")
    .describe(
      "Filter category: 'all' (default) | 'technical' | 'creative' | 'analytical' | 'operational' | 'leadership'",
    ),
  locale: z
    .enum(["en", "fr"])
    .default("en")
    .describe("Locale: 'en' (default) | 'fr'"),
});

export const outputSchema = z.object({
  roles: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      name_fr: z.string(),
      category: z.string(),
      one_line: z.string(),
      one_line_fr: z.string(),
      typical_skills: z.array(z.string()),
      typical_skills_fr: z.array(z.string()),
    }),
  ),
  count: z.number(),
  fetchedAt: z.string().datetime(),
});

export type ListRolesInput = z.infer<typeof inputSchema>;
export type ListRolesOutput = z.infer<typeof outputSchema>;

export const tool = {
  name: "list_roles",
  description:
    "List all available agent roles for composition. Use this whenever the user wants to discover roles for technical, creative, analytical, operational, or leadership agent design — even if they don't say 'list' explicitly.",
  description_fr:
    "Liste tous les rôles d'agent disponibles pour composition. Utilise-le quand l'utilisateur veut découvrir des rôles pour l'agent design technique, créatif, analytique, opérationnel ou leadership — même s'il ne dit pas 'lister' explicitement.",
  inputSchema,
  outputSchema,
  handler: async (input: ListRolesInput): Promise<ListRolesOutput> => {
    const t0 = Date.now();
    const parsed = inputSchema.parse(input);
    const filtered = getRolesByCategory(parsed.category);
    const result: ListRolesOutput = {
      roles: filtered.map((r) => ({
        id: r.id,
        name: r.name,
        name_fr: r.name_fr,
        category: r.category,
        one_line: r.one_line,
        one_line_fr: r.one_line_fr,
        typical_skills: r.typical_skills,
        typical_skills_fr: r.typical_skills_fr,
      })),
      count: filtered.length,
      fetchedAt: new Date().toISOString(),
    };
    const validated = outputSchema.parse(result);
    logger.info({ tool: "list_roles", duration_ms: Date.now() - t0 });
    void ROLES;
    return validated;
  },
};
