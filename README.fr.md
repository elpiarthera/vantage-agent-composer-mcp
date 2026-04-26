# @vantageos/mcp-agent-composer

Serveur MCP qui compose un agent IA en mixant **Rôle + Persona + Framework + Skills** comme primitive structurée. Bilingue FR+EN par design.

> Version : 1.0.0 — GA (2026-04-26)
> Vendu comme : `vantage-agent-composer-mcp` (listing claudemarketplaces.com) + npm `@vantageos/mcp-agent-composer`

## À propos

La plupart des agents IA sont conçus d'une seule traite, comme un prompt monolithique qui dissimule chaque choix de design. Ce serveur rend ces choix explicites et composables.

`@vantageos/mcp-agent-composer` expose la composition d'agent comme primitive : choisis un **Rôle** (12 curatés), un **Persona** (10 curatés), un **Framework** optionnel (16 IDs miroir de `@vantageos/mcp-frameworks`) et une liste de **Skills**. Le serveur retourne un prompt système, une définition JSON ou une carte markdown — entièrement bilingue FR+EN, avec un français écrit à la main (zéro traduction automatique).

### Ce qu'il fait

Cinq outils, chacun avec un rôle clair :

| Outil | Ce que tu obtiens |
|---|---|
| `list_roles` | Les 12 rôles (technique, créatif, analytique, opérationnel, leadership) avec libellés et compétences typiques bilingues (EN + FR). |
| `list_personas` | Les 10 personas (voix / ton / style de communication) avec traits de voix et phrases types bilingues. |
| `compose_agent` | Une définition d'agent complète en format `system_prompt`, `json_definition` ou `markdown_card`. |
| `suggest_composition` | Les 1 à 3 meilleures recommandations Rôle + Persona + Framework pour un objectif, scorées 0-100. |
| `validate_composition` | Vérification de compatibilité qui détecte les conflits persona/rôle, les frameworks manquants, les compétences vides, et retourne un score 0-100. |

### Pour qui

- Développeurs qui bâtissent des systèmes agentiques sur Claude Code, Cursor, Goose, ChatGPT MCP ou tout client compatible MCP.
- Équipes qui itèrent vite sur le design d'agent et veulent un langage structuré partagé pour « quel type d'agent on est en train de bâtir ».
- Agences IA qui packagent des agents pour leurs clients et ont besoin de compositions reproductibles et validées.

### Pourquoi pas juste un prompt

Un prompt te donne un mur de texte. Ce serveur te donne le slot, la bibliothèque de personas, le switch de locale et les règles de validation — structuré, validé, reproductible d'une session à l'autre.

### Démarrage rapide

```bash
npx -y @vantageos/mcp-agent-composer
```

Ajoute à la config de ton client MCP :

```json
{
  "mcpServers": {
    "vantage-agent-composer": {
      "command": "npx",
      "args": ["-y", "@vantageos/mcp-agent-composer"]
    }
  }
}
```

> **Pas de clé API. Pas de compte. Pas d'auth en v1.0.** La variable d'environnement `ALLOWED_ROLES` est **reportée en Phase 2**.

Redémarre ton client MCP et demande : « Compose-moi un agent capable de débugger les incidents en production en français. »

### Exemples

**Composer un·e architecte pour une question de migration (EN) :**
`compose_agent({ role_id: "technical-architect", persona_id: "direct-pragmatist", framework_id: "first-principles", skills: ["system design", "trade-off analysis"], context: "Design the migration path from monolith to event-driven services.", locale: "en", format: "system_prompt" })`

**Suggérer une composition pour un atelier de coaching (FR) :**
`suggest_composition({ goal: "Animer un atelier de coaching pour aider une équipe overloaded à reprioriser." , locale: "fr" })`

**Valider une combinaison faite à la main avant déploiement :**
`validate_composition({ role_id: "executive-coach", persona_id: "provocative-challenger", framework_id: "cynefin", skills: ["active listening"], locale: "fr" })`

### Doctrine Flexibilité — Phase 1 / Phase 2

Phase 1 (actuelle) : transport stdio, install locale, pas de clé API, pas de serveur distant.
Phase 2 (prévue) : transport HTTP pour déploiements distants + RBAC `ALLOWED_ROLES` + scoping workspace tier Pro. Auth via Polar.sh. Échéance : T3 2026.

---

Licence MIT — Auteur : ElPi Corp / Laurent Perello — Source : [github.com/elpiarthera/vantage-agent-composer-mcp](https://github.com/elpiarthera/vantage-agent-composer-mcp)

## Installation

```bash
npx -y @vantageos/mcp-agent-composer
```

## Configuration

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "vantage-agent-composer": {
      "command": "npx",
      "args": ["-y", "@vantageos/mcp-agent-composer"]
    }
  }
}
```

### Cursor

Voir `examples/cursor.json`.

## Outils

| Nom | Description |
|---|---|
| `list_roles` | Liste les 12 rôles avec descriptions one-line, filtre catégorie optionnel. |
| `list_personas` | Liste les 10 personas avec traits de voix et phrases types. |
| `compose_agent` | Compose une définition complète d'agent (system_prompt / json_definition / markdown_card). |
| `suggest_composition` | Recommande les 1 à 3 meilleures combinaisons Rôle + Persona + Framework pour un objectif. |
| `validate_composition` | Valide la compatibilité et fait remonter les conflits persona/rôle. |

### Catalogues

- **12 rôles** : `technical-architect`, `senior-developer`, `qa-engineer`, `data-analyst`, `product-manager`, `creative-director`, `copywriter`, `researcher`, `business-strategist`, `operations-manager`, `tech-lead`, `executive-coach`.
- **10 personas** : `socratic-questioner`, `direct-pragmatist`, `warm-mentor`, `formal-academic`, `playful-creative`, `concise-executive`, `detailed-explainer`, `provocative-challenger`, `empathetic-listener`, `precise-analyst`.
- **16 framework IDs** (miroir de `@vantageos/mcp-frameworks`) : `design-thinking`, `lean-startup`, `swot`, `okr`, `mece`, `first-principles`, `5-whys`, `eisenhower`, `raci`, `ooda`, `bcg-matrix`, `porter-5-forces`, `pareto`, `hofstede`, `cynefin`, `mckinsey-7s`.

## Exemples

Voir le dossier `examples/`.

## Authentification

Aucune en v1.0. Serveur MCP local public (stdio). Pas de clé API requise.
La variable d'environnement `ALLOWED_ROLES` pour le RBAC est **reportée en Phase 2** — il n'y a aucune couche d'authentification ou d'autorisation en v1.0.

## Dépannage

1. **Le serveur ne démarre pas** — vérifie Node >= 20 (`node --version`).
2. **Outil non découvert** — redémarre le client MCP après édition de la config.
3. **role_id / persona_id / framework_id invalide** — vérifie les catalogues ci-dessus (énumérations en kebab-case).
4. **La locale ne change pas** — passe explicitement `locale: "fr"` dans les inputs des outils.
5. **Doc en anglais** — voir `README.md`.

## Licence & Attribution

Auteur : ElPi Corp / Laurent Perello
Licence : MIT
Source : https://github.com/elpiarthera/vantage-agent-composer-mcp
