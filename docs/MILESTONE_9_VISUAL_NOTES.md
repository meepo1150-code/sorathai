# Milestone 9 Visual & UX Polish Notes

Issue: #23

## Functionality lock

This milestone must not change astrology calculations, DOB/profile schema, science IDs, focus values, persistence, routes, Combined Profile evidence logic, Dream interpretation logic, export filenames, or Playwright selectors except to fix a proven regression.

## Phase 1 — shared visual rhythm

The first pass changes only the shared presentation layer:

- introduce reusable content padding and reading-measure tokens
- improve header and result hierarchy
- increase Thai reading legibility and line rhythm
- keep long reading content within a comfortable measure
- refine shared card, focus-context, drawer, exploration, related-science, and bottom-navigation spacing
- improve Combined Profile and trust-page reading density
- protect 320–340px widths with explicit narrow-layout rules
- use wider layouts more intentionally at 700px+ without turning reading text into long lines

## Validation approach

Keep all existing static, unit/content, Playwright Chromium, and whitespace gates green. Browser assertions remain the regression contract; this milestone does not claim pixel-perfect visual certification from automated tests.
