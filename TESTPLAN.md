# TESTPLAN.md — Verification Plan

## 1. Unit Tests
### 1.1 ValueScore computation
- Given (price, durationMinutes, timeValuePerHour) -> ValueScore equals:
  - `price + (durationMinutes/60)*timeValuePerHour`
- Boundary cases:
  - durationMinutes = 0 (reject/validate)
  - timeValuePerHour = 0 (score == price)
  - large durationMinutes (e.g., 2000)
- Deterministic tie-breaking tests:
  - same ValueScore -> lower price wins
  - same ValueScore + same price -> shorter duration wins
  - stable ordering thereafter

### 1.2 Formatting / UI strings
- Duration formatting hh:mm from minutes
- ValueScore breakdown string correctness

### 1.3 Filter logic
- Stops filter
- Departure time window filter
- Price range filter
- Max duration filter

## 2. Integration Tests
### 2.1 /search contract tests
- Valid SearchRequest returns 200 with:
  - results[] containing required fields
  - lastUpdated present
  - partial boolean present
- Invalid requests return 400 (missing origin/dest, invalid dates)

### 2.2 Provider adapter mapping
- ProviderResponse -> Itinerary mapping populates:
  - baseFare, taxesFees, total
  - durationMinutes, stops, segments
  - bookingUrl
- If provider lacks a field:
  - verify fallback behavior (e.g., taxesFeesAmount = null or 0 with warning)

### 2.3 Cache TTL tests
- Same query within TTL returns cached results
- After TTL, cache miss triggers provider call
- Force refresh bypasses cache

### 2.4 Redaction tests (security)
- Logs do not contain partner tokens or raw booking URLs if sensitive parameters exist

## 3. E2E Tests (Mobile + Backend)
1) One-way flow:
   - Enter origin/destination/date -> results render ordered by ValueScore
   - Best Value badge appears on first item
2) Round-trip flow:
   - Add return date -> results render
3) Transparency:
   - Tap “How ranking works” -> formula shown
   - Each result shows breakdown line
4) Freshness:
   - “Last updated” visible
   - Refresh updates lastUpdated and can change results
5) Deep-link:
   - Tap “Book” -> external URL opens successfully

## 4. Performance Tests
- Measure p95 from search submit to results rendered:
  - Target: ≤ 5.0 seconds
- Backend:
  - Provider call budget (target): ≤ 3.5 seconds typical
  - Cache hit response: ≤ 500ms typical

## 5. Edge Cases & Negative Tests
- No results found -> empty state with suggestion to modify filters/dates
- Provider partial outage -> partial=true banner shown
- Provider timeout -> actionable retry message
- Extremely high prices / long durations -> formatting still correct
- Crossing time zones and date line -> depart/arrive local times display correctly
- Currency mismatch -> warning displayed; ValueScore uses displayed currency consistently
