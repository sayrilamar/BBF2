# KICKOFF.md — Implementation Kickoff Pack (FlightValue)

## A) Preconditions (must be satisfied to integrate real provider)
1) Expedia Travel Redirect API partner onboarding completed:
   - Travel Redirect API Key
   - Basic Auth username/password
   - Initial per-minute quota value (if provided)
2) Decide supported POS (point of sale) if provider requires it (store as config).
3) Decide domain allowlist for redirects (default: expedia.*).

## B) Initial Build Strategy (minimize rework)
1) Implement backend + mobile against mocks first.
2) Add Expedia adapter behind interface.
3) Enable caching + rate limiting before load testing.
4) Add redirect tokenization before enabling “Book”.

## C) Proposed Repo Layout (monorepo-friendly)
- apps/
  - mobile/                (React Native TS)
- services/
  - api/                   (Node TS backend)
- packages/
  - shared/                (schemas, scoring library)
- docs/
  - SPEC.md, CONTEXT.md, TASKS.md, TESTPLAN.md

## D) Environment Variables (backend)
- EXPEDIA_API_KEY=<secret>
- EXPEDIA_BASIC_AUTH=<secret>          # "Basic <base64(username:password)>"
- EXPEDIA_ACCEPT=application/vnd.exp-flight.v3+json
- REDIRECT_ALLOWLIST=expedia.com,www.expedia.com,apim.expedia.com
- CACHE_TTL_SECONDS=30                 # must be <= 60
- RATE_LIMIT_BUFFER=0.10               # keep 10% headroom vs remaining
- LOG_REDACT_BOOKING_URL=true
- SENTRY_DSN=<optional>                # backend errors only

## E) Minimum API Surface (backend)
1) POST /v1/search
2) GET  /v1/redirect/{token}
3) GET  /healthz

## F) Non-negotiable behaviors
- Never expose Expedia credentials to the client.
- Never log full Expedia booking deeplink URLs (tokens may be present).
- Do not auto-retry Expedia 429; respect reset header.
- Cache TTL <= 60s; refresh bypasses cache unless rate-limited.
