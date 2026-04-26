# @vantageos/mcp-agent-composer

MCP server that composes an AI agent by mixing **Role + Persona + Framework + Skills** as a structured primitive. Bilingual FR+EN by design.

> Version: 1.0.0 — GA (2026-04-26)
> Sellable as: `vantage-agent-composer-mcp` (claudemarketplaces.com listing) + npm `@vantageos/mcp-agent-composer`

## About

Most AI agents are designed in one shot, as a monolithic prompt that hides every choice the designer made. This server makes those choices explicit and composable.

`@vantageos/mcp-agent-composer` exposes agent composition as a primitive: pick a **Role** (12 curated), a **Persona** (10 curated), an optional **Framework** (16 IDs mirrored from `@vantageos/mcp-frameworks`), and a list of **Skills**. The server returns a system prompt, a JSON definition or a markdown card — fully bilingual FR+EN, with handcrafted French (no machine translation).

### What it does

Five tools, each with a clear job:

| Tool | What you get |
|---|---|
| `list_roles` | All 12 roles (technical, creative, analytical, operational, leadership) with bilingual labels and typical skills (EN + FR). |
| `list_personas` | All 10 personas (voice / tone / communication style) with bilingual voice traits and sample phrases. |
| `compose_agent` | A complete agent definition in `system_prompt`, `json_definition` or `markdown_card` format. |
| `suggest_composition` | Top 1-3 Role + Persona + Framework recommendations for a given goal, scored 0-100. |
| `validate_composition` | Compatibility check that flags persona-role clashes, missing frameworks, empty skills, and returns a 0-100 compatibility score. |

### Who it is for

- Developers building agentic systems on Claude Code, Cursor, Goose, ChatGPT MCP, or any MCP-compatible client.
- Teams iterating fast on agent design who want a shared, structured language for "what kind of agent are we building".
- AI agencies that package agents for clients and need reproducible, validated compositions.

### Why this, not a plain prompt

A prompt gives you a wall of text. This server gives you the slot, the persona library, the locale switch, and the validation rules — structured, validated, and reproducible across sessions.

### Quick Start

```bash
npx -y @vantageos/mcp-agent-composer
```

Add to your MCP client config:

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

> **No API key. No account. No auth in v1.0.** The `ALLOWED_ROLES` environment variable is **deferred to Phase 2**.

Restart your MCP client and ask: "Compose an agent that can debug production incidents in French."

### Examples

**Compose an architect for a migration question (EN):**
`compose_agent({ role_id: "technical-architect", persona_id: "direct-pragmatist", framework_id: "first-principles", skills: ["system design", "trade-off analysis"], context: "Design the migration path from monolith to event-driven services.", locale: "en", format: "system_prompt" })`

**Suggest a composition for a coaching workshop (FR):**
`suggest_composition({ goal: "Animer un atelier de coaching pour aider une équipe overloaded à reprioriser." , locale: "fr" })`

**Validate a hand-built combo before shipping it:**
`validate_composition({ role_id: "executive-coach", persona_id: "provocative-challenger", framework_id: "cynefin", skills: ["active listening"], locale: "en" })`

### Doctrine Flexibilité — Phase 1 / Phase 2

Phase 1 (current): stdio transport, local install, no API key, no remote server.
Phase 2 (planned): HTTP transport for remote deployments + `ALLOWED_ROLES` RBAC + Pro tier workspace scoping. Auth via Polar.sh. Timeline: Q3 2026.

---

MIT License — Author: ElPi Corp / Laurent Perello — Source: [github.com/elpiarthera/vantage-agent-composer-mcp](https://github.com/elpiarthera/vantage-agent-composer-mcp)

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

See `examples/cursor.json`.

## Tools

| Name | Description |
|---|---|
| `list_roles` | List all 12 roles with one-line descriptions, optional category filter. |
| `list_personas` | List all 10 personas with voice traits and sample phrases. |
| `compose_agent` | Compose a complete agent definition (system_prompt / json_definition / markdown_card). |
| `suggest_composition` | Recommend the best 1-3 Role + Persona + Framework combos for a goal. |
| `validate_composition` | Validate compatibility and surface persona-role clashes. |

### Catalogs

- **12 roles**: `technical-architect`, `senior-developer`, `qa-engineer`, `data-analyst`, `product-manager`, `creative-director`, `copywriter`, `researcher`, `business-strategist`, `operations-manager`, `tech-lead`, `executive-coach`.
- **10 personas**: `socratic-questioner`, `direct-pragmatist`, `warm-mentor`, `formal-academic`, `playful-creative`, `concise-executive`, `detailed-explainer`, `provocative-challenger`, `empathetic-listener`, `precise-analyst`.
- **16 framework IDs** (mirrored from `@vantageos/mcp-frameworks`): `design-thinking`, `lean-startup`, `swot`, `okr`, `mece`, `first-principles`, `5-whys`, `eisenhower`, `raci`, `ooda`, `bcg-matrix`, `porter-5-forces`, `pareto`, `hofstede`, `cynefin`, `mckinsey-7s`.

## Examples

See `examples/` directory.

## Authentication

None in v1.0. Public local MCP server (stdio). No API key required.
The `ALLOWED_ROLES` environment variable for RBAC is **deferred to Phase 2** — there is no authentication or authorization layer in v1.0.

## Troubleshooting

1. **Server doesn't start** — verify Node >= 20 (`node --version`).
2. **Tool not discovered** — restart your MCP client after editing config.
3. **Invalid role_id / persona_id / framework_id** — check the catalogs above (kebab-case enums).
4. **Locale not switching** — pass `locale: "fr"` explicitly in tool inputs.
5. **Need French docs** — see `README.fr.md`.

## License & Attribution

Author : ElPi Corp / Laurent Perello
License : MIT
Source : https://github.com/elpiarthera/vantage-agent-composer-mcp
