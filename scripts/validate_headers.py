#!/usr/bin/env python3
"""Validate Sorathai's Cloudflare Pages _headers source contract."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEADERS = ROOT / "_headers"

REQUIRED_SNIPPETS = (
    "/*\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()",
    "/sitemap.xml\n  Content-Type: application/xml; charset=utf-8\n  Cache-Control: public, max-age=300",
    "/robots.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=300",
)

FORBIDDEN_DUPLICATES = (
    "X-Content-Type-Options:",
    "Referrer-Policy:",
)


def main() -> int:
    if not HEADERS.exists():
        print("_headers is missing", file=sys.stderr)
        return 1

    source = HEADERS.read_text(encoding="utf-8")
    errors: list[str] = []

    for snippet in REQUIRED_SNIPPETS:
        if snippet not in source:
            first_line = snippet.splitlines()[0]
            errors.append(f"missing required header rule starting with {first_line!r}")

    for header in FORBIDDEN_DUPLICATES:
        if header.lower() in source.lower():
            errors.append(
                f"{header.rstrip(':')} should not be duplicated in _headers; Cloudflare Pages supplies the current default and production smoke verifies it"
            )

    if source.lower().count("x-frame-options:") != 1:
        errors.append("X-Frame-Options must appear exactly once in _headers")
    if source.lower().count("permissions-policy:") != 1:
        errors.append("Permissions-Policy must appear exactly once in _headers")

    if errors:
        print("Header source validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Header source validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
