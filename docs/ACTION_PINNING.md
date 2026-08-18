# GitHub Actions pinning policy

Sorathai pins remote GitHub Actions to immutable full commit SHAs. Human-readable major-version comments remain beside each pin so the workflow is easy to review without weakening immutability.

## Current pins

- `actions/checkout` v4 → `11d5960a326750d5838078e36cf38b85af677262`
- `actions/setup-python` v5 → `a26af69be951a213d495a4c3e4e4022e16d87065`
- `actions/setup-node` v4 → `49933ea5288caeca8642d1e84afbd3f7d6820020`
- `actions/upload-artifact` v4 → `ea165f8d65b6e75b540449e92b4886f43607fa02`

These values were resolved directly from the official upstream GitHub major tag refs before M19 implementation.

## Repository contract

`scripts/validate_action_pins.py` scans `.github/workflows/*.yml` and `.yaml` and rejects remote `uses:` entries unless the ref after `@` is a full 40-character hexadecimal Git commit SHA.

Local actions such as `./.github/actions/example` and `docker://...` references are outside this specific remote-action pin rule and must be reviewed on their own merits if introduced.

## Updating an action

Do not replace a SHA with a mutable major/minor tag merely to make upgrades easier. For an intentional update:

1. inspect the official upstream action repository and release/tag being adopted
2. resolve that upstream tag to its commit SHA
3. review release notes and compatibility implications
4. update the workflow SHA and the adjacent human-readable version comment together
5. update this document if the supported major changes
6. run the complete Sorathai validation gate, including Playwright
7. for actions used by production smoke, also require a successful post-merge production smoke run

## Permissions

Action upgrades must not broaden workflow permissions incidentally. Sorathai workflows currently use `permissions: contents: read`; any permission expansion requires explicit scope and review.

## Separate npm limitation

This policy only makes GitHub Action resolution immutable. It does not solve the browser-test npm transitive dependency limitation: the repository still has no npm-generated `package-lock.json`, so CI continues to use `npm install` until a real lockfile can be generated and validated separately.
