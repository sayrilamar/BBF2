# FlightValue Repository Guide

This repository contains planning and implementation guidance for **FlightValue**, a metasearch-first mobile product that helps users compare flights using a transparent value formula rather than opaque ranking.

## What this repo currently defines

Based on the markdown documentation in this repository, the product and engineering direction is:

- **Product type:** metasearch only (no in-app booking, no payments, no user accounts)
- **Core differentiator:** transparent ranking via `ValueScore = TotalPrice + (DurationHours × TimeValuePerHour)`
- **Platforms:** iOS + Android (React Native + TypeScript, Expo safe-path default)
- **Backend:** Node.js + TypeScript (Fastify safe-path default)
- **Provider strategy (v1):** Expedia Flight Listings API via backend proxy
- **Security posture:** never expose provider credentials in client; redirect tokenization + allowlist
- **Privacy posture:** no sensitive PII, no booking URL/token leakage in logs, minimal analytics only

## Key behavior and constraints

### Ranking and UX
- Default sort is by lowest ValueScore.
- Tie-breaking is deterministic: ValueScore → TotalPrice → Duration → itinerary id.
- `TimeValuePerHour` defaults to 30, user-adjustable (0..200), persisted locally.
- Explainability is required within 1 tap ("How ranking works" + per-result breakdown).

### API surface (minimum)
- `POST /v1/search`
- `GET /v1/redirect/{token}`
- `GET /healthz`

### Provider and caching
- Expedia headers and Partner-Transaction-Id are required for provider calls.
- Cache policy is provider-aware.
- Default cache TTL is 30 seconds, with a hard max of 60 seconds.
- Manual refresh bypasses cache unless rate-limited.

### Rate limiting and reliability
- Parse Expedia `EG-Rate-Limit-*` headers.
- Never auto-retry provider `429` responses.
- Return actionable `retryAfterMs` to clients when derivable.

### Compliance and telemetry
- Apple + Google Play privacy disclosures are launch blockers.
- Sentry usage should be crash-only in v1.
- Suggested analytics events are minimal and must avoid PII and booking URLs.

## Delivery methodology

The docs define **TDD-first** as non-negotiable:

1. Red: write failing tests first.
2. Green: implement minimal passing behavior.
3. Refactor: improve while keeping tests green.

No ticket is considered done without tests.

## Documentation map

- `docs/spec/SPEC.md` — executable business requirements
- `docs/spec/TESTPLAN.md` — required verification strategy
- `docs/spec/TASKS.md` — sequenced implementation backlog
- `docs/spec/CONTEXT.md` — product/provider context and defaults
- `docs/agent/KICKOFF.md` — startup defaults and build order
- `docs/agent/DECISIONS.md` — locked v1 engineering decisions
- `docs/agent/TDD_PLAYBOOK.md` — TDD workflow guidance
- `docs/agent/DEV_COMMANDS.md` — recommended dev/test commands
- `docs/telemetry/ANALYTICS.md` — privacy-safe event guidance
- `docs/compliance/STORE_COMPLIANCE.md` — app store readiness minimums
- `services/api/src/providers/expedia/ExpediaAdapter.NOTES.md` — Expedia adapter implementation notes

## Suggested next implementation sequence

1. Finalize shared scoring + deterministic sorting with tests.
2. Lock canonical API schemas and validation rules.
3. Scaffold backend endpoints with mock data and structured redacted logs.
4. Implement Expedia adapter behind provider interface.
5. Add provider-aware caching + 429 handling.
6. Implement redirect tokenization/allowlist before enabling book actions.
7. Build mobile search/results UX with explainability and freshness states.
8. Add observability/performance checks for ≤5s p95 target.

