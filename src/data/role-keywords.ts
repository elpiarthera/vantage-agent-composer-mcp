/**
 * role-keywords.ts — Keyword index FR+EN per role for suggest_composition matching.
 *
 * Fix for GitHub issue #3: generic fallback (tech-lead) was returned even when
 * goal contained explicit role keywords (e.g. "rédiger posts LinkedIn" → copywriter).
 *
 * Design:
 *  - Each role has a flat keyword array (FR+EN mixed).
 *  - Tokenization is lowercase + word split (simple, no external deps).
 *  - Scoring: +2 for exact multi-word phrase match, +1 for single-word token match.
 *  - Highest scoring role wins. Zero score → generic fallback.
 *
 * Bilingual FR+EN by design (Critical Rule #1).
 * Source: bu-mcp spec §3 fix T3 | vantage-agent-composer v1.0.4
 */

export interface RoleKeywordEntry {
  role_id: string;
  /** Keywords / phrases, lowercase. Multi-word phrases scored higher than single tokens. */
  keywords: string[];
}

export const ROLE_KEYWORDS: RoleKeywordEntry[] = [
  {
    role_id: "copywriter",
    keywords: [
      // FR
      "rédiger",
      "rédaction",
      "post",
      "posts",
      "linkedin",
      "twitter",
      "blog",
      "newsletter",
      "copie",
      "texte",
      "accroche",
      "slogan",
      "tagline",
      "contenu",
      "écrire",
      "écriture",
      "publier",
      "publication",
      "rédacteur",
      "rédactrice",
      "storytelling",
      // EN
      "copy",
      "copywriting",
      "write",
      "writing",
      "draft",
      "compose",
      "post",
      "tweet",
      "headline",
      "tagline",
      "marketing copy",
      "email copy",
      "ad copy",
      "content",
      "brand voice",
      "content writing",
      "social media content",
    ],
  },
  {
    role_id: "creative-director",
    keywords: [
      // FR
      "créatif",
      "créative",
      "direction créative",
      "vision créative",
      "concept",
      "branding",
      "campagne",
      "identité visuelle",
      "direction artistique",
      "charte graphique",
      // EN
      "creative",
      "creative direction",
      "creative vision",
      "branding",
      "art direction",
      "campaign creative",
      "visual identity",
      "brand concept",
      "ideation",
      "new product",
      "innovate",
      "blank page",
      "ideate",
    ],
  },
  {
    role_id: "data-analyst",
    keywords: [
      // FR
      "données",
      "data",
      "analyse",
      "analyser",
      "statistiques",
      "tableau de bord",
      "indicateurs",
      "métriques",
      "tendance",
      "graphique",
      "rapport",
      "visualisation",
      // EN
      "data",
      "analytic",
      "analytics",
      "analyze",
      "analysis",
      "statistics",
      "dashboard",
      "metrics",
      "kpi",
      "trend",
      "chart",
      "reporting",
      "sql",
      "visualization",
      "dataset",
    ],
  },
  {
    role_id: "product-manager",
    keywords: [
      // FR
      "produit",
      "feature",
      "fonctionnalité",
      "roadmap",
      "feuille de route",
      "user story",
      "sprint",
      "backlog",
      "priorité",
      "prioriser",
      "prd",
      "cahier des charges produit",
      "problème utilisateur",
      // EN
      "product",
      "feature",
      "roadmap",
      "user story",
      "sprint",
      "prd",
      "product requirements",
      "prioritize",
      "prioritise",
      "prioriti",
      "overload",
      "too many",
      "backlog",
      "decide between",
      "product strategy",
      "product vision",
    ],
  },
  {
    role_id: "technical-architect",
    keywords: [
      // FR
      "architecture",
      "système distribué",
      "microservices",
      "scalabilité",
      "infrastructure",
      "api",
      "contrats d'api",
      "blueprint",
      "conception système",
      // EN
      "architecture",
      "system design",
      "distributed systems",
      "microservices",
      "scalability",
      "infrastructure",
      "api contracts",
      "design system",
      "tech stack",
      "cloud architecture",
    ],
  },
  {
    role_id: "tech-lead",
    keywords: [
      // FR
      "code",
      "implémenter",
      "refactoring",
      "ci/cd",
      "pipeline",
      "déployer",
      "livraison",
      "équipe technique",
      "dette technique",
      // EN
      "code",
      "implement",
      "refactor",
      "ci/cd",
      "deploy",
      "build pipeline",
      "delivery",
      "tech team",
      "tech debt",
      "engineering team",
      "ship",
    ],
  },
  {
    role_id: "senior-developer",
    keywords: [
      // FR
      "développement",
      "code",
      "bug",
      "debug",
      "debugger",
      "revue de code",
      "pull request",
      "tests unitaires",
      // EN
      "development",
      "coding",
      "debugging",
      "code review",
      "pull request",
      "unit tests",
      "refactoring",
      "pair programming",
    ],
  },
  {
    role_id: "qa-engineer",
    keywords: [
      // FR
      "tests",
      "qa",
      "régression",
      "qualité",
      "scénario de test",
      "automatisation des tests",
      "bug",
      // EN
      "test",
      "qa",
      "playwright",
      "regression",
      "bug",
      "quality assurance",
      "test automation",
      "test plan",
      "test coverage",
      "incident",
      "outage",
      "production",
      "rollback",
    ],
  },
  {
    role_id: "researcher",
    keywords: [
      // FR
      "recherche",
      "étude",
      "revue de littérature",
      "enquête",
      "analyser",
      "investigation",
      "veille",
      // EN
      "research",
      "literature review",
      "study",
      "evidence",
      "investigate",
      "survey",
      "academic",
      "sources",
      "findings",
    ],
  },
  {
    role_id: "business-strategist",
    keywords: [
      // FR
      "stratégie",
      "marché",
      "concurrents",
      "positionnement",
      "go-to-market",
      "swot",
      "analyse concurrentielle",
      "croissance",
      "business model",
      // EN
      "strategy",
      "strategic",
      "market",
      "competitor",
      "go-to-market",
      "positioning",
      "swot",
      "competitive analysis",
      "growth",
      "business model",
      "roadmap",
      "competitive",
    ],
  },
  {
    role_id: "operations-manager",
    keywords: [
      // FR
      "opérations",
      "ops",
      "processus",
      "procédure",
      "sop",
      "logistique",
      "fournisseur",
      "sla",
      "vendor",
      // EN
      "operations",
      "ops",
      "process",
      "sop",
      "supply",
      "logistics",
      "vendor",
      "sla",
      "scale",
      "workflow",
      "procedure",
    ],
  },
  {
    role_id: "executive-coach",
    keywords: [
      // FR
      "coaching",
      "leadership",
      "dirigeant",
      "manager",
      "feedback",
      "mentorat",
      "carrière",
      "développement personnel",
      "1:1",
      // EN
      "coach",
      "coaching",
      "leadership",
      "1:1",
      "one-on-one",
      "feedback",
      "mentoring",
      "career",
      "team morale",
      "executive",
      "development",
    ],
  },
];

/**
 * Score a goal string against a single role's keyword list.
 * Returns a score ≥ 0.
 *  - Multi-word phrase match: +3 per hit (exact substring match on lowercased goal)
 *  - Single-word token match: +1 per hit
 */
export function scoreRoleKeywords(
  lowerGoal: string,
  entry: RoleKeywordEntry,
): number {
  let score = 0;
  for (const kw of entry.keywords) {
    if (kw.includes(" ")) {
      // Multi-word phrase: check substring match, worth more
      if (lowerGoal.includes(kw)) {
        score += 3;
      }
    } else {
      // Single token: check whole-word-ish match (includes is fine for short phrases)
      if (lowerGoal.includes(kw)) {
        score += 1;
      }
    }
  }
  return score;
}
