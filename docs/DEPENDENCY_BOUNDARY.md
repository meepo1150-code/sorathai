# Sorathai browser dependency boundary

Sorathai intentionally keeps the production browser dependency surface small.

## Allowed external resources

### Google Fonts

HTML pages may use Google Fonts only through:

- stylesheet requests on `https://fonts.googleapis.com/css2...`
- preconnects to `https://fonts.googleapis.com`
- preconnects to `https://fonts.gstatic.com`

No other external stylesheet, preload, icon, manifest, media/embed resource or CSS URL/import is allowed by default.

### html2canvas

Export-capable pages may load exactly this script:

`https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`

The script must remain `defer` and must not be added to pages that do not export cards/images.

Core reading, navigation and profile behavior must continue to work when this optional export dependency is unavailable.

## CI contract

`scripts/validate_external_dependencies.py` runs on every pull request and push to `main`.

It rejects:

- unapproved external JavaScript
- a different html2canvas CDN URL/version
- html2canvas on non-export pages
- unapproved external stylesheets/preconnects/resource links
- external image/media/embed resources
- external `url(...)` or `@import` assets in repository CSS or inline page CSS

## Changing the boundary

Do not widen the allowlist as part of an unrelated refactor. A new external provider should have a separate reviewed change that explains:

- why the dependency is needed
- whether it is blocking or optional
- privacy/data-transfer implications
- failure/offline behavior
- performance impact
- version/update policy
- whether the README/privacy documentation must change
- browser regression evidence

Analytics/telemetry transport remains a separate explicit product decision and is not authorized by this dependency allowlist.

## npm reproducibility

The browser-test toolchain has a committed npm-generated `package-lock.json` and CI installs it with `npm ci --no-audit --no-fund`.

The lockfile is a development/CI reproducibility contract, not permission to add production browser dependencies. Intentional Playwright upgrades must update `package.json` and regenerate/review the lockfile together, then pass the full browser regression gate. Do not hand-author or fabricate lockfile dependency entries.
