# SPEC.md — FlightValue (Metasearch) — Agent-Executable Business Requirements Spec

## 0. Context Snapshot (Context Engineering)
- **What the agent currently knows:**
  1) Product is a **metasearch-only** flight search + compare app (no booking, no payments, no accounts).
  2) Core differentiator: a **transparent “bang for buck” ranking** driven by **(price + duration)**, not an ambiguous “Best”.
  3) Platforms: **iOS + Android** (v1). Global launch. One-way + round-trip.
  4) v1 shows **base fare**, **taxes/fees**, and **total price**.
  5) No traveler profiles, post-booking, or support model in v1.
  6) No storage of sensitive PII (passport/DOB/payment/KTN/address) in v1.
  7) Performance target: **search results ≤ 5 seconds**.
  8) User must be able to **visually determine best flights in order**.
  9) User should have **up-to-date flight + price data when searching**.

- **What the agent must not assume:**
  1) A specific flight data provider/GDS/aggregator is chosen.
  2) In-app booking, payments, refunds, changes/cancels exist in v1.
  3) User accounts or server-side user profiles exist in v1.
  4) The app stores sensitive PII.

- **What is missing (blocking):**
  - None for a business requirements spec. (Provider selection is an implementation dependency, handled via a pluggable interface.)

- **Confidence to proceed:** 92%

---

## 1. Problem Statement
Users want to search flights and quickly identify the best “bang for their buck” options based on **price** and **total travel time**. Existing apps often label results as “Best” without clear rationale, reducing trust and forcing manual comparison.

---

## 2. Goals
1) Make “best value” **unambiguous** by ranking flights using a clearly defined, user-visible formula combining:
   - **Total price** (base + taxes/fees)
   - **Total duration** (hours/minutes, including layovers)
2) Return search results in **≤ 5 seconds** (p95 for typical queries).
3) Ensure data shown is **fresh** relative to the provider (no stale cache beyond defined TTL).
4) Support **global** usage (international airports, time zones, currencies as provided).

---

## 3. Non-Goals (v1)
1) Booking flights in-app (payments, fraud, ticketing, post-booking servicing).
2) User accounts, login, traveler profiles, saved passengers.
3) Customer support workflows.
4) Loyalty programs, points optimization, bundles (hotel/car).
5) Full IRROPS/disruption handling.

---

## 4. Users / Stakeholders (agent-facing)
- **Primary users:** cost/time-sensitive travelers (leisure or business) who want a transparent tradeoff.
- **Stakeholders:** product owner, mobile engineering, backend engineering (if used), analytics/marketing (optional), legal/privacy reviewer.

---

## 5. Scope & Boundaries
### 5.1 In scope (v1)
1) Flight search for:
   - One-way: origin + destination + depart date
   - Round-trip: origin + destination + depart date + return date
2) Display results list with:
   - Total price, base fare, taxes/fees, currency
   - Duration (hh:mm), number of stops, segments overview
   - Deep-link “Book” redirect to provider/partner
3) Ranking & sorting:
   - Default sort = **Value Score** (transparent)
   - Alternative sorts = price, duration, depart time
4) Basic filters (minimum viable):
   - Stops (nonstop / 1 stop / 2+)
   - Departure time window (morning/afternoon/evening or time ranges)
   - Max duration
   - Price range
5) Data freshness controls (TTL, refresh, “last updated” indicator).

### 5.2 Out of scope (v1)
- Any booking funnel or payment capture.
- User accounts and server-side personalization.

---

## 6. Requirements

### 6.1 Functional Requirements
#### FR-1 Search Inputs
1) User MUST be able to enter:
   - Origin (airport/city code)
   - Destination (airport/city code)
   - Depart date
   - Optional return date (enables round-trip)
2) User SHOULD be able to adjust:
   - Passengers (default 1 adult)
   - Cabin (default Economy)
3) The app MUST validate inputs before calling search:
   - Origin != destination
   - Dates are valid and not in the past (based on user locale date)

