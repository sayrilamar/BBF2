# CONTEXT.md — Product Context, Definitions, and Constraints

## 1) Product Summary
- **Name (placeholder):** FlightValue
- **Type:** Metasearch flight search + compare (no booking)
- **Core promise:** “Best value” is **explicit** and **explained**.

## 2) Key Definitions
- **Total Price:** base fare + taxes/fees as returned by provider.
- **Total Duration:** itinerary duration including layovers, in minutes.
- **TimeValuePerHour:** user’s time valuation in currency units/hour, used to convert time into money for ranking.
- **ValueScore:** `TotalPrice + (DurationHours * TimeValuePerHour)` (lower is better).

## 3) User Experience Requirements (non-negotiable)
1) Default sort shows “Best Value” first.
2) User can understand ranking rationale in ≤ 1 tap.
3) ValueScore and breakdown are visible per result.
4) No login required; TimeValuePerHour stored locally.

## 4) Data Handling / Privacy Boundaries
- Do NOT store:
  - passport numbers, DOB, payment info, KTN, addresses
- If analytics added:
  - avoid logging raw booking URLs with tokens
  - avoid storing precise user-entered text beyond IATA codes and dates

## 5) Provider Strategy (Pluggable)
### 5.1 Provider Requirements
A chosen provider MUST support:
- Global flight search coverage (as needed for “global launch”)
- Price details sufficient for total and ideally breakdown
- Itinerary durations and segment info
- Deep-link booking URLs (affiliate or partner)

### 5.2 Provider Adapter Interface (concept)
- Input: SearchRequest
- Output: ProviderResponse mappable to internal Itinerary schema
- Must support:
  - timeouts
  - error classification (timeout vs rate limit vs invalid request)

## 6) Freshness Policy
- Cache TTL: ≤ 60 seconds per identical search query.
- UI must show lastUpdated.
- Manual refresh triggers new provider call (subject to rate limiting).

## 7) Determinism & Explainability
- The same inputs MUST produce the same ValueScore and ordering.
- Tie-breaking MUST be consistent (ValueScore -> price -> duration -> stable id).

## 8) Constraints Recap
- Platforms: iOS + Android
- v1: search + compare only
- No accounts, no booking, no payments, no support model
- Performance: results ≤ 5 seconds p95
