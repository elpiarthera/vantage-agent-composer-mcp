# vantage-agent-composer v1.0.0

The third MCP server in the ElPi Corp BU MCP fleet. Composes AI agents by mixing typed Role + Persona + Framework + Skills primitives.

5 tools: list_roles, list_personas, compose_agent, suggest_composition, validate_composition.

Cross-server composability with `@vantageos/mcp-frameworks` via shared 16-framework ID catalog (no npm runtime dependency).

12 roles + 10 personas + 16 framework references (mirrored). Bilingual FR+EN handcrafted.

## Standards compliance

ElPi Corp mcp-standard.md v1 — 10/10 Critical Rules. MCP spec 2025-06-18.

32 tests pass, 99.38% line coverage, 15/15 evals.

## Install

```bash
npx -y @vantageos/mcp-agent-composer
```
