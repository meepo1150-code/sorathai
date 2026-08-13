# Sorathai Presentation Architecture

This document defines the maintenance contract for the visual system after Milestone 12. It exists to keep later polish work deliberate and regression-safe rather than relying on CSS archaeology.

## Entry point

All public pages load `shared.css`. `shared.css` is intentionally an import manifest rather than the full design system.

Current cascade order:

1. `shared-base.css` — inherited shared layout, controls, trust routes, reading shell, Combined Profile, and pre-M12 foundations.
2. `m12-emblems.css` — shared science emblem language and related-science presentation.
3. `m12-science-identity.css` — science-specific editorial identity marks.
4. `m12-card-art.css` — Home science-card artwork and typography balance.
5. `m12-final-polish.css` — cross-page rhythm and interaction polish.
6. `m12-surfaces-zodiac.css` — warm paper material system and zodiac medallions.
7. `m12-reading-panels.css` — framed Deep Reading panels.
8. `m12-dynamic-reading.css` — result-driven presentation variables and hero surfaces.
9. `m12-western-signs.css` — Western zodiac-specific visual identities.
10. `m12-base-identity.css` — Base Destiny element/zodiac/personal variants.
11. `m12-visual-identity-v2.css` — second-stage editorial/celestial composition.
12. `m12-visual-identity-v3.css` — final large-system art direction and semantic result variants.
13. `m12-result-specific.css` — deterministic non-Western result variants.
14. `m12-crafted-depth.css` — engraved/embossed material depth.
15. `m12-crafted-depth-v2.css` — sharpened depth, keylines and mobile restraint.
16. `m12-micro-polish.css` — spacing/contrast/focus refinements.
17. `m12-type-icon-balance.css` — final typography scaling and icon balance.
18. `m12-signature-craft.css` — Sorathai signature geometry and hierarchy.
19. `m12-no-emoji.css` — final visible legacy-pictograph suppression and text/seal replacements.

The order is part of the visual contract. Later files intentionally override selected earlier rules. Reordering imports is a visual change and must be treated like one.

## Maintenance rules

- Do not merge two visual layers merely to reduce file count. Consolidate only when selectors are proven equivalent and browser regression remains green.
- New cross-system fixes should normally go into an existing late-stage layer rather than creating another override file.
- New science-specific artwork belongs with the science/result-specific layer that owns its semantic identity.
- `m12-no-emoji.css` stays last unless a replacement architecture proves that legacy pictographs cannot become visible again.
- Avoid `!important` growth. Existing M12 layers use it to control a historical cascade; new work should prefer stronger ownership/selectors when practical.
- Presentation data attributes such as `data-reading-science`, `data-reading-key`, `data-reading-variant`, `data-base-element`, and related Base identity attributes are visual hooks. They must not alter calculations or stored profile shape.
- Never move a presentation hook into calculation code if the move changes calculation/profile behavior. Conversely, do not refactor a stable core module solely for aesthetic code organization when the regression risk exceeds the maintenance benefit.

## Documented runtime exception: Base Destiny identity hook

`installBaseIdentityPresentation()` currently lives in `sorathai-profile.js` even though it only writes visual `data-*` attributes onto the Base Destiny Card. This is intentional technical debt, not a calculation contract.

Milestone 13 reviewed moving it into `sorathai-site.js` or a new presentation runtime. The move would change script/DOMContentLoaded/MutationObserver timing on Home while providing no user-visible benefit, and the current M12 Playwright test already proves the hook does not add fields to the stored profile. For now the safer maintenance choice is to leave the hook in place and treat it as a documented exception.

Future extraction is acceptable only when it can preserve all of these at once:

- the same `data-base-element`, `data-base-sign`, `data-base-archetype`, and deterministic `data-base-variant` values
- no change to the `sorathai.profile.v1` stored shape
- no change to DOB restoration or Base Card render timing
- browser regression green on first render, restored profile, refresh, and mobile flows

Do not reuse this exception as precedent for adding new presentation behavior to the profile model.

## Locked product boundaries

Visual maintenance must not silently change:

- astrology calculations or deterministic profile powers
- DOB parsing, storage schema, migration, or profile URL continuity
- focus/explored-science behavior
- canonical/indexability/Search Console verification
- privacy statements or measurement payload policy
- monetization or external network dependencies

Any change to those contracts requires its own explicit product/engineering scope rather than being hidden inside visual cleanup.

## No-emoji contract

Sorathai's visible reading/navigation language uses line glyphs, text symbols, Chinese earthly-branch seals, and CSS geometry rather than pictographic emoji stickers.

Legacy source text may still contain emoji where changing old page data would create unnecessary behavior risk. The presentation layer suppresses those source pictographs and replaces them with controlled glyphs. Browser regression should protect the visible result, not require rewriting every inert legacy source string.

## Validation expectations

Presentation maintenance should keep these gates green:

- `python scripts/validate_site.py`
- `node --test tests/*.test.js`
- `node scripts/review_readings.js`
- `npm run test:e2e`
- `git diff --check`

The browser suite is the strongest automated evidence for visible behavior. It does not replace human visual review, downloaded PNG pixel inspection, keyboard walkthrough, real-device checks, or screen-reader certification.

## Post-M12 strategy

Milestone 13 should prefer deletion of proven dead code, documentation of intentional complexity, and executable contract checks over another broad visual redesign. Product feature work after launch should be justified by real usage evidence, not by the existence of unused implementation capacity.
