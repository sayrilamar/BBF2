# SPEC.md — FlightValue (Metasearch) — Agent-Executable Business Requirements Spec (Updated)

## 0. Context Snapshot (Context Engineering)
- **What the agent currently knows:**
  1) Product is a **metasearch-only** flight search + compare app (no booking, no payments, no accounts).
  2) Core differentiator: a **transparent “bang for buck” ranking** driven by **(total price + total duration)** with an explicit user-visible formula.
  3) Platforms: **iOS + Android** (v1). Global. One-way + round-trip (no multi-city in v1).
  4) Pricing display: **base fare**, **taxes/fees**, **total price** (no service fees).
  5) Provider decision (v1): **Expedia Group Travel Redirect API — Flight Listings API**, including outbound deeplinks to Expedia to complete booking (off-app).
  6) Architecture decision: **Backend proxy is required** (mobile never calls Expedia directly).
  7) Currency decision (v1): **provider currency only** (no FX normalization).
  8) Caching decision: **provider-aware cache policy**; for Expedia, short TTL caching is allowed/encouraged to reduce rate-limit risk.
  9) Rate-limit handling: read Expedia `EG-Rate-Limit-*` headers; **do not auto-retry 429**; surface “try again after reset”.
  10) App-store readiness: **privacy policy URL required for App Store submission**; **Google Play requires Data safety disclosures + privacy policy link in Play Console and in-app**.

- **What the agent must not assume:**
  1) In-app booking exists.
  2) User accounts exist.
  3) FX conversion exists in v1.
  4) Provider credentials are safe to embed in client.
  5) Caching rules are uniform across providers.

- **What is missing (blocking):**
  - **Implementation-only**: Expedia partner onboarding credentials and quota values. (Spec is still executable with stubs/mocks.)

- **Confidence to proceed:** 93%

---

## 1. Problem Statement
Users want to search flights and quickly identify the best “bang for their buck” options based on **price** and **total travel time**. Existing apps often label results “Best” without clear rationale, reducing trust and forcing manual comparison.

---

## 2. Goals
1) Make “best value” **unambiguous** by ranking flights using a clearly defined, user-visible formula combining:
   - **Total price** (base + taxes/fees, as provided)
   - **Total duration** (hours/minutes, including layovers)
2) Return search results in **≤ 5 seconds p95** (typical queries).
3) Ensure data shown is **fresh per provider** and not served from stale cache beyond defined TTL.
4) Support **global** usage: international airports and time zones; show provider-returned currency.

---

## 3. Non-Goals (v1)
1) Booking flights in-app (payments, fraud, ticketing, post-booking servicing).
2) User accounts, login, traveler profiles.
3) Customer support workflows.
4) FX normalization across currencies.

---

## 4. Users / Stakeholders (agent-facing)
- Primary users: global travelers who value time + money and want a transparent tradeoff.
- Stakeholders: product owner, mobile, backend, legal/privacy reviewer.

---

## 5. Scope & Boundaries
### 5.1 In scope (v1)
1) Search:
   - One-way + round-trip
   - Passengers supported: **1–6 total** (provider deeplink constraint)
   - Cabin: economy default (others optional if provider supports cleanly)
2) Results list:
   - Total price, base fare, taxes/fees, currency
   - Duration (hh:mm), stops, segments overview
   - “Best Value” badge + transparent breakdown
   - “Book” opens external Expedia deeplink
3) Filters/sorts (minimum viable):
   - Stops; departure time window; max duration; price range
   - Alternate sorts: price, duration, departure time
4) Freshness:
   - “Last updated”
   - Manual refresh
   - Provider-aware cache policy

### 5.2 Out of scope (v1)
- In-app booking, payments, refunds, changes/cancels, post-booking notifications.

---

## 6. Requirements

### 6.1 Functional Requirements
#### FR-1 Search Inputs & Validation
1) User MUST enter origin, destination, depart date; return date optional.
2) User MUST be able to set passengers (default 1 adult), bounded **1..6**.
3) App MUST validate:
   - origin != destination
   - dates valid and not in past
   - passenger count within bounds

#### FR-2 Provider Integration (Expedia Flight Listings)
1) System MUST query Expedia Flight Listings via backend proxy and return itineraries with:
   - pricing totals + breakdown where available
   - duration and segments
   - deeplink URL for external booking
2) Backend MUST call Expedia endpoint and include required headers (Accept, Key, Authorization, Partner-Transaction-Id).
3) Backend MUST generate a unique Partner-Transaction-Id per search request for traceability.
4) Backend MUST enforce timeouts and return partial/failed states (see Failure Modes).

#### FR-3 Value Score (Bang-for-Buck) — Transparent & User-Adjustable
1) ValueScore MUST be computed as:
   - `ValueScore = TotalPrice + (DurationHours * TimeValuePerHour)`
   - `DurationHours = DurationMinutes / 60`
2) `TimeValuePerHour` defaults to **30** (in provider currency units per hour).
3) User MUST be able to adjust TimeValuePerHour locally (no account):
   - range 0..200
   - persisted on-device
4) UI MUST show formula explainability:
   - “How ranking works” screen/modal within 1 tap
   - Per-result breakdown line: `Total + (Duration × $/hr) = Score`

#### FR-4 Ordering, Tie-breaking, Badges
1) Default sort MUST be ascending ValueScore.
2) Tie-breakers MUST be deterministic:
   - lower TotalPrice wins
   - then shorter duration wins
   - then stable by itinerary id
