# Skill: Senior Data Science Engineer

Role summary: validate and evolve the ValueScore model, ensure metrics are
interpretable, and provide test harnesses for score behavior.

Primary responsibilities
- Validate `computeValueScore()` and `compareItineraries()` in
  `packages/shared/scoring.ts` with unit tests and edge-case checks.
- Propose telemetry metrics to validate ranking fairness (non-PII only).
- Help design experiments to tune `TimeValuePerHour` or alternative models.

Notes & constraints
- Currency normalization is out-of-scope for v1 — tests should assert
  currency remains provider-native.
- Keep calculations deterministic and numeric-stable (see `toFixed(2)` usage).
