# TASKS.md — Sequenced Agent Tickets (Build Order)

## Ticket 1 — Finalize Value Score Model + Tie-breaking
**Objective:** Lock scoring, transparency rules, and deterministic sorting.
- **Steps:**
  1) Implement `ValueScore = TotalPrice + (DurationMinutes/60)*TimeValuePerHour`.
  2) Define TimeValuePerHour default=30, range 0..200, persisted locally.
  3) Define tie-breakers:
     - If ValueScore ties: lower total price wins
     - If still ties: shorter duration wins
     - If still ties: stable sort by itinerary id
  4) Define badges: Best Value (top by ValueScore), Cheapest, Fastest.
- **Outputs:** Scoring spec + examples (documented), unit test cases list.
- **Done means:**
  - Score formula is documented and deterministic.
  - At least 10 example itineraries with expected ordering.
- **Tests:** See TESTPLAN Unit section.

## Ticket 2 — Define Internal Data Contracts (Schemas)
**Objective:** Create canonical SearchRequest and Itinerary schemas.
- **Steps:**
  1) Define SearchRequest fields (origin, destination, dates, pax, cabin, currency).
  2) Define Itinerary + Segment models with required fields.
  3) Add validation rules (e.g., durationMinutes > 0, prices ≥ 0).
- **Outputs:** JSON Schema or typed models + validation rules.
- **Done means:** Backend and mobile can share/align on the same contract.

## Ticket 3 — Backend API: /search Endpoint Skeleton (Option A)
**Objective:** Provide a stable API surface for mobile.
- **Steps:**
  1) Implement `POST /search` accepting SearchRequest.
  2) Return mocked Itinerary results using the internal schema.
  3) Include `lastUpdated`, `partial`, `warnings`.
- **Files:** backend service (new)
- **Done means:**
  - Contract tests pass (request/response shape).
  - Mobile can call endpoint and render list.

## Ticket 4 — Provider Adapter Interface + Stub Implementation
**Objective:** Allow plugging in real providers later without refactor.
- **Steps:**
  1) Create ProviderAdapter interface:
     - `searchFlights(SearchRequest) -> ProviderResponse`
  2) Create mapping layer:
     - ProviderResponse -> Itinerary[]
  3) Ensure mapping populates base fare, taxes/fees, total, duration, segments, bookingUrl.
- **Done means:** Swap stub to real provider with minimal changes.
- **Risks:** Provider may not supply base fare vs taxes split.

## Ticket 5 — Caching + TTL + Freshness UI Fields
**Objective:** Ensure “up-to-date” behavior and meet latency.
- **Steps:**
  1) Cache key = normalized SearchRequest (origin/dest/dates/pax/cabin/currency).
  2) TTL ≤ 60s, configurable.
  3) Add refresh endpoint behavior (or `forceRefresh=true` query).
  4) Populate `lastUpdated` from provider response time.
- **Done means:**
  - Cache never serves beyond TTL.
  - Refresh bypasses cache (respect rate limit).
- **Tests:** TTL boundary tests, cache hit/miss tests.

## Ticket 6 — Ranking + Sorting + Filtering (Backend or Client, single source of truth)
**Objective:** Guarantee consistent ordering and user comprehension.
- **Steps:**
  1) Implement ValueScore computation in one place (preferred: backend).
  2) Default sort by ValueScore.
  3) Support alternate sorts: price, duration, departure time.
  4) Apply filters: stops, price range, max duration, departure window.
- **Done means:** For a given response, ordering matches formula and filters apply correctly.

## Ticket 7 — Mobile UI: Search Form
**Objective:** User can input valid searches quickly.
- **Steps:**
  1) Inputs: origin, destination, depart date, optional return date.
  2) Validate before submit; show inline errors.
  3) Add “Time value ($/hr)” control (simple slider/settings panel).
- **Done means:** User can submit one-way and round-trip searches.

## Ticket 8 — Mobile UI: Results List + Explanation
**Objective:** User can visually determine best flights in order with transparent scoring.
- **Steps:**
  1) Render list ordered by ValueScore with “Best Value” badge.
  2) Show ValueScore breakdown line per result.
  3) Add “How ranking works” modal (formula + examples).
  4) Add “Last updated” and “Refresh” control.
- **Accessibility:** Ensure screen reader labels cover badges and breakdown.
- **Done means:** A first-time user can explain why the top result is top.

## Ticket 9 — Deep-link Handling + Tracking
**Objective:** Metasearch redirect is reliable and safe.
- **Steps:**
  1) Use backend-generated booking URLs with tracking params.
  2) Open in external browser (or in-app webview if explicitly chosen).
  3) Ensure no secret tokens in client logs.
- **Done means:** “Book” consistently opens correct provider page.

## Ticket 10 — Performance + Monitoring
**Objective:** Hit ≤5s p95 and detect regressions.
- **Steps:**
  1) Instrument latency metrics and error rates.
  2) Add synthetic tests for common routes.
  3) Add basic load test for /search.
- **Done means:** Performance acceptance criterion is measurable and tracked.