3) Badges:
   - Best Value = first result by ValueScore
   - Optional: Cheapest, Fastest

#### FR-5 Price Display
1) Each result MUST display:
   - total price (primary)
   - base fare
   - taxes/fees
2) UI MUST include disclaimer: “Prices can change; final price shown on Expedia.”

#### FR-6 Metasearch Redirect
1) Each result MUST include “Book” action that opens an **external** Expedia deeplink.
2) Backend SHOULD return booking URLs in a way that avoids leaking partner tokens in logs:
   - preferred: return an **opaque redirect token**; mobile opens `/v1/redirect/{token}` which 302s to Expedia.
3) Redirect MUST enforce an allowlist (Expedia domains) to prevent open-redirect abuse.

#### FR-7 Freshness & Caching (Provider-Aware)
1) Backend MUST implement a provider-aware cache policy:
   - For Expedia: allow short TTL caching to reduce rate-limit risk.
2) TTL MUST be ≤ 60 seconds per identical normalized query (configurable).
3) Response MUST include `lastUpdated` timestamp (provider response time).
4) Manual refresh MUST bypass cache (unless rate-limited).

#### FR-8 Localization (Global)
1) App MUST display local times with correct time zones per segment.
2) Currency MUST be displayed as returned by provider (v1).

### 6.2 Non-Functional Requirements
#### NFR-Privacy & Data Handling
1) System MUST NOT store sensitive PII (passport, DOB, payment info, KTN, addresses).
2) If analytics/crash reporting is enabled:
   - avoid logging full deeplink URLs if they contain partner tokens
   - do not log raw request payloads containing more than IATA codes + dates + passenger count

#### NFR-Reliability & Rate Limiting
1) Backend MUST handle Expedia 429 rate-limit responses by:
   - **not retrying automatically**
   - reading `EG-Rate-Limit-Reset-Minute` when present and returning `retryAfterMs` to client
2) Backend MUST implement bounded retries for transient 5xx/timeouts:
   - max 1 retry with jitter, only if remaining latency budget allows
3) Backend MUST expose partial-results states with warnings.

#### NFR-Performance
1) Search results displayed within ≤ 5 seconds p95 (typical queries).
2) Backend budgets:
   - provider call timeout default ~3.5 seconds to preserve UI budget
3) UI SHOULD render skeleton state immediately and stream results once ready.

#### NFR-Maintainability
1) Provider integration MUST be behind a `FlightProviderAdapter` interface.
2) ValueScore computation MUST be centralized and unit tested.
3) Cache policy MUST be provider-specific and testable.

#### NFR-Accessibility/UX
1) Ranking explanation MUST be accessible via screen reader.
2) “Best Value” MUST not rely on color alone (badge + text).

### 6.3 Acceptance Criteria (testable)
1) p95 search-to-results ≤ 5.0s on representative devices/networks.
2) Ordering matches ValueScore with deterministic tie-breaking.
3) Users can reach ranking explanation within 1 tap from results.
4) Cache never serves beyond TTL; `lastUpdated` reflects provider response time.
5) “Book” opens external Expedia flow; app does not collect payments.

---

## 7. Architecture & Design

### 7.1 System Overview (Chosen)
**Mobile App → FlightValue Backend → Expedia Travel Redirect API (Flight Listings)**

Rationale:
- provider credentials must be kept secret
- backend can implement caching, rate limiting, redaction, and stable schema mapping

### 7.2 Components
1) Mobile:
   - search UI, results UI, filters/sorts
   - local `TimeValuePerHour` storage
   - open redirect endpoint in system browser
2) Backend:
   - `/v1/search` maps to Expedia Flight Listings
   - caching + rate limiting + retries
   - ValueScore computation (single source of truth)
   - `/v1/redirect/{token}` 302 to allowlisted Expedia URL
3) Provider Adapter: Expedia implementation + interface for future providers
4) Observability:
   - correlation id (Partner-Transaction-Id)
   - latency metrics + 429 rate-limit metrics

### 7.3 Data Model
(Keep internal `SearchRequest`, `Itinerary`, `Segment` as the canonical contract; see Kickoff Pack `schemas/types.ts`.)

### 7.4 Error Handling & Failure Modes
1) Provider timeout → 504 equivalent response with actionable retry message.
2) 429 rate-limited → return `retryAfterMs` (from headers if present) and UI “Try again soon”.
3) Partial results (if supported) → return `partial=true` + warnings.
4) Invalid request (400) → validate and surface inline errors in UI.

---

## 8. Execution Environment Guidance (Universal)
### 8.1 Recommended v1 Stack (for agent)
- Mobile: React Native + TypeScript (Expo optional)
- Backend: Node.js + TypeScript (Express/Fastify)
- Crash reporting: Sentry (crashes only)

### 8.2 Multi-Agent Notes
- Planner: confirm partner onboarding steps, quotas, and supported points-of-sale.
- Implementer: scaffold backend + adapter + UI flows using mocks first, then wire Expedia.
- Reviewer: verify privacy redaction, rate-limit behavior, and ranking transparency.

---

## 9–12
Keep TASKS.md and TESTPLAN.md as-is, but implementation should prioritize:
- backend proxy + adapter
- provider-aware caching/rate limiting
- redirect hardening
- ranking explainability
