# Sorathai Visual Direction — Milestone 12

## Product feeling

Sorathai should feel like a quiet contemporary Thai reading room: warm paper, ink, restrained brass, generous breathing room, and clear editorial hierarchy. The mystical quality comes from pacing, symbolism, typography and composition—not from visual noise.

## Principles

1. **Reading first.** Long Thai interpretation text must be more comfortable than decorative UI. Use Sarabun for body copy; reserve Playfair Display for short display moments, names and brand marks.
2. **Warm depth, not glass.** Use layered warm paper surfaces, fine borders and low-opacity shadows. Avoid glassmorphism, neon and saturated gradients.
3. **One primary accent.** Brass/gold is the Sorathai system accent. Science colors are secondary identifiers and should not dominate a page.
4. **Calm geometry.** Prefer 12–20px radii, fine rules, restrained pills and deliberate whitespace. Avoid excessive fully-rounded containers.
5. **Meaningful hierarchy.** A user should immediately distinguish system/section label, reading title, interpretation, evidence/facts, caution and next action.
6. **Mobile is composition, not shrinkage.** At narrow widths cards stack intentionally, controls stay >=44px, Thai labels wrap without clipping, and no horizontal scroll is introduced.
7. **Motion confirms state.** Short opacity/translate transitions only; never delay a reading. Respect `prefers-reduced-motion`.
8. **Trust remains visible.** Entertainment/self-reflection framing must stay readable and cannot be visually hidden to make the product feel more mystical.

## Foundation tokens

Target palette:
- canvas: warm ivory (`#f6f2e9` family)
- paper: near-white warm surface
- ink: charcoal/brown-black rather than pure black
- secondary ink: warm gray-brown
- brass: muted ochre (`#9a6d25` family)
- lines: warm translucent brown

Depth:
- level 0: canvas
- level 1: paper section / input panel
- level 2: primary destiny/reading card
- avoid more than two simultaneous shadow strengths

Typography:
- Display/brand: Playfair Display, short phrases only
- Thai reading/body/UI: Sarabun
- Body reading target: ~15–17px, line-height ~1.75–1.9
- Eyebrows: small, high tracking, never the only label conveying meaning

## Page priorities

### Home / Base
- Hero should feel intentional on desktop without creating a large empty void on mobile.
- Birth panel is the single obvious action.
- Base Destiny Card becomes the strongest visual object after DOB entry.
- Consultation rows should read like an actual consultation, not a dashboard.
- Science choices should feel like chapters/lenses rather than app tiles.

### Exploration dialog
- Keep it short and calm.
- Strong title/question, quieter context, clear four choices.
- Preserve focus trap, Escape and skip behavior.

### Deep readings
- Inherited Base layer stays subordinate.
- Science result is the primary layer.
- Long interpretation sections use sans-serif body typography for Thai readability.
- Facts/evidence should support the reading, not look like pseudo-scientific metrics.

### Combined Profile
- Repeated themes are primary.
- Supporting sciences are evidence labels, not scores.
- Distinct perspectives and unexplored layers are visually secondary.
- 0/1-science states remain useful and intentional, not error screens.

### Dream
- Related to Sorathai but softer and more introspective.
- Text input should feel like a writing surface.
- Result should emphasize symbol → traditional association → reflection → question.

### Trust pages
- Editorial, quiet, highly legible.
- No decorative mysticism that weakens legal/privacy comprehension.

## Validation guardrails

Visual work must not alter:
- astrology calculations or deterministic profile powers
- DOB/profile persistence and URL continuity
- focus/explored-science contracts
- Combined availability/synthesis logic
- Dream interpretation logic
- Search Console verification meta tag
- canonical/noindex/sitemap/robots architecture
- privacy/analytics statements

Every checkpoint must keep static validation, unit tests, browser E2E and whitespace checks green before merge.