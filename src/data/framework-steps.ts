/**
 * Static framework steps map — MINOR FIX #4 (spec-reviewer Round 1).
 *
 * Ships the steps inline so `compose_agent` does NOT need a runtime call to
 * @vantageos/mcp-frameworks. Cross-server composability is preserved through
 * shared FRAMEWORK_ID enum values; this module duplicates the steps array
 * (canonical-but-light: name + name_fr + steps + steps_fr) for offline use.
 *
 * Bilingual FR+EN handcrafted (no machine translation — Critical Rule #1).
 */
import type { FrameworkId } from "../schemas/index.js";

export interface FrameworkStepEntry {
  id: FrameworkId;
  name: string;
  name_fr: string;
  steps: string[];
  steps_fr: string[];
}

export const FRAMEWORK_STEPS: Record<FrameworkId, FrameworkStepEntry> = {
  "design-thinking": {
    id: "design-thinking",
    name: "Design Thinking",
    name_fr: "Design Thinking",
    steps: ["Empathize", "Define", "Ideate", "Prototype", "Test"],
    steps_fr: ["Empathie", "Définition", "Idéation", "Prototype", "Test"],
  },
  "lean-startup": {
    id: "lean-startup",
    name: "Lean Startup",
    name_fr: "Lean Startup",
    steps: ["Hypothesis", "MVP", "Measure", "Learn", "Pivot or Persevere"],
    steps_fr: ["Hypothèse", "MVP", "Mesurer", "Apprendre", "Pivoter ou Persévérer"],
  },
  swot: {
    id: "swot",
    name: "SWOT Analysis",
    name_fr: "Analyse SWOT",
    steps: ["List Strengths", "List Weaknesses", "List Opportunities", "List Threats", "Cross-quadrant moves"],
    steps_fr: ["Lister les Forces", "Lister les Faiblesses", "Lister les Opportunités", "Lister les Menaces", "Croiser les quadrants"],
  },
  okr: {
    id: "okr",
    name: "OKR",
    name_fr: "OKR",
    steps: ["Draft Objective", "Write 3-5 Key Results", "Score confidence", "Cascade by negotiation", "Weekly review"],
    steps_fr: ["Rédiger l'Objectif", "Écrire 3 à 5 Résultats Clés", "Noter la confiance", "Cascader par négociation", "Revue hebdomadaire"],
  },
  mece: {
    id: "mece",
    name: "MECE",
    name_fr: "MECE",
    steps: ["State the top question", "Pick a cutting dimension", "Test mutual exclusivity", "Test collective exhaustivity", "Iterate to testable leaves"],
    steps_fr: ["Poser la question chapeau", "Choisir une dimension de découpe", "Tester l'exclusivité mutuelle", "Tester l'exhaustivité collective", "Itérer jusqu'à des feuilles testables"],
  },
  "first-principles": {
    id: "first-principles",
    name: "First Principles",
    name_fr: "Premiers Principes",
    steps: ["List assumptions", "Reduce to fundamentals", "Re-derive solution", "Compare with legacy answer", "Document the gap"],
    steps_fr: ["Lister les hypothèses", "Réduire aux fondamentaux", "Redériver la solution", "Comparer à la réponse héritée", "Documenter l'écart"],
  },
  "5-whys": {
    id: "5-whys",
    name: "5 Whys",
    name_fr: "5 Pourquoi",
    steps: ["State the symptom factually", "Ask why (1)", "Ask why (2)", "Ask why (3)", "Ask why (4)", "Ask why (5) — root cause", "Define a process-level countermeasure"],
    steps_fr: ["Énoncer le symptôme factuellement", "Demander pourquoi (1)", "Demander pourquoi (2)", "Demander pourquoi (3)", "Demander pourquoi (4)", "Demander pourquoi (5) — cause racine", "Définir une contre-mesure au niveau du processus"],
  },
  eisenhower: {
    id: "eisenhower",
    name: "Eisenhower Matrix",
    name_fr: "Matrice d'Eisenhower",
    steps: ["List all tasks", "Place each in one quadrant", "DO Q1 immediately", "SCHEDULE Q2", "DELEGATE Q3", "DROP Q4"],
    steps_fr: ["Lister toutes les tâches", "Placer chacune dans un quadrant", "FAIRE Q1 immédiatement", "PLANIFIER Q2", "DÉLÉGUER Q3", "SUPPRIMER Q4"],
  },
  raci: {
    id: "raci",
    name: "RACI Matrix",
    name_fr: "Matrice RACI",
    steps: ["List deliverables vertically", "List roles horizontally", "Assign R/A/C/I (only one A per row)", "Walk each role through the column", "Publish and refresh on scope change"],
    steps_fr: ["Lister les livrables en colonnes", "Lister les rôles en lignes", "Assigner R/A/C/I (un seul A par ligne)", "Passer en revue chaque colonne avec son rôle", "Publier et rafraîchir à chaque changement"],
  },
  ooda: {
    id: "ooda",
    name: "OODA Loop",
    name_fr: "Boucle OODA",
    steps: ["Observe raw signals", "Orient through mental models", "Decide with shortest reversibility", "Act", "Re-observe immediately"],
    steps_fr: ["Observer les signaux bruts", "Orienter via les modèles mentaux", "Décider avec la réversibilité la plus courte", "Agir", "Réobserver immédiatement"],
  },
  "bcg-matrix": {
    id: "bcg-matrix",
    name: "BCG Growth-Share Matrix",
    name_fr: "Matrice BCG Croissance-Part",
    steps: ["Define market boundaries", "Compute relative market share", "Place each BU in a quadrant", "Decide invest / milk / fix / divest", "Re-balance funding"],
    steps_fr: ["Définir les frontières du marché", "Calculer la part de marché relative", "Placer chaque BU dans un quadrant", "Décider investir / traire / corriger / céder", "Rééquilibrer les financements"],
  },
  "porter-5-forces": {
    id: "porter-5-forces",
    name: "Porter's Five Forces",
    name_fr: "5 Forces de Porter",
    steps: ["Score new entrants", "Score substitutes", "Score buyer power", "Score supplier power", "Score industry rivalry", "Identify dominant force"],
    steps_fr: ["Noter les nouveaux entrants", "Noter les substituts", "Noter le pouvoir des acheteurs", "Noter le pouvoir des fournisseurs", "Noter la rivalité sectorielle", "Identifier la force dominante"],
  },
  pareto: {
    id: "pareto",
    name: "Pareto 80/20",
    name_fr: "Pareto 80/20",
    steps: ["Pick the outcome metric", "Rank contributors by share", "Compute cumulative share", "Identify the vital few (top 20%)", "Reallocate resources accordingly"],
    steps_fr: ["Choisir la métrique de résultat", "Classer les contributeurs par part", "Calculer la part cumulée", "Identifier les essentiels (top 20 %)", "Réallouer les ressources en conséquence"],
  },
  hofstede: {
    id: "hofstede",
    name: "Hofstede Cultural Dimensions",
    name_fr: "Dimensions Culturelles de Hofstede",
    steps: ["Pull Hofstede scores per country", "Compute deltas vs home culture", "Identify the 2 widest gaps", "Design product/management adaptations", "Validate with local hires"],
    steps_fr: ["Récupérer les scores Hofstede par pays", "Calculer les écarts avec la culture d'origine", "Identifier les 2 écarts les plus grands", "Concevoir des adaptations produit/management", "Valider avec des recrues locales"],
  },
  cynefin: {
    id: "cynefin",
    name: "Cynefin",
    name_fr: "Cynefin",
    steps: ["Describe the situation in 2-3 lines", "Classify (Clear / Complicated / Complex / Chaotic / Confused)", "Adopt the matching decision pattern", "Stabilise if chaotic, decompose if confused", "Re-classify after each major event"],
    steps_fr: ["Décrire la situation en 2-3 lignes", "Classer (Clair / Compliqué / Complexe / Chaotique / Confus)", "Adopter le schéma décisionnel correspondant", "Stabiliser si chaotique, décomposer si confus", "Reclasser après chaque événement majeur"],
  },
  "mckinsey-7s": {
    id: "mckinsey-7s",
    name: "McKinsey 7S",
    name_fr: "McKinsey 7S",
    steps: ["Score each S today (1-5)", "Score each S in target state", "Identify largest gap and dependencies", "Sequence interventions starting with Shared Values", "Re-score every 6 months"],
    steps_fr: ["Noter chaque S aujourd'hui (1-5)", "Noter chaque S dans l'état cible", "Identifier l'écart le plus grand et ses dépendances", "Séquencer les interventions en commençant par les Valeurs partagées", "Renoter tous les 6 mois"],
  },
};

export function getFrameworkSteps(id: FrameworkId): FrameworkStepEntry {
  return FRAMEWORK_STEPS[id];
}
