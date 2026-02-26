# ANALYTICS.md (v1 Minimal)

## Principles
- No PII
- No full booking URLs
- No freeform text logging

## Events (suggested)
1) search_submitted
   - origin, destination (IATA), isRoundTrip, paxCount, cabin
2) results_loaded
   - resultCount, partial, latencyMs, cacheHit(boolean)
3) filter_applied
   - filterType, filterValueBucket
4) sort_changed
   - sortType
5) book_clicked
   - itineraryId, rankIndex

## Crash reporting (Sentry)
- Enable crashes only
- Do not attach bookingUrl or request bodies
