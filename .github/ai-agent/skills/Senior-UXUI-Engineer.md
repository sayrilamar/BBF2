# Skill: Senior UX / UI Engineer

Role summary: design and implement mobile UX that surfaces explainability
for ValueScore and offers an adjustable `TimeValuePerHour` control.

Primary responsibilities
- Implement screens and components in `packages/mobile/app/` and
  `packages/mobile/components/`.
- Use Restyle theme primitives (`packages/mobile/theme/theme.ts` and
  `primitives.ts`) for consistent styling.
- Ensure explainability is available per result and via a help screen.

Files to inspect first
- `packages/mobile/app/index.tsx` and `packages/mobile/app/_layout.tsx`
- `packages/mobile/components/SearchHeader.tsx`, `InsightsRow.tsx`
- `packages/mobile/theme/*`

Design constraints
- Default `TimeValuePerHour` is 30, adjustable 0..200 and persisted locally.
- Show per-result breakdown: Price, DurationHours, ValueScore calculation.
