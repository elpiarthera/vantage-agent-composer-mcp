/**
 * Role catalog — 12 curated roles for agent composition.
 *
 * Bilingual FR+EN by design (Critical Rule #1).
 * French strings are handcrafted (no machine translation).
 * Source : spec §6.1 (vantage-agent-composer v1.0).
 *
 * Each record exposes:
 *  - id : stable kebab-case identifier (matches ROLE_ID enum)
 *  - name / name_fr : display name
 *  - category : technical | creative | analytical | operational | leadership
 *  - one_line / one_line_fr : ≤ 140 chars pitch
 *  - typical_skills : EN array of skill labels
 *  - typical_skills_fr : FR equivalents (MINOR FIX #6)
 */
import type { RoleId, RoleCategory } from "../schemas/index.js";

export interface RoleRecord {
  id: RoleId;
  name: string;
  name_fr: string;
  category: RoleCategory;
  one_line: string;
  one_line_fr: string;
  typical_skills: string[];
  typical_skills_fr: string[];
}

export const ROLES: RoleRecord[] = [
  {
    id: "technical-architect",
    name: "Technical Architect",
    name_fr: "Architecte technique",
    category: "technical",
    one_line: "Designs system blueprints, owns technical trade-offs across services and teams.",
    one_line_fr: "Conçoit les plans système, arbitre les compromis techniques entre services et équipes.",
    typical_skills: ["system design", "trade-off analysis", "API contracts", "scalability", "documentation"],
    typical_skills_fr: ["conception système", "analyse de compromis", "contrats d'API", "scalabilité", "documentation"],
  },
  {
    id: "senior-developer",
    name: "Senior Developer",
    name_fr: "Développeur senior",
    category: "technical",
    one_line: "Ships production-grade code, mentors juniors, balances velocity and quality.",
    one_line_fr: "Livre du code de qualité production, accompagne les juniors, équilibre vélocité et qualité.",
    typical_skills: ["code review", "refactoring", "testing", "debugging", "mentoring"],
    typical_skills_fr: ["revue de code", "refactoring", "tests", "debugging", "mentorat"],
  },
  {
    id: "qa-engineer",
    name: "QA Engineer",
    name_fr: "Ingénieur QA",
    category: "technical",
    one_line: "Defines test strategy, hunts edge cases, prevents regressions before they ship.",
    one_line_fr: "Définit la stratégie de test, traque les cas limites, prévient les régressions avant la mise en production.",
    typical_skills: ["test strategy", "edge cases", "automation", "exploratory testing", "regression analysis"],
    typical_skills_fr: ["stratégie de test", "cas limites", "automatisation", "tests exploratoires", "analyse de régression"],
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    name_fr: "Analyste de données",
    category: "analytical",
    one_line: "Turns raw data into decisions through clean queries, charts, and clear narratives.",
    one_line_fr: "Transforme la donnée brute en décisions à travers requêtes propres, graphiques et récits clairs.",
    typical_skills: ["SQL", "data wrangling", "visualization", "statistics", "storytelling with data"],
    typical_skills_fr: ["SQL", "préparation de données", "visualisation", "statistiques", "storytelling data"],
  },
  {
    id: "product-manager",
    name: "Product Manager",
    name_fr: "Product Manager",
    category: "leadership",
    one_line: "Owns the why, prioritises ruthlessly, aligns engineering, design and business on a single roadmap.",
    one_line_fr: "Porte le pourquoi, priorise sans concession, aligne ingénierie, design et business sur une feuille de route unique.",
    typical_skills: ["prioritisation", "user research", "roadmapping", "stakeholder management", "metrics"],
    typical_skills_fr: ["priorisation", "recherche utilisateur", "roadmap", "gestion des parties prenantes", "métriques"],
  },
  {
    id: "creative-director",
    name: "Creative Director",
    name_fr: "Directeur créatif",
    category: "creative",
    one_line: "Sets the visual and narrative direction, protects the brand, raises the team's aesthetic ceiling.",
    one_line_fr: "Fixe la direction visuelle et narrative, protège la marque, élève le plafond esthétique de l'équipe.",
    typical_skills: ["art direction", "brand systems", "concept development", "team coaching", "critique"],
    typical_skills_fr: ["direction artistique", "systèmes de marque", "développement de concept", "coaching d'équipe", "critique constructive"],
  },
  {
    id: "copywriter",
    name: "Copywriter",
    name_fr: "Concepteur-rédacteur",
    category: "creative",
    one_line: "Writes the words that move people — short, sharp, on brand, on benefit.",
    one_line_fr: "Écrit les mots qui font bouger les gens — courts, nets, sur la marque, sur le bénéfice.",
    typical_skills: ["headlines", "benefit framing", "tone of voice", "AIDA / PAS", "editing"],
    typical_skills_fr: ["accroches", "cadrage du bénéfice", "ton de voix", "AIDA / PAS", "édition"],
  },
  {
    id: "researcher",
    name: "Researcher",
    name_fr: "Chercheur",
    category: "analytical",
    one_line: "Gathers evidence, separates signal from noise, produces synthesis stakeholders trust.",
    one_line_fr: "Collecte les preuves, sépare le signal du bruit, produit des synthèses dignes de confiance.",
    typical_skills: ["literature review", "interviews", "synthesis", "source criticism", "writing for clarity"],
    typical_skills_fr: ["revue de littérature", "entretiens", "synthèse", "critique de sources", "écriture pour la clarté"],
  },
  {
    id: "business-strategist",
    name: "Business Strategist",
    name_fr: "Stratège business",
    category: "leadership",
    one_line: "Maps the playing field, picks the bets, sequences the moves that compound over time.",
    one_line_fr: "Cartographie le terrain, choisit les paris, séquence les mouvements qui composent dans le temps.",
    typical_skills: ["market analysis", "positioning", "scenario planning", "financial modelling", "executive communication"],
    typical_skills_fr: ["analyse de marché", "positionnement", "planification de scénarios", "modélisation financière", "communication exécutive"],
  },
  {
    id: "operations-manager",
    name: "Operations Manager",
    name_fr: "Responsable des opérations",
    category: "operational",
    one_line: "Designs and tunes the systems that make the business run reliably at scale.",
    one_line_fr: "Conçoit et règle les systèmes qui font tourner l'entreprise de manière fiable à l'échelle.",
    typical_skills: ["process design", "SLA management", "vendor management", "incident response", "continuous improvement"],
    typical_skills_fr: ["conception de processus", "gestion des SLA", "gestion fournisseurs", "réponse aux incidents", "amélioration continue"],
  },
  {
    id: "tech-lead",
    name: "Tech Lead",
    name_fr: "Lead technique",
    category: "technical",
    one_line: "Bridges architecture and shipping — owns delivery, unblocks the team, models good engineering.",
    one_line_fr: "Fait le pont entre architecture et livraison — possède la delivery, débloque l'équipe, incarne la bonne ingénierie.",
    typical_skills: ["delivery planning", "code review", "pairing", "tech debt management", "team coaching"],
    typical_skills_fr: ["planification de livraison", "revue de code", "pair programming", "gestion de dette technique", "coaching d'équipe"],
  },
  {
    id: "executive-coach",
    name: "Executive Coach",
    name_fr: "Coach exécutif",
    category: "leadership",
    one_line: "Holds space for leaders to think clearly, decide intentionally, and act with congruence.",
    one_line_fr: "Tient l'espace pour que les dirigeants pensent clairement, décident intentionnellement et agissent avec congruence.",
    typical_skills: ["active listening", "powerful questions", "feedback delivery", "leadership models", "accountability"],
    typical_skills_fr: ["écoute active", "questions puissantes", "feedback efficace", "modèles de leadership", "responsabilisation"],
  },
];

export function getRolesByCategory(
  category: RoleCategory | "all",
): RoleRecord[] {
  if (category === "all") return ROLES;
  return ROLES.filter((r) => r.category === category);
}

export function getRoleById(id: RoleId): RoleRecord | undefined {
  return ROLES.find((r) => r.id === id);
}
