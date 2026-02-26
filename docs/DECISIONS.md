# DECISIONS.md — FlightValue (v1) Engineering Decisions Record

> Purpose: Provide a single source of truth for key v1 decisions so agents don’t re-litigate choices during implementation.

## 1) Product Scope (v1)
- **Metasearch only**: search + compare + external redirect to book.
- **No in-app booking**: no payments, no ticketing, no post-booking features.
- **No accounts**: no login, no traveler profiles.
- **Search types**: one-way + round-trip (no multi-city in v1).
- **Global launch**: support international airports/time zones.

## 2) Core Ranking Model (“Bang for Buck”)
- Default sort is **ValueScore ascending** (lower = better value).
- Formula:
  - `ValueScore = TotalPrice + (DurationHours * TimeValuePerHour)`
  - `DurationHours = DurationMinutes / 60`
- `TimeValuePerHour`:
  - default **30**
  - user-adjustable **0..200**
  - persisted locally on device (no account)
- Tie-breaking (deterministic):
  1) lower ValueScore
  2) lower TotalPrice
  3) shorter duration
  4) stable by itinerary id

## 3) Provider & Booking Redirect
- v1 provider: **Expedia Group Travel Redirect API — Flight Listings**.
- Booking occurs **off-app** via Expedia deeplink.
- Backend returns **redirect tokens**, not raw booking URLs.
- Redirect endpoint:
  - `GET /v1/redirect/{token}` → 302 to allowlisted Expedia domain(s).

## 4) Architecture
- **Backend proxy is mandatory** (mobile never calls provider directly).
- Provider credentials and partner tokens are stored server-side only.
- Backend responsibilities:
  - provider adapter(s)
  - caching + rate-limit handling
  - redirect tokenization + allowlist enforcement
  - scoring (single source of truth)
  - redaction in logs

## 5) Currency & Localization
- v1 currency: **provider currency only** (no FX normalization).
- Times displayed with correct local time zones per segment.

## 6) Freshness & Caching Policy
- Caching is **provider-aware**.
- For Expedia:
  - short TTL caching is permitted to reduce rate-limit risk.
- Default TTL: **30s** (must be **≤ 60s**).
- Manual refresh bypasses cache unless rate-limited.
- UI shows `lastUpdated` from provider fetch time.

## 7) Rate Limiting Behavior
- Parse Expedia rate-limit headers when present.
- On provider 429:
  - **do not retry automatically**
  - return backend 429 with `retryAfterMs` when derivable
  - UI shows actionable “try again soon” state.

## 8) Security & Privacy
- v1 does **not** store sensitive PII (passport, DOB, payment, KTN, address).
- Never log provider booking URLs or partner tokens.
- Redirect destinations must be allowlisted (prevent open redirects).

## 9) Engineering Methodology (Safest Path)
- **TDD-first (non-negotiable)**: Red → Green → Refactor for every ticket.
- No ticket is “done” without tests passing.
- Start with mocks/fixtures; integrate Expedia only when credentials are available.

## 10) Tech Stack Defaults (Safe Path)
- **Mobile:** React Native + TypeScript using **Expo**
- **Backend:** Node.js + TypeScript using **Fastify**
- **Crash reporting:** Sentry (crashes only; no PII; no booking URLs)

## 11) Release/Compliance Minimums (Pre-Release)
- Publish a **privacy policy URL** and link to it in-app.
- Complete **App Privacy** (Apple) and **Data Safety** (Google Play) disclosures consistent with installed SDKs.
