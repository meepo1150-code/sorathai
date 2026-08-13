# Sorathai production QA — M11

This document separates checks that repository/browser automation can prove from launch checks that require an owner, account, physical device, or assistive-technology session.

## Production baseline

- Public hostname for initial validation: `https://sorathai.pages.dev/`
- Current automated-evidence main SHA: `d67ff56a3e13f8ed69e4396b3ee65c8e5acd5df3`
- Cloudflare Pages production deployment of the earlier sitemap-response hardening SHA was confirmed successful by the owner on 2026-08-13.
- Post-merge static validation run #161 passed on the current main SHA.
- Production crawler smoke run #1 passed from a GitHub-hosted runner against the canonical production hostname. It proved that `/sitemap.xml` is externally fetchable as XML, `/robots.txt` is externally fetchable as text/plain and declares the canonical sitemap, all sitemap URLs remain on `https://sorathai.pages.dev/`, and all declared sitemap routes return HTTP 200.
- Search Console accepted a fresh submission of `/sitemap.xml` on 2026-08-13. The existing sitemap row still showed the previous `Couldn't fetch` result immediately afterward, so Google-specific ingestion remains pending reprocessing rather than being treated as passed.

## Automated / repository QA

The existing CI remains the release gate for:

- static HTML, local-link, metadata and sitemap contracts
- presentation CSS manifest integrity
- shared profile and reading model tests
- generated reading content review
- Chromium Playwright browser regression
- no-emoji presentation regression
- keyboard accessibility smoke coverage for the Home DOB flow, visible focus, keyboard activation of a science card, and native Combined Profile actions
- whitespace checks

The separate post-merge production crawler smoke is an operational guard, not a PR release gate. It retries after Cloudflare propagation and verifies the externally served crawler surface without conflating a temporary hosting delay with calculation/UI correctness.

The M11 keyboard smoke test is intentionally a baseline guard, not a human accessibility certification. CI proves the critical native keyboard path remains operable; it does not prove every interactive element has an ideal focus order or assistive-technology experience.

A green CI and production smoke are necessary but do **not** certify the manual items below.

## Human production walkthrough

Run these against the canonical production hostname, not a branch preview.

### Desktop

- [ ] Home loads without obvious missing assets or broken layout.
- [ ] Create/edit DOB profile and confirm expected Base Destiny rendering.
- [ ] Open all eight science entry points and return without a navigation dead end.
- [ ] Inspect at least one deep reading from every science family represented by the UI.
- [ ] Combined Profile opens and remains readable.
- [ ] Download Base, Deep and Combined PNGs; open the downloaded files and inspect clipping, missing glyphs, emoji fallback and decorative-layer artifacts.
- [ ] Repeat the critical flow at 200% browser zoom.

### Real phone

- [ ] Home → profile → Base Destiny → deep reading works with touch only.
- [ ] No horizontal page overflow at the normal device scale.
- [ ] Sticky/fixed controls do not cover primary content or actions.
- [ ] Long Thai headings and reading copy wrap without clipping.
- [ ] At least one downloaded PNG opens correctly on the device.

### Keyboard-only desktop

Automated baseline already proves the Home DOB controls can be reached with Tab, visible focus styling is present, Enter can submit the DOB flow, a science card can be activated from the keyboard, and Combined Profile actions remain native keyboard controls.

Human certification still requires:

- [ ] Walk the full primary navigation/action sequence with Tab/Shift+Tab and judge the focus order, not just reachability.
- [ ] Confirm focus indication remains visually clear across all final M12 surfaces and transient states.
- [ ] Confirm Enter/Space behavior is sensible for all interactive control types.
- [ ] Confirm no focus trap occurs in drawers/dialog-like UI.
- [ ] Confirm focus returns to a sensible location after closing transient UI.

### Assistive technology

- [ ] Perform a human screen-reader pass before making any screen-reader certification claim.
- [ ] Confirm page title/major headings/landmarks are announced coherently.
- [ ] Confirm decorative identity art is not announced as meaningless emoji/noise.
- [ ] Confirm form labels and validation/error states are understandable without sight.

## Search / crawl handoff

- [x] Canonical public hostname remains `https://sorathai.pages.dev/` for the initial validation period.
- [x] Cloudflare Pages production deployment of sitemap response hardening confirmed successful.
- [x] Search Console accepted a fresh `/sitemap.xml` submission.
- [x] Independent production crawler smoke confirms the current sitemap/robots/public-route surface is externally reachable and coherent.
- [ ] Search Console sitemap processor reports `Success` and discovers pages after reprocessing.
- [ ] Record page-indexing feedback for Home and representative public science routes after Google has had time to crawl.

## Interpretation boundary

The passing production crawler smoke materially narrows the old Search Console `Couldn't fetch` symptom: the current production response is reachable and coherent from an independent external runner. It does **not** prove Google's separate sitemap processor has ingested the file. Search Console remains the source of truth for Google-specific `Success`, discovered-page counts and indexing feedback. Do not modify or repeatedly resubmit the sitemap solely because the old row has not refreshed yet.

## Stop conditions

Do not merge a QA-driven code change merely to make a checklist look complete. Open a fix only when the production walkthrough reveals a reproducible defect. Do not change astrology calculations, DOB/profile behavior, canonical/indexability/Search Console verification, privacy, analytics transport or monetization as part of this QA pass.
