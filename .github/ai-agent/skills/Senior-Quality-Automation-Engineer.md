# Skill: Senior Quality Intelligence / Automation Engineer

Role summary: own test strategy, fixtures, and automation to enforce TDD
policy and contract correctness across packages.

Primary responsibilities
- Author unit, integration, and contract tests per `docs/agent/TDD_PLAYBOOK.md`.
- Provide stable provider fixtures and mocking helpers for adapter tests.
- Add CI steps that run package tests (`pnpm --filter <pkg> test`).

Files & patterns to review
- `packages/shared/scoring.ts` — write thorough unit tests (bounds, tie-breakers).
- Backend route tests: `/v1/search` and `/v1/redirect/{token}` behaviors.
- Contract tests verifying responses against `api/openai.yaml`.

Testing notes
- Provider calls MUST be mocked; do not hit provider endpoints in CI.
- Include negative tests (429 handling → backend 429 + retryAfterMs;
  provider timeout → 504; expired redirect token → 410).
