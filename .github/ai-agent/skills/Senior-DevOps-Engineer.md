# Skill: Senior DevOps Engineer

Role summary: ensure reproducible developer environments, CI, and runtime
configuration for backend and mobile packages.

Primary responsibilities
- Ensure `pnpm` workspace layout is correct and CI runs `pnpm i` then
  per-package tests: `pnpm --filter api test`, `pnpm --filter mobile test`, `pnpm --filter shared test`.
- Surface required environment variables in CI (see `docs/agent/KICKOFF.md`).
- Provide lightweight local dev instructions (Expo for mobile, `pnpm --filter api dev` for backend).

Files & commands
- Dev commands: `docs/agent/DEV_COMMANDS.md`
- Environment vars: `docs/agent/KICKOFF.md`

Notes
- Backend must run with provider credentials only in secure env; never commit secrets.
