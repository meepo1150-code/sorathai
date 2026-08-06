# Issue #4 visual and interaction validation

Validation update for PR #5. The execution container did not include Chromium, Chrome, Firefox,
Playwright, Puppeteer, `wkhtmltoimage`, or another browser renderer. Consequently, this pass could
not honestly produce rendered screenshots or exercise a real download. The checks below are the
strongest equivalent evidence available in this environment and identify browser-only follow-up
checks explicitly.

## Static responsive inspection

The formatted source was inspected at each requested target against the mobile-first rules in
`index.html`. This is a source/layout audit, not a claim that those viewports were rendered.

| Target | Inspection performed | Result |
| --- | --- | --- |
| 320×568 | Checked the `max-width: 350px` override: 14px shell gutters, reduced form gaps, compact card padding, stacked facts and single-column powers. | No fixed-width content wider than the 292px content area; controls remain 54–56px high. |
| 375×667 | Checked the default single-column landing, 20px gutters, flexible card width, and wrapping action row. | Card and form resolve within a 335px content area. |
| 390×844 | Checked default phone layout and card/science flow. | No horizontal fixed width; result content remains one column. |
| 430×932 | Checked default phone layout and flexible three-column date fields. | Selects use fractional tracks and remain inside the form. |
| 768×1024 | Checked the `min-width: 760px` breakpoint. | Landing becomes two columns; card remains capped at 680px; science list becomes two columns. |
| ~1280px desktop | Checked the 1120px shell maximum and 940px landing/explore maximum. | Content stays centered and line lengths remain bounded. |
| 200% zoom | Inspected the effective narrow viewport behavior, wrapping card actions, `overflow-wrap`, small-screen stacked facts, and absence of fixed page heights. | Content can reflow without relying on horizontal scrolling. Browser confirmation remains required. |
| Reduced motion | Checked both shared and home-specific `prefers-reduced-motion: reduce` rules plus conditional `scrollIntoView` behavior. | Animations/transitions collapse and result/change scrolling switches to `auto`. |

## State and interaction inspection

- **Restored profile:** traced `fromLocation(location.search)` through `setForm()` and `render()`;
  the stored ISO date repopulates the Buddhist-year form, card, and DOB-preserving science links.
- **Invalid date:** traced a selection such as 31 February through `fromParts()`; the form leaves the
  result unchanged, writes a Thai error into `role="alert"`/`aria-live="polite"`, and focuses the day.
- **Reset:** verified reset clears `sorathai.profile.v1`, removes the query, hides the card, and calls
  one `applyDefaultDate()` helper backed by the frozen `DEFAULT_DATE` value (1 January 1990).
- **Back/forward:** verified `pushState` is used for submit/reset and `popstate` reloads URL or stored
  state without adding another history entry.
- **Image export:** inspected the export branch and confirmed it requests the card's complete
  `scrollWidth` and `scrollHeight`, renders at 2× scale against the card background, and only captures
  the bounded card node. A real PNG download/readability check remains required in a browser.
- **Keyboard/focus:** inspected connected labels, native selects/buttons/links, focus-visible styles,
  and focus restoration after change/reset or invalid submission.

## Commands used for equivalent evidence

```bash
command -v chromium || command -v google-chrome || command -v firefox
command -v wkhtmltoimage || command -v cutycapt || command -v phantomjs
node -e "for (const x of ['playwright', 'puppeteer']) try { console.log(x, require.resolve(x)) } catch (_) {}"
python scripts/validate_site.py
node --test tests/*.test.js
node --check /tmp/index-inline.js
git diff --check
```

Before merge, hosted browser review should render the listed viewports, inspect the generated PNG,
confirm no console errors, and attach screenshots to PR #5. This limitation should not be interpreted
as a completed browser-based visual QA pass.
