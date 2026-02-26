# TASKS.md — Sequenced Agent Tickets (Build Order) (Updated)

> NOTE: This backlog assumes the chosen v1 decisions:
> - Provider: Expedia Travel Redirect API (Flight Listings)
> - Architecture: Backend proxy required
> - Currency: Provider currency only (no FX normalization)
> - Metasearch only (no booking in-app)

---

## Ticket 1 — Finalize Value Score Model + Tie-breaking (Core Differentiator)
**Objective:** Lock scoring, transparency rules, and deterministic sorting.
- **Steps:**
  1) Implement `ValueScore = TotalPrice + (DurationMinutes/60)*TimeValuePerHour`.
  2) Default `TimeValuePerHour=30`, range 0..200, persisted locally on device.
  3) Tie-breakers:
     - If ValueScore ties: lower total price wins
     - If still ties: shorter duration wins
     - If still ties: stable sort by itinerary id
  4) Define badges: Best Value (top ValueScore), Cheapest, Fastest.
  5) Define display breakdown format (per result).
- **Files (expected):**
  - `packages/shared/scoring.ts`
  - `packages/shared/scoring.test.ts`
  - `docs/UX_COPY.md` (if used for strings)
- **Commands:** `pnpm test` (or repo-equivalent)
- **Done means:**
  - Score formula and tie-breaker behavior are fully deterministic and unit tested.
  - At least 10 fixture itineraries with expected ordering.
- **Tests:** Unit tests for compute + compare + formatting.

---

## Ticket 2 — Canonical Data Contracts (Schemas) + Validation Rules
**Objective:** Create canonical API request/response schemas used by backend + mobile.
- **Steps:**
  1) Define `SearchRequest`, `SearchResponse`, `Itinerary`, `Segment` types.
  2) Add validation rules:
     - origin != destination
     - dates valid/not in past
     - passengers adults 1..6
     - durationMinutes > 0
     - prices >= 0
  3) Publish OpenAPI contract for `/v1/search` + `/v1/redirect/{token}`.
- **Files (expected):**
  - `openapi.yaml`
  - `packages/shared/types.ts` (or `schemas/`)
  - `services/api/src/validators/*`
- **Commands:** `pnpm lint`, `pnpm test`
- **Done means:**
  - Contract is stable and validated at runtime in backend.
  - Mobile can generate types (optional) or share types.
- **Tests:** Contract validation tests + negative tests.

---

## Ticket 3 — Backend Service Skeleton (Proxy-First)
**Objective:** Stand up backend API surface with health + stub search.
- **Steps:**
  1) Create `GET /healthz`.
  2) Create `POST /v1/search` that returns mocked itineraries using canonical schema.
  3) Implement request-id / correlation-id (Partner-Transaction-Id) generation and propagation in logs.
  4) Add structured logging with redaction hooks (no URLs with tokens).
- **Files (expected):**
  - `services/api/src/server.ts`
  - `services/api/src/routes/search.ts`
  - `services/api/src/routes/healthz.ts`
  - `services/api/src/observability/logger.ts`
- **Commands:** `pnpm dev`, `pnpm test`
- **Done means:**
  - Backend boots locally and serves schema-compliant stub responses.
  - Logs contain correlation ids and do not contain sensitive URL params.
- **Tests:** Smoke tests + minimal integration tests for endpoints.

---

## Ticket 4 — Provider Adapter Interface + Expedia Adapter (Real Integration)
**Objective:** Implement pluggable provider integration with Expedia Flight Listings.
- **Steps:**
  1) Define `FlightProviderAdapter` interface (`search(req, ctx) -> ProviderSearchResult`).
  2) Implement `ExpediaAdapter`:
     - map SearchRequest -> Expedia query params
     - set required headers (Accept, Key, Authorization, Partner-Transaction-Id)
     - parse response into internal `ProviderItinerary[]`
     - extract booking URL from `Offers[].Links.WebDetails.Href`
  3) Add strict timeout handling (provider call budget).
  4) Implement safe error classification (timeout, 429, 4xx, 5xx).