#### FR-2 Results Retrieval
1) System MUST query a flight data source (provider) and retrieve flight itineraries with:
   - Pricing breakdown: base fare, taxes/fees, total
   - Currency
   - Duration minutes (door-to-door itinerary duration)
   - Segment details (airline, flight number optional, depart/arrive timestamps, stops/layovers)
   - Deep-link / booking URL
2) System MUST implement request timeouts and partial results handling (see Failure Modes).

#### FR-3 Value Score (Bang-for-Buck) Ranking — Transparent
1) System MUST compute a **Value Score** from **Total Price** and **Total Duration**.
2) The Value Score formula MUST be:
   - `ValueScore = TotalPrice + (DurationHours * TimeValuePerHour)`
   - Where:
     - `DurationHours = DurationMinutes / 60`
     - `TimeValuePerHour` defaults to **30** in the displayed currency units (see currency notes below)
3) The UI MUST explain the formula in plain language and show the inputs used per result:
   - Total price
   - Total duration
   - TimeValuePerHour setting used
4) The user MUST be able to adjust TimeValuePerHour locally (no account required):
   - Range: 0 to 200 (currency units per hour)
   - Default: 30
   - Persist locally on device (local storage)
5) Ranking MUST sort ascending by ValueScore (lower is “better value”).

> Rationale: This converts time into a monetary equivalent, making the “bang for buck” tradeoff explicit and user-controlled.

#### FR-4 Badges and Visual Determination of “Best”
1) Results list MUST display:
   - A “Best Value” badge for the top ValueScore result (ties handled deterministically)
   - Optional “Cheapest” and “Fastest” badges for minimum total price and minimum duration
2) The list MUST be ordered by ValueScore by default.
3) Each result card MUST display ValueScore and a short breakdown:
   - Example: “$412 + (7h 30m × $30/h) = $637”

#### FR-5 Price Display
1) System MUST display:
   - Base fare
   - Taxes/fees
   - Total price
2) Total price MUST be the primary emphasized price.
3) System MUST show a disclaimer: “Prices can change; final price shown on provider site.”

#### FR-6 Deep-link Redirect (Metasearch)
1) Each result MUST include a “Book” action that opens the provider/partner deep-link.
2) Tracking parameters MUST be supported (affiliate/campaign) without exposing secrets in the client (see Architecture).

#### FR-7 Freshness / Up-to-date Data
1) For each search, system MUST request live results from provider (no offline-only results).
2) Caching MUST be limited:
   - Search result cache TTL MUST be ≤ 60 seconds per identical query (configurable).
3) UI MUST show “Last updated” timestamp for current results.
4) UI MUST allow manual refresh that triggers a new provider request (respecting rate limits).

#### FR-8 Localization (Global)
1) System MUST handle:
   - Time zones for depart/arrive times
   - Date formatting per locale
2) Currency handling:
   - If provider returns prices in a single currency for the user market, display that currency.
   - If provider returns multiple currencies, system MUST normalize display currency per query (see Architecture options).

### 6.2 Non-Functional Requirements
#### NFR-Privacy & Data Handling
1) System MUST NOT collect/store sensitive PII (passport, DOB, payment, KTN, address) in v1.
2) Analytics (if enabled) MUST be:
   - Opt-in where required by law
   - Anonymous/pseudonymous, no raw query strings that include user-typed freeform PII
3) Logs MUST NOT include full deep-link URLs if they contain partner tokens; redact secrets.

#### NFR-Reliability
1) Provider calls MUST use:
   - Timeout (e.g., 3.5s upstream budget to meet 5s p95 end-to-end)
   - Retries with exponential backoff for transient failures (max 1 retry to protect latency)
2) System MUST gracefully degrade:
   - If provider partially fails, show partial results with a banner
   - If provider fully fails, show actionable error and allow retry

#### NFR-Performance
1) Search results MUST render ≤ 5 seconds p95 for typical global queries on mid-tier devices + average network.
2) The system SHOULD progressively render (show skeleton UI, then results).

