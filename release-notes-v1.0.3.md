# v1.0.3 — Bug #3 audit + smoke test gate

## Audited
- **Bug #3 input duplication pattern** swept across `compose_agent`, `validate_composition`, and `suggest_composition`. **No occurrences found** — all three tools keep user input in `structuredContent` top-level only and never re-interpolate `${context}` / `${goal}` / `${requirement}` truncated inside sub-section results (`composition_notes`, `warnings`, `recommendations`, `suggestions[].rationale`). Static catalog data (role names, framework steps) is the only thing referenced in output strings.

## Added
- `scripts/smoke-test-boot.sh` — sends MCP `initialize` handshake to `node dist/index.js` with a 5s timeout and asserts `"protocolVersion"` in response.
- `npm run smoke` script.
- `prepublishOnly`: `npm run build && npm run smoke && npm test && npm run evals` — publish is now gated on a working boot. Lesson #11 fleet-wide capture (Day 51 PM C v1.0.4 broken-publish incident).

## Fixed (parity)
- `mcp.json` version bumped 1.0.0 → 1.0.3 to restore parity with `package.json` (mcp.json had been lagging since v1.0.0 release).

## Stats
- Tests: 35/35 pass
- Evals: 15/15 pass
- Smoke: PASS

Built by: mcp-publisher (via gamma) | bu-mcp BU | 2026-04-26

Orchestrator: Gamma — VantageOS Team | 2026-04-26