- **Files (expected):**
  - `services/api/src/providers/FlightProviderAdapter.ts`
  - `services/api/src/providers/expedia/ExpediaAdapter.ts`
  - `services/api/src/providers/expedia/ExpediaAdapter.NOTES.md`
- **Commands:** `pnpm test`
- **Done means:**
  - With valid Expedia creds, `/v1/search` returns real results mapped to internal schema.
  - With missing/invalid creds, errors are returned cleanly without leaking secrets.
- **Tests:**
  - Adapter mapping tests (using recorded fixtures where allowed)
  - Error classification tests (mock HTTP)

---

## Ticket 5 — Provider-Aware Cache Policy Interface + TTL Cache
**Objective:** Implement caching that respects provider rules and spec freshness requirements.
- **Steps:**
  1) Create `CachePolicy` abstraction:
     - `isCacheAllowed(providerName)` (Expedia: yes)
     - TTL seconds (default 30, max 60)
     - cache key normalization rules
  2) Implement cache store (in-memory for dev; Redis optional for prod).
  3) Cache only successful search responses (200) for TTL.
  4) Implement `forceRefresh=true` behavior to bypass cache.
  5) Ensure response includes `lastUpdated` (provider timestamp or fetch time).
- **Files (expected):**
  - `services/api/src/cache/CachePolicy.ts`
  - `services/api/src/cache/store.ts`
  - `services/api/src/routes/search.ts`
- **Commands:** `pnpm test`
- **Done means:**
  - Cache never serves beyond TTL.
  - Refresh bypasses cache (unless rate-limited).
- **Tests:** TTL boundary tests + cache key normalization tests.

---

## Ticket 6 — Expedia Rate-Limit Header Parsing + 429 Behavior
**Objective:** Make rate limiting safe and user-visible (no thrashing, no secret leaks).
- **Steps:**
  1) Parse Expedia rate-limit headers:
     - `EG-Rate-Limit-Remaining-Minute`
     - `EG-Rate-Limit-Reset-Minute`
  2) On provider 429:
     - DO NOT retry automatically
     - compute `retryAfterMs` from reset header when available
     - return 429 from backend with `retryAfterMs` and friendly warning
  3) Implement “headroom” protection:
     - if remaining drops below a buffer threshold, optionally short-circuit to cached results (if allowed and present)
- **Files (expected):**
  - `services/api/src/providers/expedia/rateLimit.ts`
  - `services/api/src/routes/search.ts`
- **Commands:** `pnpm test`
- **Done means:**
  - 429 handling matches spec (no automatic retry, actionable retryAfter).
  - Rate-limit metrics exist (counts, frequency).
- **Tests:** Unit tests for header parsing + 429 integration tests.

---

## Ticket 7 — Redirect Tokenization + Allowlist Enforcement (Security-Critical)
**Objective:** Prevent leaking provider deeplinks and stop open-redirect abuse.
- **Steps:**
  1) Backend returns `book.redirectToken` per itinerary (not raw booking URL).
  2) Implement `GET /v1/redirect/{token}`:
     - validates token (exists, not expired)
     - validates allowlisted hostnames (expedia domains)
     - responds with 302 redirect to the provider URL
  3) Token storage strategy:
     - short-lived (e.g., TTL 10–30 minutes)
     - store mapping token -> URL server-side only
  4) Ensure logs redact token and never include full URL query params.
- **Files (expected):**
  - `services/api/src/routes/redirect.ts`
  - `services/api/src/security/redirect.ts`
  - `services/api/src/security/tokenStore.ts`
- **Commands:** `pnpm test`
- **Done means:**
  - Mobile can “Book” via redirect token and always lands on Expedia.
  - Unknown/expired tokens return 404/410.
  - Non-allowlisted URLs return 400.
- **Tests:** Redirect allowlist tests + token expiry tests + negative tests.

---

## Ticket 8 — Backend Scoring + Response Shaping (Single Source of Truth)
**Objective:** Ensure backend returns scored, ordered itineraries matching the transparent formula.
- **Steps:**
  1) Compute ValueScore in backend using `packages/shared/scoring.ts`.
  2) Sort results by compare function.
  3) Attach `valueScore.timeValuePerHourUsed`.
  4) Attach `badges` or enough fields for client to infer badges deterministically.
