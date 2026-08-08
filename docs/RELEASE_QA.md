# Sorathai Release Candidate QA

This checklist is the release gate for Milestone 8. It separates **automated real-browser evidence** from checks that still require human/manual evidence. Do not mark a manual-only row passed unless it was actually performed.

## Current automated browser evidence

As of 2026-08-08 the repository runs Playwright with Chromium in GitHub Actions. The browser suite is no longer hypothetical: CI has executed it successfully on the current `main` line.

Automated coverage currently verifies:

- Home first-use DOB submission and Base Destiny Card restoration.
- All eight birth-based sciences render with a valid DOB.
- All four focus values (`identity`, `love`, `career`, `challenge`) navigate to visible results for every science.
- Invalid focus falls back safely.
- Browser page errors fail the tested flows.
- Birth-profile URL continuity back to the Base Card.
- Science-to-science navigation for representative routes.
- Combined Profile progress/synthesis flow for explored sciences.
- Dream result rendering and removal of unsupported future-event/lucky-number claims.
- Static validation, unit/content tests, generated reading review, Playwright, and whitespace checks all run in CI.

This evidence satisfies the former blanket statement “browser validation pending” for the covered runtime flows. It does **not** prove pixel-perfect responsive layout, downloaded-image clipping, assistive-technology behavior, blocked-network dependency fallbacks, or every manual matrix combination below.

## Test setup and manual evidence

1. Serve the repository root: `python -m http.server 8000`.
2. Open `http://localhost:8000/` (not a `file://` URL). Use a fresh private/incognito context for first-visit checks.
3. In DevTools keep **Console** and **Network** open, enable Preserve log, disable cache while DevTools is open, and clear the log before each route group.
4. Use DOB **29 February 1992** unless a step specifies another date. A valid legacy link is `http://localhost:8000/?dob=29021992`.
5. Record manual-only runs in the table below.

| Date | OS | Browser + exact version | Viewport / zoom | Route and state | Pass/fail | Console/network findings | Evidence link |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

A failure report must include the exact URL, prior state, action, expected result, actual result, and the first console stack trace or failing network request.

## Core flow

### Covered by automated Chromium regression

- [x] Valid DOB produces a visible Base Destiny Card and preserves DOB in the URL.
- [x] Refresh/restoration keeps the Base Card visible in the tested profile flow.
- [x] All eight deep readings render visible reading content for a valid DOB.
- [x] All four focus choices render usable results for every science.
- [x] Invalid focus values fall back safely.
- [x] Core tested routes fail on uncaught `pageerror`.
- [x] Birth-based Home/logo return preserves the active DOB and restores the Base Card.
- [x] Representative science-to-science navigation preserves DOB/focus continuity.
- [x] Combined Profile flow retains explored progress in the tested browser path.
- [x] Dream result renders locally with reflective wording and no unsupported lucky-number block.

### Manual / not yet fully automated

- [ ] Invalid DOB entry UX and announced error, including an impossible calendar date forced through DevTools.
- [ ] Change/reset/clear DOB behavior inspected together with actual localStorage contents.
- [ ] Exploration close through backdrop, exact focus return, and browser Back while the sheet is open.
- [ ] No-JavaScript fallback navigation.
- [ ] Legacy DOB URL matrix using 29/02/1992 plus invalid `?dob=31021992` in a clean browser context.

## Combined Profile

Automated coverage proves a representative 2-science Combined Profile flow, progress display, scoped synthesis, return to Base, and browser Back/Forward restoration.

Still manual or future automated coverage:

- [ ] 0 explored sciences state.
- [ ] 1 explored science state.
- [ ] 3 explored sciences state.
- [ ] All 8 explored sciences state.
- [ ] Every missing-science link from a partially explored profile.
- [ ] Reset behavior after clearing DOB and recreating the same DOB.

## Dream

Automated coverage verifies the result route, recognized symbol, reflective interpretation, absence of the old lucky-number section, and absence of selected future-event claims.

Still manual or future automated coverage:

