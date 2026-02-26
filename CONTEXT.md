# CONTEXT.md — Product Context, Decisions, Provider Notes (Updated)

## 1) Product Summary
- **Name (placeholder):** FlightValue
- **Type:** Metasearch flight search + compare (no booking)
- **Core promise:** “Best value” is explicit and explained.

## 2) Key Definitions
- **Total Price:** base fare + taxes/fees as returned by provider.
- **Total Duration:** itinerary duration including layovers, in minutes.
- **TimeValuePerHour:** user valuation in provider currency units/hour.
- **ValueScore:** `TotalPrice + (DurationHours * TimeValuePerHour)` (lower is better).

## 3) Non-Negotiable UX Requirements
1) Default sort shows “Best Value” first.
2) Ranking explanation reachable within 1 tap.
3) ValueScore + breakdown visible per result.
4) No login; TimeValuePerHour stored locally.

## 4) Privacy / Data Boundaries (v1)
- Do NOT store: passport numbers, DOB, payment info, KTN, addresses.
- Logs MUST redact partner tokens and must not store full booking deeplink URLs.
- Analytics (if enabled) must avoid collecting anything beyond:
  - IATA codes, dates, pax count, cabin, performance timings, and coarse device/app version.

## 5) Provider Decision (v1)
### 5.1 Selected Provider
- **Expedia Group Travel Redirect API — Flight Listings API** (metasearch + deeplink to Expedia to complete booking off-app).

### 5.2 Expedia Call Characteristics (agent-facing)
- Endpoint: `https://apim.expedia.com/flights/listings`
- Required headers:
  - `Accept: application/vnd.exp-flight.v3+json`
  - `Key: <Travel Redirect API Key>`
  - `Authorization: Basic <base64(username:password)>`
  - `Partner-Transaction-Id: <unique per request>`
- Response includes an external booking deeplink under:
  - `Offers[].Links.WebDetails.Href`

### 5.3 Known Constraints to Encode
- Passenger count for deeplink flows can be constrained (v1 supports 1..6 passengers).
- Multi-city exists in provider, but v1 excludes multi-city.

## 6) Architecture Decision (v1)
- **Backend proxy is mandatory**
  - Mobile never calls provider directly.
  - Provider credentials stored server-side only (secret manager in prod).
- Backend responsibilities:
  - provider adapter
  - caching (short TTL) + normalization
  - rate-limit handling + backpressure
  - redirect tokenization + allowlist enforcement
  - score computation (single source of truth)

## 7) Freshness & Cache Policy (Provider-Aware)
- For Expedia:
  - Short TTL caching is allowed/encouraged to reduce rate-limit risk.
  - Use rate-limit headers to avoid spikes; do not retry 429.
- Cache TTL default: 30s (must be ≤ 60s), configurable.
- Manual refresh bypasses cache unless rate-limited.

## 8) Rate Limiting Policy (Expedia)
- Observe Expedia response headers:
  - `EG-Rate-Limit-Minute`
  - `EG-Rate-Limit-Remaining-Minute`
  - `EG-Rate-Limit-Reset-Minute`
- On 429:
  - no automatic retry
  - return `retryAfterMs` to client and show user message.

## 9) Currency Decision (v1)
- Display provider currency only.
- TimeValuePerHour uses the same displayed currency units.

## 10) Crash Reporting (recommended v1)
- Use Sentry (crash reporting only).
- Do not attach PII; do not attach booking URLs with tokens.

## 11) App Store / Legal Minimums (pre-release checklist)
- Apple: provide a publicly accessible **privacy policy URL** in App Store Connect.
- Google Play: complete **Data safety** disclosures; provide privacy policy link in Play Console and in-app.

## 12) Future Provider Expansion (v2+)
- Keep provider adapter interface stable so additional providers can be added.
- Any provider-specific caching restrictions must be encoded in a `CachePolicy` implementation.
