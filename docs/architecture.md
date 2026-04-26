# Architecture — L3

## Layers

```
src/
├── index.ts           # entry — boot stdio transport
├── server.ts          # createServer() — registers 5 tools
├── tools/             # 1 file per tool (handler + schemas wiring)
├── schemas/           # ROLE_ID + PERSONA_ID + FRAMEWORK_ID enums + shared Zod schemas
├── data/              # roles.ts (12) + personas.ts (10) + framework-steps.ts (16)
├── i18n/              # en.json + fr.json (localised error keys)
└── lib/               # logger, errors, i18n
```

## Doctrine Flexibilité 5/5 (per spec §9)

1. **MCP-first** — pure MCP server, stdio standard transport. No proprietary protocol layer.
2. **Abstraction fonctionnelle** — tools exposed as verb-imperative actions (`list_roles`, `compose_agent`, `validate_composition`), decoupled from any specific LLM implementation. Catalogues live in a pure TypeScript data layer.
3. **Migration-ready** — alternative documented : a thin REST API on the same `src/data/` + `src/tools/` layer is achievable in 1-2 person-days.
4. **Composabilité VantagePeers-native** — `FRAMEWORK_ID` enum mirrors `@vantageos/mcp-frameworks` exactly, enabling cross-server composition without runtime dependency. Roles/personas catalogues are extractible as a standalone data package.
5. **Parallélisable** — 5 tools are independent ; TDD build can be parallelised across tools without coupling.

## Cross-server composability

- `compose_agent.framework_id` accepts the same 16 IDs as `@vantageos/mcp-frameworks`.
- A typical pipeline:
  1. `mcp-frameworks.suggest_framework({ context })` → returns e.g. `"first-principles"`.
  2. `mcp-agent-composer.compose_agent({ role_id, persona_id, framework_id: "first-principles", context })` → returns the composed system prompt.

## Extension points (post-v1.0)

- HTTP transport (Phase 2) — drop-in beside stdio.
- `ALLOWED_ROLES` env-var auth (Phase 2) — placeholder TODO. Deferred per spec §4.
- Custom role/persona injection — exposed via `register_role` resource (post-v1.0).
