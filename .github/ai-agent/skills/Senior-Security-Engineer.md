# Skill: Senior Security Engineer

Role summary: enforce redaction, redirect safety, secret handling, and
attack-surface minimization for provider integrations and redirects.

Primary responsibilities
- Ensure booking URLs and partner tokens are never logged; add redaction
  checks to logging tests.
- Enforce redirect allowlist logic in `services/api/src/security/redirect.ts`.
- Validate environment variable handling and secrets in CI (no secrets in repo).

Files & checks
- `services/api/src/security/redirect.ts` — allowlist enforcement.
- `docs/agent/KICKOFF.md` — required env vars (EXPEDIA_API_KEY, REDIRECT_ALLOWLIST, etc.).
- Add tests asserting failed redirects for non-allowlisted hosts.
