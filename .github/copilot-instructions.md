<!--
This file is consumed by GitHub Copilot / AI agents when they first open
the repo.  Keep it short (20‑50 lines) and focused on _this_ project.
-->

# FlightValue AI agent instructions

The repository is a **monorepo** containing three logical parts:

1. **documentation** under `docs/` – spec, testplan, decisions, kickoff,
   and developer commands.  Read these first to understand product intent.
2. **packages/mobile** – a React Native/Expo TypeScript app; UI is minimal,
   uses Shopify Restyle (`theme`/`primitives.ts`) and `expo-router`.
3. **packages/shared** – cross‑platform utility code such as scoring and
   sorting logic.  Backend and mobile both import from here.
4. **services/api** – backend code (Fastify based per the docs) exposing a
   proxy to flight providers.  Only interfaces are checked in; implementation
   is expected to follow the patterns described in the markdown docs.

## Big picture

- The product is a **metasearch-only** mobile app that ranks flights by a
  transparent `ValueScore = TotalPrice + (DurationHours × TimeValuePerHour)`
  formula.  The mobile app never speaks directly to providers; it calls the
  backend.
- The backend maintains a provider interface (`FlightProviderAdapter` in
  `services/api/src/providers/`) and starts with an Expedia adapter.
- Results are cached (TTL ≤ 60s) and rate-limit headers are parsed.  Booking
  URLs are never logged; clients receive short-lived redirect tokens that
  the backend resolves with an allowlist check (`redirect.ts`).

## Developer workflows

- The project uses **pnpm** workspaces.  Standard commands are in
  `docs/agent/DEV_COMMANDS.md`:
  ```txt
  pnpm i
  pnpm --filter api dev     # start backend
  pnpm --filter api test
  pnpm --filter mobile start # Expo dev
  pnpm --filter mobile test
  pnpm --filter shared test
  ```
- `packages/mobile` is an Expo project; use `expo start`/`run:android`/`run:ios`.
- Backend environment variables are listed in `docs/agent/KICKOFF.md` (e.g.
  `EXPEDIA_API_KEY`, `CACHE_TTL_SECONDS`, `REDIRECT_ALLOWLIST`).
- TDD is **non‑negotiable**: always write failing tests first.  The TDD
  playbook and mandatory test cases are in `docs/agent/TDD_PLAYBOOK.md`.
  There are currently no tests checked in – add them as you implement features.

## Conventions & patterns

- Shared types and logic live under `packages/shared`.  Example:
  `computeValueScore()` and `compareItineraries()`.
- Backend adapters should implement the `FlightProviderAdapter` interface and
  return a `ProviderSearchResult`.  Provider files typically reside in
  `services/api/src/providers/<name>` with an `*.NOTES.md` for reasoning.
- Logging helpers must redact booking URLs and partner tokens; see the
  `LOG_REDACT_BOOKING_URL` env var mentioned in docs.
- Mobile UI components are functional TSX components with Restyle styling
  (`Box`, `Text`).  Keep styling declarative and theme‑aware.
- API schema is defined in `api/openai.yaml` (should probably be
  `openapi.yaml` – follow spec tests).  Contract tests must keep backend
  responses in sync with this file.

## Integration points

- **Expedia Flight Listings API** is the initial provider.  Credentials
  never touch the client.
- Redirect endpoint issues 302s to allow‑listed hosts only (`DEFAULT_ALLOWLIST`).
- Future providers should be pluggable; add to the adapter layer and update
  caching/TTL logic accordingly.

## How to contribute

- Read the docs under `docs/` before writing code – they contain the
  product requirements, decision log, and checklist items.
- Every change must include tests.  Tests should live in the same package as
  the code they exercise and follow the patterns outlined in the TDD playbook.
- Keep PRs small and focused on one responsibility.  Refer to the decision
  records to avoid re‑hashing settled choices.

> **Note:** this file is the first stop for an AI coding agent.  If you
> encounter missing or outdated information here, update it rather than
> working around it.
