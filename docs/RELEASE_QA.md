# Sorathai Release Candidate QA

This checklist is the release gate for Milestone 8. It is written for a tester who has not seen the code. **Do not mark a row passed without performing it in a real browser.** Automated validation protects structural contracts but does not replace this checklist.

## Test setup and evidence

1. Serve the repository root: `python -m http.server 8000`.
2. Open `http://localhost:8000/` (not a `file://` URL). Use a fresh private/incognito context for the first run.
3. In DevTools keep **Console** and **Network** open, enable Preserve log, disable cache while DevTools is open, and clear the log before each route group.
4. Use DOB **29 February 1992** unless a step specifies another date. A valid legacy link is `http://localhost:8000/?dob=29021992`.
5. Record every run in the table below. Attach screenshots only as supporting evidence; interaction, console, and network results are authoritative.

| Date | OS | Browser + exact version | Viewport / zoom | Route and state | Pass/fail | Console/network findings | Evidence link |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

A failure report must include the exact URL, prior state, action, expected result, actual result, and the first console stack trace or failing network request. Clear only Sorathai data with DevTools Application → Local Storage when instructed.

## Core flow

- [ ] **First visit / no profile:** clear site data and load `/`. The DOB form is visible, no reading is invented, and keyboard focus/order is usable.
- [ ] **Valid DOB / Base Destiny Card:** submit 29/02/1992. One Base card appears with DOB, archetype, life path, four bounded power values, science choices, and export/change/clear controls; URL contains `dob=29021992`.
- [ ] **Invalid DOB:** clear the profile, enter 31/02/1992 (use DevTools only if the native date control prevents selection), submit, and confirm an announced error while no card is rendered or saved. Repeat with an empty value.
- [ ] **Refresh and restore:** create the valid profile, copy its visible values, refresh, then open `/` without a query. The same DOB/card values return from local storage.
- [ ] **Change / reset / clear DOB:** “เปลี่ยนวันเกิด” returns to the populated form without deleting the current profile. Submit 01/01/1990 and verify the card changes. “ล้างวันเกิด” removes the card and stored `sorathai.profile.v1`; refresh remains at first visit.
- [ ] **Exploration open/close:** from a Base science link open the exploration dialog. Background content cannot be operated. Close with × and by clicking the backdrop; each returns focus to the initiating science link.
- [ ] **Skip:** reopen and choose “ข้ามและเปิดคำอ่าน”. The correct deep-reading route opens with the DOB and without an invalid `focus`; the science is recorded as explored.
- [ ] **Four focuses:** repeat separately for identity, love, career, and challenge. The destination preserves DOB, shows the matching Thai focus context, prioritizes an appropriate section when available, and saves the latest focus.
- [ ] **Escape / focus return:** open exploration, press Escape, and verify it closes and focus returns to its trigger.
- [ ] **Browser Back while open:** open exploration (URL need not visibly change), press browser Back once, and verify only the dialog closes, the Base page remains, and no accidental deep-reading navigation occurs.
- [ ] **All eight deep readings:** visit `/thai-astrology.html`, `/western-astrology.html`, `/chinese-astrology.html`, `/numerology.html`, `/mayan.html`, `/biorhythm.html`, `/nakshatra.html`, and `/celtic.html` via Base links. Each renders a result, inherited Base layer, its correct science identity, related navigation, Combined Profile entry, disclaimer, and no exception.
- [ ] **DOB/focus continuity:** on every deep route verify links back to Base, related birth-based sciences, and Combined Profile retain the same DOB; applicable reading links retain a valid selected focus.
- [ ] **Legacy URL:** in a clean context open `/?dob=29021992`, then one deep route with `?dob=29021992&focus=love`. Both render 29/02/1992, persist the profile, and do not rewrite it as a malformed URL. `?dob=31021992` must show no reading.

## Combined Profile

For each case set up the state by clearing site data, creating the DOB, and visiting the specified number of distinct deep-reading routes; then open `/profile.html` through the visible Combined entry.

- [ ] **0 explored:** explains that no sciences are open, asks for at least two, shows navigation to missing sciences, and does not show a fabricated synthesis.
- [ ] **1 explored:** says 1/8 and requests one more; no synthesis card is shown.
- [ ] **2 explored:** shows 2/8, exactly two evidence layers, synthesis scoped to those layers, and six missing links.
- [ ] **3 explored:** shows 3/8 and changes evidence/synthesis to exactly those three layers.
- [ ] **All 8:** shows 8/8, all evidence layers, no missing-science section, and no duplicate layer.
- [ ] **Missing navigation:** from the 2-science state select each displayed missing link (one at a time using Back). It targets the named science and keeps DOB/focus continuity.
- [ ] **Reset behavior:** clear DOB from Base, then revisit `/profile.html` without a DOB query. It shows the invalid/start state and no former synthesis. Creating the same DOB again starts with zero explored sciences.

## Dream

- [ ] Open `/dream.html`, enter a recognizable dream phrase, and submit. The input validation is understandable and the result route renders a dream card and interpretation.
- [ ] Refresh/back through the dream result and verify graceful behavior when dream history is empty or available.
- [ ] In Network, filter `fetch`, `xhr`, `ws`, `openai`, `anthropic`, and `api`. Submit again: interpretation is local-only; there is no external AI/model/API request. Only documented font and optional html2canvas origins may be third party.

