<!-- Core guidance for AI agents on FlightValue -->

# FlightValue — AI Agent Core

Purpose: provide immediate operational context for automated agents and
human reviewers. Read this file first, then the SKILL page that matches the
persona you should mimic.

Repository snapshot (quick):
- `docs/` — product specs, TDD playbook, DEV_COMMANDS, KICKOFF, DECISIONS
- `packages/mobile` — Expo + React Native UI (Restyle theme in `theme/`)
- `packages/shared` — scoring, sorting, utilities (`computeValueScore()`)
- `services/api` — backend adapters, redirect security, and API surface

Critical constraints and goals (discoverable in docs):
- Metasearch-only product; no in‑app booking. Backend proxies provider calls.
- Ranking is deterministic: `ValueScore = TotalPrice + (DurationHours × TimeValuePerHour)`
- TDD-first policy: every change must have failing tests first. See
  `docs/agent/TDD_PLAYBOOK.md`.
- Caching TTL must be <= 60s (default 30s). Handle provider rate limits
  (do not auto-retry on 429). See `docs/agent/KICKOFF.md` and `DECISIONS.md`.

Useful file pointers (inspect these first):
- Scoring: `packages/shared/scoring.ts`
- Provider interface: `services/api/src/providers/FlightProviderAdapter.ts`
- Redirect security: `services/api/src/security/redirect.ts`
- Mobile entry/screens/components: `packages/mobile/app/`,
  `packages/mobile/components/`, `packages/mobile/theme/`
- Developer commands: `docs/agent/DEV_COMMANDS.md`

How to operate (agent workflow):
1. Read `CORE.md` and the matching `skills/*` page.
2. Explore `docs/agent/*` for build/test rules and env var expectations.
3. Open the package(s) you will modify; add tests first (see TDD playbook).
4. Implement minimal change, run package tests via `pnpm --filter <pkg> test`.
5. Update docs/skill pages if you find incorrect or missing info.

If anything here is outdated, update the relevant `skills/` page and the
`CORE.md` file so future agents have up-to-date instructions.