#### NFR-Maintainability
1) ValueScore computation MUST be centralized in one module with unit tests.
2) Provider integration MUST be behind an interface so providers can be swapped.

#### NFR-Accessibility/UX
1) Results list MUST be usable with screen readers:
   - ValueScore explanation accessible (aria labels / accessibility labels)
   - Badges announced meaningfully (“Best Value”)
2) Touch targets MUST meet mobile accessibility guidelines.
3) Color MUST NOT be the only indicator of “best” (use text/badge/icons).

### 6.3 Acceptance Criteria (testable)
1) **Performance:** For a standard search query, p95 end-to-end time from “Search” tap to list displayed is **≤ 5.0 seconds**.
2) **Ranking correctness:** For any given result set, the displayed order matches ascending ValueScore computed from displayed price/duration/TimeValuePerHour.
3) **Transparency:** Every result shows the ValueScore breakdown, and the formula is discoverable within 1 tap from results.
4) **Freshness:** Cached results are never served beyond **60 seconds TTL** without a refresh; “Last updated” reflects the timestamp of provider response.
5) **Metasearch behavior:** “Book” always opens an external URL (provider/partner) and the app does not collect payment or booking details.

---

## 7. Architecture & Design

### 7.1 System Overview
Two viable architectures (v1 chooses one; both supported by requirements):
- **Option A (Recommended): Client → Backend → Provider**
  - Backend hides provider keys, normalizes data, applies scoring, adds tracking, enforces caching/rate limiting.
- **Option B: Client → Provider directly**
  - Only acceptable if provider supports public client auth and security constraints are met; usually not preferred.

**Default in this spec: Option A.**

### 7.2 Components & Responsibilities
1) **Mobile App (iOS/Android)**
   - Search form UI + validation
   - Results list UI, filters, sorts
   - Display ValueScore + breakdown
   - Local persistence of TimeValuePerHour
2) **Backend API**
   - `/search` endpoint
   - Provider adapter(s)
   - Cache + TTL enforcement
   - ValueScore computation (or return raw and let client compute; choose one, but keep single source of truth)
   - Tracking link generation
3) **Provider Adapter**
   - Translates internal query → provider request
   - Maps provider response → internal itinerary schema
4) **Observability**
   - Latency metrics (overall + provider)
   - Error rates, timeouts, cache hit rates

### 7.3 Data Model / Schemas
#### SearchRequest (internal)
- origin: string (IATA airport/city code)
- destination: string (IATA airport/city code)
- departDate: YYYY-MM-DD
- returnDate?: YYYY-MM-DD
- passengers:
  - adults: int (>=1)
- cabin: enum [ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST]
- currency?: string (ISO 4217) (optional; backend may infer)
- timeValuePerHour?: number (optional; backend can accept for scoring transparency)

#### Itinerary (internal)
- id: string
- totalPrice:
  - amount: number
  - currency: string
  - baseFareAmount: number
  - taxesFeesAmount: number
- durationMinutes: int
- stops: int
- segments: array of Segment
- provider:
  - name: string
  - bookingUrl: string (deep-link)
- valueScore:
  - amount: number
  - currency: string
  - timeValuePerHourUsed: number

#### Segment (internal)
- carrier: string
- flightNumber?: string
- depart:
  - airport: string
  - timeLocalISO: string
  - timeZone: string
- arrive:
  - airport: string
  - timeLocalISO: string
  - timeZone: string
- durationMinutes: int

### 7.4 Interfaces / APIs / Contracts (with examples)
#### Backend: POST /search
- Request: SearchRequest JSON
- Response:
  - results: Itinerary[]
  - lastUpdated: ISO timestamp
  - partial: boolean
  - warnings?: string[]

Example (abbreviated):
- ValueScore computed as: `totalPrice.amount + (durationMinutes/60)*timeValuePerHourUsed`

### 7.5 Error Handling & Failure Modes
1) Provider timeout:
   - Return partial=false, results=[], warning “Provider timed out; try again.”
2) Partial results:
   - Return partial=true and warnings; UI banner “Some results may be missing.”
