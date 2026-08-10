# Sorathai Launch Checklist

## Production identity

Temporary canonical production origin while no custom domain is configured:

`https://sorathai.pages.dev/`

Before launch, confirm:

- canonical URLs, Open Graph URLs, sitemap and robots use one production origin
- no canonical URL contains `dob`, `focus`, query strings or fragments
- the referenced default social-preview image exists
- user-specific result shells are not included in the sitemap unless intentionally indexable

When a custom domain is configured later, switch all canonical/OG/sitemap/robots signals in one release and configure the hosting redirect before Search Console migration. Do not publish mixed origins.

## Automated release evidence

Must be green on the launch commit:

- `python scripts/validate_site.py`
- `node --test tests/*.test.js`
- `node scripts/review_readings.js`
- `npm run test:e2e`
- `git diff --check`
- GitHub Pages / Cloudflare Pages deployment checks

## Owner/manual actions

These cannot be certified by source tests alone:

- open production on at least one real phone and one desktop browser
- inspect 200% zoom/reflow manually
- keyboard-only walkthrough of Home → RPG → Deep Reading → Combined
- download and inspect Base, Deep and Combined PNG exports
- screen-reader check before making an accessibility certification claim
- submit the stable sitemap to Google Search Console after the canonical hostname is final

## Measurement policy

`sorathai-events.js` defines a provider-neutral event contract and is deliberately no-op by default. No analytics provider is enabled in Milestone 10.

Never send:

- DOB, birth year or age
- raw URLs/query strings containing DOB
- dream text
- generated reading text
- localStorage/profile payloads
- names or email
- fingerprinting/advertising identifiers

Allowed event dimensions are fixed enums such as science ID, focus category, explored-count bucket, export surface and bounded failure reason.

If an analytics provider is enabled later, privacy copy must be reviewed first and transport tests must verify that only sanitized events are sent.

## 90-day product validation metrics

Do not invent target percentages before baseline data exists. Once privacy-safe measurement is deliberately enabled, observe:

1. Landing → Base Profile creation rate
2. Base Profile → at least one Deep Reading rate
3. Sciences explored per profile/session (aggregate distribution)
4. Combined Profile reach rate
5. Return usage
6. Export/share usage
7. Technical failure rate for export actions

Use these signals to decide whether traffic acquisition, retention, sharing or product depth is the next bottleneck before adding monetization.