- [ ] Dream input page validation and submit flow from `/dream.html`.
- [ ] Refresh/back with empty versus populated dream history.
- [ ] DevTools network inspection proving no unexpected fetch/XHR/WebSocket/model endpoint request.

## Trust

- [ ] Open `/about.html`, `/privacy.html`, and `/contact.html`; verify headings, disclaimer, actual data/dependency behavior, and honest contact availability.
- [ ] From Home, Combined Profile, Dream input/result, and all eight deep readings, activate About, Privacy, and Contact footer links and verify Back navigation.

## Responsive and reflow

Run the complete first-visit → Base → exploration → one deep reading → Combined → Dream path at **320×568, 375×667, 390×844, 430×932, 768×1024, and approximately 1280×800**. At each size confirm no horizontal page scroll, clipped text/control, inaccessible fixed navigation, overlapping footer, or off-screen dialog action.

At desktop **200% zoom**, repeat Home, exploration, drawer, deep card, Combined card, and Dream card. Content must reflow without two-dimensional scrolling except for a genuinely necessary contained region.

These checks remain manual until explicit viewport/reflow assertions are added to Playwright. A passing functional browser test is not evidence of visual correctness.

## Accessibility

- [ ] Keyboard-only completion of DOB, science selection, exploration, deep navigation, drawer, Combined, Dream, and trust navigation.
- [ ] Visible focus indicator on every interactive control.
- [ ] Drawer Tab/Shift+Tab trap, Escape close, and exact trigger focus return.
- [ ] Exploration Tab/Shift+Tab trap, Escape/backdrop/browser-Back behavior, and exact trigger focus return.
- [ ] `prefers-reduced-motion: reduce` removes/reduces motion without hiding state changes.
- [ ] Reflow at 320 CSS px and 200% zoom keeps logical reading order and reachable controls.
- [ ] Accessibility-tree or screen-reader inspection for landmarks, headings, labeled dialogs/controls, concise live regions, decorative icons, and hidden-state exclusion.

Do not claim screen-reader certification unless tested with assistive technology.

## Export

Test with normal network and inspect downloaded PNGs at 100%: no clipped edge, hidden text, transparent/incorrect background, duplicated fixed UI, or missing card content.

- [ ] Base card export and stable DOB filename.
- [ ] Deep Reading export on mobile and desktop, then all eight sciences.
- [ ] Combined Profile export at 2 and 8 layers; filename `sorathai-combined-YYYY-MM-DD.png`.
- [ ] Dream card export; filename `sorathai-dream.png`.
- [ ] Block `cdnjs.cloudflare.com`, reload export-capable pages, and verify core reading/navigation still works while export announces an unavailable-library status without throwing.

## Dependency failure

- [ ] Block Google Fonts and verify system/Georgia fallbacks remain legible with no endless loading state.
- [ ] Block html2canvas and verify graceful export failure plus no core reading dependency.
- [ ] Force localStorage methods to throw and verify URL-based current-session reading/navigation remains usable without uncaught errors.

## Console and network release gate

Across a cache-disabled hard reload of every public route, fail the candidate for any unexplained:

- uncaught error or unhandled/rejected promise;
- 404/failed first-party request;
- duplicate JS/data/font loads caused by the page;
- malformed URL, doubled query/hash, or DOB/focus loss;
- unexpected fetch/XHR/WebSocket/beacon or external AI/API call.

Automated Playwright already fails tested flows on `pageerror`; full route-by-route DevTools/network evidence remains a separate release check.

## Automated gate

Run from the repository root:

```bash
python scripts/validate_site.py
node --test tests/*.test.js
node scripts/review_readings.js
npm run test:e2e
git diff --check
```

All must pass. GitHub Actions currently executes this gate with Chromium available.

## Release decision

The project may describe the covered functional runtime as **browser-tested in Chromium CI**. Do not broaden that into claims of complete visual, assistive-technology, export-pixel, or dependency-failure certification until the remaining manual/automated checks above have evidence.

Release Candidate status should be declared only after the remaining release-blocking gaps are either automated with durable assertions or manually evidenced and no blocker remains.