3) Rate limiting:
   - Backend returns 429 with retry-after; client shows “Too many searches, retry shortly.”
4) Currency ambiguity:
   - If multiple currencies and no FX normalization available, restrict to provider’s currency and disclose.

### 7.6 Observability (logs/metrics/traces)
Backend MUST record:
- request_id correlation across client/backend/provider
- latency: overall, provider_call, cache
- error type counts
- cache hit ratio
Logs MUST redact partner tokens and secrets.

---

## 8. Execution Environment Guidance (Universal)
### 8.1 IDE Agent Notes
- Implement modules in isolation first:
  1) ValueScore library + tests
  2) Internal schemas
  3) Provider adapter stub
  4) Backend endpoint
  5) Mobile UI integration

### 8.2 CLI/Task-Runner Agent Notes
- Provide scripts to run:
  - unit tests for scoring
  - contract tests for `/search`
  - load test hitting `/search` for p95 latency

### 8.3 Chat-Only Agent Notes
- Use this spec to generate:
  - API contract
  - UI wireflow text descriptions
  - test cases and edge cases
  - backlog tickets (see TASKS.md)

### 8.4 Multi-Agent Orchestration Notes (Planner→Implementer→Reviewer)
- Planner: confirm provider strategy + caching + currency approach.
- Implementer: build scoring + backend contract + UI.
- Reviewer: validate acceptance criteria, accessibility labels, and determinism of ranking.

---

## 9. Task Breakdown (summary)
(Full tickets in TASKS.md)
1) Define scoring model and UI disclosure.
2) Define schemas + contract for `/search`.
3) Implement backend scaffolding + provider adapter stub.
4) Implement caching/TTL + refresh behavior.
5) Implement mobile UI: search, results, badges, filters, sorts, explanation.
6) Add test coverage + performance checks.

---

## 10. Test Plan (summary)
(Full plan in TESTPLAN.md)
- Unit: score computation, tie-breaking, formatting
- Integration: provider adapter mapping, cache TTL, `/search` contract
- E2E: search → results in ≤5s p95, ranking visible, refresh updates lastUpdated

---

## 11. Risks / Assumptions / Open Questions
### Assumptions
1) A provider exists that supports global inventory and deep-linking for metasearch.
2) Provider returns enough data for price breakdown and duration.

### Risks
1) Provider latency may threaten 5s p95 globally.
2) Currency normalization may be inconsistent without an FX strategy.
3) Deep-link tracking tokens could leak if not handled server-side.

### Open Questions (non-blocking for BRS, but blocking for implementation)
1) Which provider(s) will be used first?
2) Currency strategy:
   - Display provider currency only vs normalize to user locale currency via FX rates
3) Filter breadth for v1:
   - Airlines, baggage, layover duration constraints (if needed)

---

## 12. Agent Context Pack
- **Read list (files/paths):**
  - This spec folder: `SPEC.md`, `TASKS.md`, `TESTPLAN.md`, `CONTEXT.md`
- **Write list (files to edit/create):**
  - If implementing: mobile app repo(s), backend repo, CI config, API docs
- **Commands/tools available:**
  - Repo-dependent; must include unit tests + API tests + basic load test
- **Secrets & config handling:**
  - Provider keys MUST live server-side only (Option A).
  - Tracking tokens MUST be generated server-side; never hardcode in client.
- **Constraints recap:**
  - Metasearch only, no accounts, no booking/payment, transparent score, ≤5s p95, minimal PII.

---

## 13. Spec Review (Red-team + execution check)
### Ambiguities / Missing info
1) Provider selection and its data capabilities (price breakdown, deep links, latency).
2) Currency normalization expectations for “global”.
3) Default TimeValuePerHour might need product validation.

### Agent-execution blockers
- None for a BRS. For implementation, provider selection is the main blocker.

### Proposed fixes (applied in this spec)
1) Defined a pluggable Provider Adapter interface and internal schemas.
2) Defined explicit cache TTL and “last updated”.
3) Made TimeValuePerHour user-adjustable to avoid a “magic” default.