## Trust

- [ ] Open `/about.html`, `/privacy.html`, and `/contact.html`; headings, scope/disclaimer, actual data/dependency behavior, and honest contact availability are readable.
- [ ] From the footers on Home, Combined Profile, Dream input/result, and all eight deep readings, activate About, Privacy, and Contact. Every link resolves locally and browser Back returns correctly.

## Responsive and reflow

Run the complete first-visit → Base → exploration → one deep reading → Combined → Dream path at **320×568, 375×667, 390×844, 430×932, 768×1024, and approximately 1280×800**. At each size confirm no horizontal page scroll, clipped text/control, inaccessible fixed navigation, overlapping footer, or off-screen dialog action. At desktop **200% zoom**, repeat Home, exploration, drawer, deep card, Combined card, and Dream card; content must reflow without two-dimensional scrolling (except a genuinely necessary contained region) and controls remain reachable.

## Accessibility

- [ ] **Keyboard only:** complete DOB, science selection, exploration, deep navigation, drawer, Combined, Dream, and trust navigation using Tab/Shift+Tab/Enter/Space; no pointer is required.
- [ ] **Focus visibility:** every interactive element has an obvious focus indicator against its background at all sizes/zoom.
- [ ] **Drawer trap/return:** open “เพิ่มเติม”, Tab and Shift+Tab wrap inside it, Escape closes it, and focus returns to the exact trigger.
- [ ] **Exploration trap/return:** Tab and Shift+Tab wrap among close/focus/skip controls; close, backdrop, Escape, and browser Back return focus appropriately.
- [ ] **Reduced motion:** enable OS/DevTools `prefers-reduced-motion: reduce`, reload, and verify motion is removed/reduced without hiding state changes.
- [ ] **Reflow:** at 320 CSS px and at 200% zoom, reading order remains logical and no control/text is lost.
- [ ] With a screen reader or accessibility tree, verify one main landmark, meaningful headings, labeled dialogs/controls, live validation/export status, decorative icons ignored, and hidden dialogs/states absent from navigation.

## Export

Test once with normal network, and inspect the downloaded PNG at 100%: no clipped edge, hidden text, transparent/incorrect background, duplicated fixed UI, or missing card content.

- [ ] **Base card:** button works; status announces progress/result; filename includes Sorathai and the DOB.
- [ ] **Deep Reading card:** test at least one mobile and one desktop route, then all eight buttons; science and DOB filenames are correct and inherited layer is included.
- [ ] **Combined Profile:** test 2 and 8 layers; filename is `sorathai-combined-YYYY-MM-DD.png`; long content is not clipped.
- [ ] **Dream card:** filename is `sorathai-dream.png`; interpretation and watermark fit.
- [ ] **Missing html2canvas:** block `cdnjs.cloudflare.com` in DevTools and reload each export-capable page. Core DOB/readings/navigation still work; clicking export does not throw and announces that image creation is unavailable.

## Dependency failure

- [ ] **Google Fonts unavailable:** block `fonts.googleapis.com` and `fonts.gstatic.com`, hard reload, and repeat Home/deep/Combined/Dream. System/Georgia fallbacks are legible, layout remains usable, and there is no endless loading state.
- [ ] **html2canvas unavailable:** perform the export fallback steps above and verify the CDN script is deferred and absent from non-export pages.
- [ ] **localStorage unavailable:** in DevTools disable storage (or override `Storage.prototype.getItem/setItem/removeItem` to throw), reload, submit DOB, open a deep reading through the UI, and use exports. The current-session core reading remains usable, URL continuity works, no uncaught error occurs, and refresh may truthfully lose persistence.

## Console and network release gate

Across a cache-disabled hard reload of every public route, fail the candidate for any unexplained item below:

- [ ] uncaught error or unhandled/rejected promise;
- [ ] 404/failed first-party request;
- [ ] duplicate JS/data/font loads caused by the page;
- [ ] malformed URL, doubled query/hash, or DOB/focus loss;
- [ ] unexpected fetch/XHR/WebSocket/beacon or external AI/API call.

Document expected dependency failures separately when intentionally blocking fonts/html2canvas. Third-party requests in the current design are limited to Google Fonts and html2canvas on export-capable routes.

## Automated gate and release decision

Run from the repository root:

```bash
python scripts/validate_site.py
node --test tests/*.test.js
git diff --check
```

All must pass. A Release Candidate may be declared only after the complete real-browser matrix above has evidence, all release blockers are fixed/retested, and CI passes. If no reliable browser exists, label the result **static/integration QA complete; browser validation pending**—never browser-validated.

## Evidence for Issue #14 environment

On 2026-08-07 the development container was checked with `command -v` for Chromium, Chromium Browser, Google Chrome, Playwright, and common Python/Node browser packages; none was available. No browser run or screenshot evidence is claimed. The exact manual matrix above is therefore required before release. Known non-blocking limitation: visual, assistive-technology, export rendering, and live console/network behavior remain pending until this matrix is run in a supported real browser.
