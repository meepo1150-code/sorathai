#!/usr/bin/env python3
"""Require remote GitHub Actions workflow dependencies to use immutable commit SHAs."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / ".github" / "workflows"
USES_RE = re.compile(r"^\s*uses:\s*([^\s#]+)")
FULL_SHA_RE = re.compile(r"[0-9a-fA-F]{40}")


def main() -> int:
    errors: list[str] = []
    workflow_files = sorted((*WORKFLOWS.glob("*.yml"), *WORKFLOWS.glob("*.yaml")))
    if not workflow_files:
        print("No GitHub Actions workflows found", file=sys.stderr)
        return 1

    for path in workflow_files:
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            match = USES_RE.match(line)
            if not match:
                continue
            target = match.group(1)
            if target.startswith("./") or target.startswith("docker://"):
                continue
            if "@" not in target:
                errors.append(f"{path.relative_to(ROOT)}:{number}: remote action has no immutable ref: {target}")
                continue
            _, ref = target.rsplit("@", 1)
            if not FULL_SHA_RE.fullmatch(ref):
                errors.append(
                    f"{path.relative_to(ROOT)}:{number}: remote action must use a full 40-character commit SHA, got {target}"
                )

    if errors:
        print("GitHub Action pin validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("GitHub Action pin validation passed: all remote uses references are immutable SHAs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
