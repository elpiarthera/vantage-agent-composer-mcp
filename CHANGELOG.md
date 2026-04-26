## [1.0.4] - 2026-04-26
### Fixed
- `suggest_composition` matching: added keyword index FR+EN per role (`src/data/role-keywords.ts`). Generic fallback (tech-lead) only triggers when no keyword matches. Closes #3 (user-reported "Rédiger posts LinkedIn" → tech-lead instead of copywriter).
- 12 roles now have comprehensive FR+EN keyword arrays (150+ keywords total). Multi-word phrases scored +3 vs single tokens +1.
- Scores are deterministic, monotonically non-increasing in output.

### Tests
- 10 new unit tests in `tests/unit/suggest_composition-keyword-matching.test.ts` covering FR+EN keyword matching and generic fallback.
- 5 new evals (#16–#20) in `evals/evals.json` for keyword-matching acceptance criteria.
- 45/45 unit tests + 20/20 evals green.

[1.0.4]: https://github.com/elpiarthera/vantage-agent-composer-mcp/releases/tag/v1.0.4

## [1.0.3] - 2026-04-26
### Audited
- Bug #3 input duplication audit on compose_agent / validate_composition / suggest_composition: none found, all clean.

### Added
- Pre-publish boot smoke test gate (`scripts/smoke-test-boot.sh` + `prepublishOnly`). `node dist/index.js` must respond to MCP `initialize` handshake before publish proceeds. Lesson #11 fleet-wide capture (Day 51 PM C v1.0.4 broken-publish incident).

### Notes
- mcp.json bumped 1.0.0 → 1.0.3 to restore version parity with package.json (was lagging since v1.0.0 release).

[1.0.3]: https://github.com/elpiarthera/vantage-agent-composer-mcp/releases/tag/v1.0.3

## [1.0.2] — 2026-04-26

### Fixed
- Build artifacts: ship `dist/` so `npx -y @vantageos/mcp-agent-composer` works post-install (Laurent manual fix post Pi-override).

[1.0.2]: https://github.com/elpiarthera/vantage-agent-composer-mcp/releases/tag/v1.0.2

## [1.0.1] — 2026-04-26

### Fixed
- Zod enum errors are no longer swallowed as opaque "Internal error". The central CallTool handler in `src/server.ts` now catches `ZodError` (both at input parsing and inside tool handlers) and returns a readable `Validation error: <path>: <message>; ...` payload via `isError: true`. Mirrors the `@vantageos/mcp-frameworks@1.0.1` fix — same root cause.
- All `z.enum(...)` schemas now carry an explicit `.describe()` listing every enum value (12 roles, 10 personas, 16 frameworks, 5 role categories, 4 persona axes, 3 composition formats, 2 locales). Models calling the server via MCP can now pick valid IDs without round-tripping through `list_roles` / `list_personas` for trivial choices.

### Tests
- New `tests/unit/zod-error-handling.test.ts` exercises the Validation-error wrap path on `compose_agent` (invalid `role_id`) and `suggest_composition` (`goal` shorter than 20 chars), plus a positive control. 35/35 unit + integration tests green; 15/15 evals green.

### Notes
- Pure functional fix, no data layer change: 12 roles + 10 personas + 16 framework-steps stay byte-for-byte identical to v1.0.0.

[1.0.1]: https://github.com/elpiarthera/vantage-agent-composer-mcp/releases/tag/v1.0.1

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
- Vitrine descriptions baked in at first ship (4 surfaces). No SELLABLE AS / timeline leaks.

[1.0.0]: https://github.com/elpiarthera/vantage-agent-composer-mcp/releases/tag/v1.0.0
