# @vantageos/mcp-agent-composer

MCP server that composes an AI agent by mixing **Role + Persona + Framework + Skills** as a structured primitive. Bilingual FR+EN by design.

> Version: 1.0.0 — GA (2026-04-26)

## About

Most AI agents are defined by a single paragraph someone typed in a hurry. This server turns agent design into a structured, repeatable operation.

`@vantageos/mcp-agent-composer` gives any MCP-compatible client a typed composition primitive: pick a Role (what the agent knows), a Persona (how it communicates), an optional Framework (how it reasons), and custom Skills (what it can do). The result is a validated, locale-switched agent definition — as a system prompt, a JSON definition, or a Markdown card — generated consistently, session after session.

### What it does

Five tools, each with a clear job:

| Tool | What you get |
|---|---|
| `list_roles` | All 12 curated roles with category filter (`technical`, `creative`, `analytical`, `operational`, `leadership`). Bilingual name + one-liner per role. |
| `list_personas` | All 10 curated personas with axis filter (`formality`, `energy`, `directness`, `domain_focus`). Includes voice traits and a sample phrase per persona. |
| `compose_agent` | Pass role_id + persona_id + optional framework_id + optional skills + context. Receive a complete agent definition in your chosen format: `system_prompt`, `json_definition`, or `markdown_card`. |
| `suggest_composition` | Describe what you need the agent to accomplish. Get 1-3 scored Role + Persona + Framework combinations with rationale — without knowing the catalog upfront. |
| `validate_composition` | Pass any role/persona/framework/skills combination. Get a compatibility score (0-100), severity-tagged warnings, and concrete recommendations before you deploy. |

### Who it is for

- AI developers iterating on sub-agent design for Claude Code, Cursor, Goose, or ChatGPT MCP
- AI agencies that define multiple agent configurations per client and need consistent, auditable outputs
- Technical leads who want agent composition to be a typed primitive in their pipeline, not a prose convention

### Why this, not hand-prompted agents or a prompt library

A hand-prompted agent definition drifts between sessions and teammates. A prompt library gives you templates with no validation. This server gives you a validated composition with a compatibility score, locale-switched outputs, and a repeatable UUID-tagged result — with no prompt engineering required from the caller.

The `framework_id` parameter shares the same 16-framework catalog as `@vantageos/mcp-frameworks` for cross-server compose: call `suggest_framework` on one server, pass the returned ID directly to `compose_agent` on this one.

### Quick Start

```bash
npx -y @vantageos/mcp-agent-composer
```

Add to `mcp.json`:

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

No API key. No account. Restart your MCP client and ask: "Compose an agent for debugging production incidents — direct, technical, using first-principles reasoning."

### Examples

**Sub-agent design:** Call `compose_agent` with `role_id: "technical-architect"`, `persona_id: "direct-pragmatist"`, `framework_id: "first-principles"`, context describing your system. Receive a system prompt you can drop into any orchestrator immediately.

**Discovery first:** Use `suggest_composition` with goal `"help a non-technical founder prioritize a feature backlog"`. Get scored suggestions — likely `product-manager` + `warm-mentor` + `eisenhower` — with rationale, before touching `compose_agent`.

**Pre-deployment check:** Hand-built a composition? Run `validate_composition` first. A `provocative-challenger` persona paired with a `warm-mentor` role scores low on compatibility — the server tells you why and what to swap.

### Doctrine Flexibilite — Phase 1 / Phase 2

Phase 1 (current): stdio transport, local install, no API key, no remote server. Catalog data is fully offline — no LLM call at list/get time.
Phase 2 (planned): HTTP transport for remote deployments + Pro tier with ALLOWED_ROLES scoping + VantageRegistry Skills lookup integration. Auth via Polar.sh. Activated based on adoption signal.

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
