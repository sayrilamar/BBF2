# KICKOFF.md — Implementation Kickoff Pack (FlightValue) (Updated: TDD + Safe Defaults)

## A) Safest Path Defaults (explicit choices)
- **Mobile:** React Native + TypeScript using **Expo**
- **Backend:** Node.js + TypeScript using **Fastify**
- **Provider integration:** Start with **mocks/fixtures**; integrate Expedia only after credentials exist
- **Airport autocomplete:** Start with a **bundled airport dataset** (no external key dependency)

## B) TDD Policy (Non-Negotiable)
All implementation work MUST follow **Red → Green → Refactor**:
1) **Write failing tests first** for the behavior (unit/integration/contract as appropriate).
2) Implement the minimum code to make tests pass.
3) Refactor with tests staying green.
4) No PR/merge is “done” unless tests exist and pass.

### Definition of Done (applies to every ticket)
- Tests added/updated for new behavior
- Tests pass locally and in CI
- Edge cases/negative tests included where relevant
- No secrets in code or logs (verify redaction tests)

## C) Build Strategy (minimize rework)
1) Implement backend + mobile against mocks first.
2) Lock shared schemas + scoring library with unit tests.
3) Add contract tests for `/v1/search` and `/v1/redirect/{token}` (OpenAPI-aligned).
4) Add Expedia adapter behind provider interface and gate it with integration tests.
5) Enable caching + rate-limit handling with integration tests before load testing.
6) Add redirect tokenization + allowlist with security tests before enabling “Book”.

## D) Minimum API Surface (backend)
1) POST /v1/search
2) GET  /v1/redirect/{token}
3) GET  /healthz

## E) Environment Variables (backend)
- EXPEDIA_API_KEY=<secret>
- EXPEDIA_BASIC_AUTH=<secret>          # "Basic <base64(username:password)>"
- EXPEDIA_ACCEPT=application/vnd.exp-flight.v3+json
- REDIRECT_ALLOWLIST=expedia.com,www.expedia.com
- CACHE_TTL_SECONDS=30                 # must be <= 60
- LOG_REDACT_BOOKING_URL=true
