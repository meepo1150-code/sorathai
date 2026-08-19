# Dependency update review policy

Sorathai uses immutable GitHub Action pins and an npm-generated lockfile for the browser-test toolchain. Dependabot is used only to discover and propose updates; a generated pull request is not approval to merge.

## Automated discovery scope

`.github/dependabot.yml` monitors exactly two ecosystems at the repository root:

- `github-actions` — remote Actions referenced by workflows in `.github/workflows`
- `npm` — the root browser-test manifest and lockfile

Both use a monthly schedule with a small open-PR limit to keep maintenance noise low. There are no private registries or credentials in the Dependabot configuration.

## Review contract

Every dependency update remains a normal reviewed repository change.

For GitHub Actions updates:

1. keep remote `uses:` references pinned to immutable 40-character commit SHAs
2. review the upstream release/tag and the commit SHA Dependabot proposes
3. preserve the adjacent human-readable major-version comment
4. do not broaden workflow permissions incidentally
5. run the complete Sorathai validation gate
6. for Actions used by production smoke, require post-merge production-smoke evidence before claiming the operational update complete

For npm/Playwright updates:

1. review `package.json` and the npm-generated `package-lock.json` together
2. inspect the resolved dependency graph for unrelated additions
3. keep browser-test dependencies development-only; do not turn them into production browser dependencies
4. install through `npm ci` in validation
5. require full Playwright regression before merge

## Guardrails

Dependabot must not be treated as an auto-merge or auto-deploy mechanism. This repository does not authorize:

- automatic merging of dependency PRs
- private dependency registries or repository credentials
- production JavaScript dependency expansion through maintenance automation
- workflow permission broadening without explicit review
- analytics, backend, account, payment, advertising, or other product-scope changes hidden inside dependency maintenance

If an update requires broader product or infrastructure scope, split it into a separate issue and reviewed PR rather than weakening these guardrails.
