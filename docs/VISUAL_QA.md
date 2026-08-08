# Sorathai Visual QA — Milestone 9

Milestone 9 polishes presentation only. Astrology calculations, DOB/profile contracts, routes, focus values, persistence, Combined evidence logic, Dream logic, and export behavior remain locked unless a proven regression requires a fix.

## Automated browser matrix

The Playwright regression suite covers Home and a representative deep reading at:

- 320×568
- 375×667
- 390×844
- 430×932
- 768×1024
- 1280×800

Automated checks protect against page-level horizontal overflow and retain the existing runtime, persistence, exploration, Combined Profile, Dream, trust-route, reduced-motion, dependency-failure, and export-fallback flows.

Phase 1 of Milestone 9 passed the complete automated matrix before Home/Base-specific polish began.

## Visual review order

Review narrow mobile first, then expand outward:

1. Home / birth entry
2. Base Destiny Card
3. RPG consultation sheet
4. Thai deep reading as the primary shell reference
5. Remaining seven science pages
6. Combined Profile with 0, 1, 2, 3, and 8 explored sciences
7. Dream input and result
8. About / Privacy / Contact

## Visual criteria

For each route and viewport verify:

- no clipped or overlapping content
- no page-level horizontal scrolling
- Thai body copy has comfortable line length and line height
- headings, labels, body copy, notes, and disclaimers have a clear hierarchy
- long Thai labels wrap naturally rather than shrinking into unreadable text
- cards read as groups, not as a continuous wall of boxes
- science accents remain restrained and do not become neon/game-HUD decoration
- primary actions are visually distinct from secondary/destructive actions
- controls remain at least practical touch-target size on mobile
- sticky/fixed navigation does not cover content
- focus indicators remain visible
- reduced-motion mode preserves all important states
- 200% zoom/reflow remains usable without requiring two-dimensional scrolling for normal reading

## Home / Base Card

- hero should explain the next action within one glance
- date form should feel like one coherent input group
- Base Card should visually prioritize identity → short interpretation → core facts → symbolic powers
- consultation text should be easier to scan than the symbolic power details
- export / Combined / change DOB / reset actions should not compete equally
- science cards should read as the next journey, not a dense menu

## Deep readings

- result identity remains visually distinct from long interpretation content
- inherited Base layer is quieter than the selected science layer
- long reading paragraphs use the normal Thai sans-serif reading face
- focus-specific section is identifiable without overwhelming the rest of the reading
- related sciences are clearly secondary navigation
- bottom navigation does not dominate reading content

## Combined Profile

- shared themes are the dominant content
- supporting sciences remain readable but secondary
- differing perspectives are clearly separated from repeated themes
- progress / explored layers remain understandable at all counts
- long synthesis text remains comfortable at narrow widths

## Dream

- Dream remains visually related to Sorathai without pretending to be part of the DOB profile
- symbol and reflective interpretation are prioritized above secondary metadata
- no removed pseudo-lucky/random information is reintroduced merely for visual density

## Trust pages

- typography and spacing should feel like the same product while staying quieter than reading pages
- long policy copy should preserve a readable measure
- navigation back into Sorathai remains obvious

## Manual-only limitations

Automated browser checks are regression evidence, not visual certification. Before a public launch, a human should still inspect representative pages on real mobile and desktop browsers, including 200% zoom, downloaded PNG output, and keyboard navigation. Screen-reader certification must not be claimed unless tested with assistive technology.