# M26 — Scheduled production smoke

Sorathai's production crawler smoke previously ran only after pushes to `main` or when manually dispatched. That leaves a blind spot when production hosting, headers, or deployed metadata drift while the repository is otherwise idle.

M26 adds a low-frequency scheduled run while preserving the existing push and manual triggers.

## Schedule

The workflow runs once per week on Monday at 03:17 UTC.

The schedule is intentionally low frequency because the smoke performs live HTTP checks against the public production surface and does not need continuous polling for this static site.

## Trigger behavior

- `push` to `main`: retain the existing 45-second Cloudflare Pages propagation wait, then run the smoke.
- `workflow_dispatch`: run the smoke immediately; no deployment propagation wait is required.
- `schedule`: run the smoke immediately; no deployment propagation wait is required.

## Scope and guardrails

The scheduled job uses the same `scripts/production_smoke.sh` contract as push/manual runs. It does not add analytics, credentials, write permissions, deployment behavior, third-party dependencies, or application code.

Workflow permissions remain `contents: read`, and the checkout action remains pinned to its existing full commit SHA.

A scheduled smoke failure is an operational signal, not permission to weaken the smoke contract. Investigate production/deployment drift or availability before changing validation expectations.
