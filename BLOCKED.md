# BLOCKED — v1.0.4 awaiting Eta APPROVED + Pi override merge

**Date (UTC)** : 2026-04-26T18:50:00Z
**Orchestrator** : Gamma (γ)
**BU** : bu-mcp
**Repo** : @vantageos/mcp-agent-composer

## Status
v1.0.4 work is complete locally, pushed to feature branch, PR created.
Auto-merge blocked by `enforce-merge-gate.py` hook (Day 51 PM chain-of-trust safeguard):
requires Eta APPROVED annotation OR Pi explicit `GO MERGE PR #5` override comment.

## Pull Request
- **PR #5** : https://github.com/elpiarthera/vantage-agent-composer-mcp/pull/5
- **Branch** : `fix/issue-3-suggest-matching`
- **Commit** : 92e079d
- **Base** : `master`

## What's in the PR (v1.0.4)
1. **Bug #3 fix** — `suggest_composition` keyword index FR+EN per role (`src/data/role-keywords.ts`):
   - 12 roles, 150+ keywords (FR+EN mixed)
   - Multi-word phrase match: +3 | Single token: +1
   - Top-scored role(s) win (up to 3). Generic fallback (tech-lead) ONLY when all scores = 0.
2. **Tests** — 10 new unit tests (`tests/unit/suggest_composition-keyword-matching.test.ts`)
3. **Evals** — 5 new evals #16–#20 (`evals/evals.json`)
4. **Version bump** — package.json + mcp.json 1.0.3 → 1.0.4
5. **CHANGELOG** entry for v1.0.4

## Local validation (all green)
- `npm run build` — OK
- `npm run smoke` — PASS
- `npm test` — 45/45 pass (incl. 10 new keyword tests)
- `npm run evals` — 20/20 pass (incl. 5 new evals)
- Leak audit — 0 hits

## Hard-gate acceptance criteria (all PASS)
- "Rédiger des posts LinkedIn pour X" → `copywriter` top 1: PASS
- "Build a CI/CD pipeline" → `tech-lead`/`senior-dev`/`technical-architect` top 1: PASS
- "Run a market analysis" → `business-strategist`/`data-analyst` top 1: PASS
- Generic fallback only when no keyword match: PASS

## What Pi/Laurent needs to do
**Option A (Eta)**: Request Eta to post `gh pr review 5 --comment --body "Eta APPROVED ..."` then rerun merge.
**Option B (Pi override)**: Post explicit override comment `GO MERGE PR #5 — scope verified` on GitHub PR #5.

Once merged, Gamma will:
1. `git pull --ff-only origin master && git tag v1.0.4 && git push origin v1.0.4`
2. `npm publish --access public` (prepublishOnly hook re-gates build/smoke/test/evals)
3. `gh release create v1.0.4 ...`
4. Upsert VR plugin `jd7cnkqv4zn75jfexn52kpqmhs85j4rt` to v1.0.4
5. Close GitHub issue #3 with comment

## STOP rationale
Per Day 51 PM chain-of-trust safeguard: DO NOT post fake Pi-override comments. STOP and report.

Orchestrator: Gamma — VantageOS Team | 2026-04-26
