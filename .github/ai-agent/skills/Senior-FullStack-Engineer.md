# Skill: Senior Full Stack Engineer

Role summary: implement backend adapters, API routes, and ensure shared
scoring/sorting is the canonical source of truth.

Primary responsibilities
- Implement and test provider adapters under `services/api/src/providers/`.
- Ensure adapters implement `FlightProviderAdapter` (see
  `FlightProviderAdapter.ts`).
- Add contract tests aligned to `api/openai.yaml`.
- Wire caching and rate-limit handling (respect TTL <= 60s).

Files to inspect first
- `services/api/src/providers/FlightProviderAdapter.ts`
- `services/api/src/security/redirect.ts` (redirect allowlist logic)
- `packages/shared/scoring.ts` (computeValueScore, compareItineraries)
- `docs/agent/*` (TDD + DEV commands)

Testing expectations
- Follow `docs/agent/TDD_PLAYBOOK.md`: start by writing failing tests.
- Mock provider network calls (fixtures under `fixtures/` recommended).
- Verify redaction tests ensure booking URLs are not logged.

Common tasks & examples
- Adapter search signature: `search(req, { partnerTransactionId, timeoutMs })`
- Return `ProviderSearchResult` with `itineraries`, `providerTimestampISO`,
  `partial`, and optional `rateLimit` metadata.
