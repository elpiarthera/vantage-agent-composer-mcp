# @vantageos/mcp-agent-composer

Serveur MCP qui compose un agent IA en mixant **Rôle + Persona + Framework + Skills** comme primitive structurée. Bilingue FR+EN par design.

> Version : 1.0.0 — GA (2026-04-26)

## A propos

La plupart des agents IA sont definis par un paragraphe ecrit a la va-vite. Ce serveur fait de la conception d'agent une operation structuree et reproductible.

`@vantageos/mcp-agent-composer` expose une primitive de composition typee a tout client compatible MCP : choisissez un Role (ce que l'agent maitrise), une Persona (comment il communique), un Framework optionnel (comment il raisonne) et des Skills personnalises (ce qu'il peut faire). Le resultat est une definition d'agent validee, localisee, generee de facon constante d'une session a l'autre — sous forme de prompt systeme, de definition JSON ou de fiche Markdown.

### Ce qu'il fait

Cinq outils, chacun avec un perimetre clair :

| Outil | Ce que vous obtenez |
|---|---|
| `list_roles` | Les 12 roles cures avec filtre par categorie (`technical`, `creative`, `analytical`, `operational`, `leadership`). Nom bilingue et description courte par role. |
| `list_personas` | Les 10 personas cures avec filtre par axe (`formality`, `energy`, `directness`, `domain_focus`). Traits de voix et exemple de formulation par persona. |
| `compose_agent` | Passez role_id + persona_id + framework_id optionnel + skills optionnels + contexte. Obtenez une definition d'agent complete au format choisi : `system_prompt`, `json_definition` ou `markdown_card`. |
| `suggest_composition` | Decrivez ce que l'agent doit accomplir. Obtenez 1 a 3 combinaisons Role + Persona + Framework scorees avec justification — sans connaitre le catalogue au prealable. |
| `validate_composition` | Soumettez n'importe quelle combinaison role/persona/framework/skills. Obtenez un score de compatibilite (0-100), des alertes classees par severite et des recommandations concretes avant deploiement. |

### Pour qui

- Developpeurs IA qui iterent sur la conception de sous-agents pour Claude Code, Cursor, Goose ou ChatGPT MCP
- Agences IA qui definissent plusieurs configurations d'agents par client et ont besoin de sorties coherentes et auditables
- Tech leads qui veulent faire de la composition d'agent une primitive typee dans leur pipeline, et non une convention informelle

### Pourquoi ce serveur plutot qu'un agent ecrit a la main ou une librairie de prompts

Un agent defini a la main derive d'une session a l'autre et d'un collaborateur a l'autre. Une librairie de prompts donne des gabarits sans validation. Ce serveur produit une composition validee avec un score de compatibilite, des sorties localisees et un resultat reproductible tague par UUID — sans que l'appelant ait besoin de maitriser le prompt engineering.

Le parametre `framework_id` partage le meme catalogue de 16 frameworks que `@vantageos/mcp-frameworks` pour une composition inter-serveurs : appelez `suggest_framework` sur l'un, passez l'identifiant retourne directement a `compose_agent` sur l'autre.

### Demarrage rapide

```bash
npx -y @vantageos/mcp-agent-composer
```

Ajoutez dans `mcp.json` :

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

Pas de cle API. Pas de compte. Redemarrez votre client MCP et demandez : "Compose un agent pour le debogage d'incidents en production — direct, technique, avec un raisonnement par premiers principes."

### Exemples

**Conception de sous-agent :** Appelez `compose_agent` avec `role_id: "technical-architect"`, `persona_id: "direct-pragmatist"`, `framework_id: "first-principles"` et un contexte decrivant votre systeme. Obtenez un prompt systeme pret a integrer dans n'importe quel orchestrateur.

**Decouverte d'abord :** Utilisez `suggest_composition` avec comme objectif `"aider un fondateur non technique a prioriser un backlog de fonctionnalites"`. Obtenez des suggestions scorees — probablement `product-manager` + `warm-mentor` + `eisenhower` — avec justification, avant de toucher a `compose_agent`.

**Verification avant deploiement :** Vous avez compose un agent a la main ? Lancez d'abord `validate_composition`. Une persona `provocative-challenger` associee a un role `warm-mentor` obtient un score de compatibilite faible — le serveur explique pourquoi et propose quoi ajuster.

### Doctrine Flexibilite — Phase 1 / Phase 2

Phase 1 (actuelle) : transport stdio, installation locale, pas de cle API, pas de serveur distant. Les donnees de catalogue sont entierement hors ligne — aucun appel LLM au moment du list ou du get.
Phase 2 (prevue) : transport HTTP pour les deploiements distants + tier Pro avec perimetre ALLOWED_ROLES + integration lookup Skills VantageRegistry. Auth via Polar.sh. Activee selon le signal d'adoption.

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
