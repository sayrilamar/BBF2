# TDD_PLAYBOOK.md — FlightValue Engineering Workflow (Agent-Executable)

## 1) Non-Negotiable Workflow
Follow **Red → Green → Refactor** for every change:
1) RED: write failing test(s) for the requirement
2) GREEN: implement minimal code to pass
3) REFACTOR: improve structure, keep tests green

## 2) Test Pyramid (what to write where)
1) Unit tests (fastest, most common)
   - scoring, sorting/tie-breaking, formatting, cache key normalization
2) Integration tests (backend routes + adapters)
   - /v1/search behavior, caching TTL, rate-limit handling, redirect allowlist, token expiry
3) Contract tests (OpenAPI alignment)
   - response shape matches `openapi.yaml`
4) E2E tests (optional for v1 MVP)
   - search -> results -> book redirect (can be deferred until core stable)

## 3) Mandatory Test Cases by Component
### Scoring (packages/shared)
- computeValueScore correctness
- timeValuePerHour bounds (0..200)
- durationMinutes validation (>0)
- tie-breaking determinism

### Backend /v1/search
- 200 happy path returns sorted results + lastUpdated + partial
- TTL cache hit/miss behavior + refresh bypass
- provider timeout -> 504
- provider 429 -> backend 429 + retryAfterMs (no retries)
- redaction: logs do not contain booking URLs/tokens

### Backend /v1/redirect/{token}
- valid token -> 302
- expired token -> 410
- unknown token -> 404
- non-allowlisted host -> 400

## 4) Mocking & Fixtures Rules (to keep tests stable)
- Provider calls MUST be mocked in tests (no real network).
- Store provider response fixtures under a `fixtures/` directory.
- Do not commit secrets; fixtures must not contain partner tokens.

## 5) “Done Means” Checklist (apply to every ticket)
- ✅ failing test exists before implementation
- ✅ tests pass
- ✅ negative tests included where relevant
- ✅ no secret leakage in logs/output
- ✅ updated docs if behavior changes contract/UX
