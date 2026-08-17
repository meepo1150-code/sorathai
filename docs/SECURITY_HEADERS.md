# Sorathai static response security headers

Sorathai is deployed as a static Cloudflare Pages site. Response-security hardening therefore lives in the repository `_headers` file and is verified independently after deployment.

## Sorathai-owned headers

The global `/*` rule sets:

- `X-Frame-Options: DENY` — Sorathai pages are not intended to be embedded in frames.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — the current product does not require these browser capabilities.

These restrictions are intentionally narrow. Do not broaden the policy or enable capabilities as part of unrelated work.

## Cloudflare runtime defaults we verify

Cloudflare Pages currently supplies these headers on static asset responses:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

Sorathai does not duplicate them in `_headers`; the production smoke verifies the deployed values instead. If the platform default changes, investigate the runtime change and decide explicitly whether Sorathai should take ownership of the header.

## Why CSP is deferred

A Content Security Policy is not added in M18. Current pages contain inline styles/scripts, Google Fonts, and optional deferred html2canvas from cdnjs. A useful CSP therefore needs a separate compatibility design and browser regression pass. Adding an improvised permissive policy would create complexity without strong protection; adding a strict policy without migration work could break production.

## Validation layers

- `scripts/validate_headers.py` checks the source `_headers` contract and prevents accidental duplication of the Cloudflare-default headers.
- `scripts/production_smoke.sh` checks the deployed Home response for anti-framing, permissions restrictions, `nosniff`, and the current referrer policy.
- normal Playwright regression remains responsible for user-visible behavior.

## Existing specialized rules

The sitemap and robots rules remain separate and preserve their explicit MIME/cache headers. Cloudflare Pages combines matching header rules, so they also inherit the global Sorathai-owned security headers.
