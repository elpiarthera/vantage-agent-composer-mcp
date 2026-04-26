## [1.0.0] — 2026-04-26

### Added
- Initial GA release of `@vantageos/mcp-agent-composer`.
- 5 MCP tools: `list_roles`, `list_personas`, `compose_agent`, `suggest_composition`, `validate_composition`.
- Curated catalog of 12 roles and 10 personas, fully bilingual (EN+FR handcrafted strings, no machine translation).
- Static `framework-steps.ts` map for the 16 framework IDs mirrored from `@vantageos/mcp-frameworks` — no runtime dependency.
- `ROLE_ID`, `PERSONA_ID`, `FRAMEWORK_ID` Zod enums as single source of truth (Critical Rule #4 — no `z.any`).
- Three composition output formats: `system_prompt` (default), `json_definition`, `markdown_card`.
- `validate_composition` enforces compatibility rules (e.g., warns on persona/role clashes such as `provocative-challenger` + `warm-mentor`).
- Stdio transport via `@modelcontextprotocol/sdk` — zero infrastructure, isolated process.
- Bilingual i18n catalog (`src/i18n/{en,fr}.json`) with key parity, `X-MCP-Locale` header detection.
- Structured JSON logger writing to stderr (Critical Rule #6 — no stack-trace leak).
- Vitest unit + integration suite with v8 coverage and 80% thresholds.
- `evals/evals.json` formalised with one object per case, runner via `npm run evals`.
- 6 minor fixes from spec-reviewer Round 1 applied inline (typed enum outputs, framework-steps map, FR skills, etc.).

### Notes
- `ALLOWED_ROLES` env-var auth deferred to Phase 2 — no auth in v1.0.
- HTTP transport deferred to Phase 2 — stdio only in v1.0.

[1.0.0]: https://github.com/elpiarthera/vantage-agent-composer-mcp/releases/tag/v1.0.0