- **Files (expected):**
  - `services/api/src/routes/search.ts`
  - `packages/shared/scoring.ts`
- **Commands:** `pnpm test`
- **Done means:**
  - Client can render the list “as-is” with correct order and explanation fields.
- **Tests:** Integration tests verifying ordering + tie-breakers.

---

## Ticket 9 — Mobile UI: Search Form (iOS/Android)
**Objective:** User can enter valid searches quickly (no login).
- **Steps:**
  1) Inputs: origin, destination, depart date, optional return date.
  2) Passengers (1..6), cabin (optional).
  3) Validate before submit; show inline errors.
  4) TimeValuePerHour control (slider/settings) persisted locally.
- **Files (expected):**
  - `apps/mobile/src/screens/SearchScreen.tsx`
  - `apps/mobile/src/state/preferences.ts`
- **Commands:** `pnpm mobile:start` (or repo-equivalent)
- **Done means:** User can submit one-way and round-trip searches reliably.

---

## Ticket 10 — Mobile UI: Results List + Explainability + Freshness
**Objective:** User can visually determine best flights in order with transparent scoring.
- **Steps:**
  1) Render list ordered by ValueScore and show “Best Value” badge.
  2) Show per-result breakdown line.
  3) Add “How ranking works” modal (formula + a worked example).
  4) Show “Last updated” + Refresh.
  5) Handle empty states, partial warnings, and rate-limited state using `retryAfterMs`.
- **Accessibility:** Add accessibility labels for badges and breakdown.
- **Files (expected):**
  - `apps/mobile/src/screens/ResultsScreen.tsx`
  - `apps/mobile/src/components/HowRankingWorksModal.tsx`
- **Done means:** A first-time user can explain why result #1 is best value within 1 tap.

---

## Ticket 11 — Mobile “Book” Redirect + Safety
**Objective:** Metasearch redirect works reliably and securely.
- **Steps:**
  1) “Book” opens `GET /v1/redirect/{token}` in external browser.
  2) Confirm no webview injection of tokens and no URL logging.
  3) Track book_clicked event without including URLs.
- **Files (expected):**
  - `apps/mobile/src/utils/openExternal.ts`
  - `apps/mobile/src/screens/ResultsScreen.tsx`
- **Done means:** “Book” always opens external Expedia flow; analytics are URL-free.

---

## Ticket 12 — Observability + Performance (Meet ≤5s p95)
**Objective:** Measure and enforce performance and reliability targets.
- **Steps:**
  1) Add latency metrics: end-to-end, provider call, cache hit/miss.
  2) Add error counters: provider timeout, provider 429, backend 429, mapping errors.
  3) Add basic load test for `/v1/search` and establish p95 measurement.
  4) Add client timing instrumentation (results_loaded latencyMs).
- **Files (expected):**
  - `services/api/src/observability/metrics.ts`
  - `docs/PERFORMANCE.md`
- **Done means:** p95 ≤ 5s is measurable and regressions are detectable.

---

## Ticket 13 — Crash Reporting + Minimal Analytics (Privacy-Safe)
**Objective:** Get signal without collecting sensitive data.
- **Steps:**
  1) Configure Sentry for crashes only (mobile + backend optional).
  2) Implement minimal events (optional): search_submitted, results_loaded, filter_applied, book_clicked.
  3) Ensure payloads contain no PII and no booking URLs.
- **Files (expected):**
  - `docs/ANALYTICS.md`
  - `apps/mobile/src/telemetry/*`
- **Done means:** Crashes and core funnel events are captured without privacy violations.

---

## Ticket 14 — Store Compliance Minimums (Pre-Release Blockers)
**Objective:** Ensure app store submission isn’t blocked late.
- **Steps:**
  1) Add in-app “Privacy Policy” link (Settings/About).
  2) Draft privacy policy reflecting actual data collection.
  3) Prepare Google Play Data safety responses consistent with SDKs used.
- **Files (expected):**
  - `docs/STORE_COMPLIANCE.md`
  - `apps/mobile/src/screens/SettingsScreen.tsx`
- **Done means:** Privacy links and disclosures are ready and consistent with telemetry configuration.
