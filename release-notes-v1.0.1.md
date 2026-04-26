# @vantageos/mcp-agent-composer v1.0.1 — functional fix

Released: 2026-04-26 (UTC)

## What's fixed

Same root cause as `@vantageos/mcp-frameworks@1.0.1`: Zod enum errors were being caught by the generic try/catch in `src/server.ts` and surfaced to the MCP client as a flat `"Internal error"` string — telling the model "something broke" but never **what** broke. Calling `compose_agent` with `role_id: "invented-role"` would just fail silently from the model's point of view.

### Two-part fix

1. **ZodError → readable Validation error payload.** The central `CallToolRequestSchema` handler in `src/server.ts` now intercepts `z.ZodError` — both at the top-level `inputSchema.parse(args)` step and inside the per-tool handler — and returns `{ isError: true, content: [{ type: "text", text: "Validation error: <path>: <msg>; ..." }] }`. The model gets the field name and the constraint that failed, so it can self-correct on the next turn.

2. **Explicit `.describe()` on every enum.** `ROLE_ID`, `PERSONA_ID`, `FRAMEWORK_ID`, `LOCALE`, `ROLE_CATEGORY`, `PERSONA_AXIS`, `COMPOSITION_FORMAT` (in `src/schemas/index.ts`) plus the per-tool inline enums (`category` in `list_roles`, `axis` in `list_personas`) all now carry a description listing every accepted value. The MCP `tools/list` payload exposed to the client surfaces these descriptions, so models can pick valid IDs without first calling `list_roles` / `list_personas` for trivial choices.

## What's NOT changed

The data layer is byte-for-byte identical to v1.0.0:

- 12 roles in `src/data/roles.ts`
- 10 personas in `src/data/personas.ts`
- 16 framework-steps in `src/data/framework-steps.ts`

No tool semantics changed. No output shape changed. Pure functional polish.

## Hard gates passed

- `npm test` — 35/35 green (3 new tests in `tests/unit/zod-error-handling.test.ts`)
- `npm run evals` — 15/15 green
- Pre-publish leak audit — 0 hits on `SELLABLE AS` / `INTERNAL ONLY` / API-key patterns
- Functional hard gate (3 cases): invalid role_id → `isError` + `role_id` message; goal < 20 chars → `isError`; valid call → success

## Install

```bash
npm install @vantageos/mcp-agent-composer@1.0.1
```

Or via Claude Code:

```bash
claude mcp add agent-composer -- npx -y @vantageos/mcp-agent-composer
```

Orchestrator: Gamma — VantageOS Team | 2026-04-26
