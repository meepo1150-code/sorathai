#!/usr/bin/env python3
"""Validate Sorathai's Cloudflare Pages _headers source contract."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEADERS = ROOT / "_headers"
BASE = "https://sorathai.pages.dev"

CANONICAL_ROUTES = (
    "/",
    "/thai-astrology.html",
    "/western-astrology.html",
    "/chinese-astrology.html",
    "/numerology.html",
    "/mayan.html",
    "/biorhythm.html",
    "/nakshatra.html",
    "/celtic.html",
    "/dream.html",
    "/about.html",
    "/privacy.html",
    "/contact.html",
)

EXCLUDED_CANONICAL_ROUTES = (
    "/profile.html",
    "/dream-result.html",
    "/404.html",
)

REQUIRED_SNIPPETS = (
    "/*\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()",
    "/sitemap.xml\n  Content-Type: application/xml; charset=utf-8\n  Cache-Control: public, max-age=300",
    "/robots.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=300",
)

FORBIDDEN_DUPLICATES = (
    "X-Content-Type-Options:",
    "Referrer-Policy:",
)


def canonical_target(route: str) -> str:
    return f"{BASE}/" if route == "/" else f"{BASE}{route}"


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

    expected_link_lines: set[str] = set()
    for route in CANONICAL_ROUTES:
        target = canonical_target(route)
        block = f'{route}\n  Link: <{target}>; rel="canonical"'
        expected_link_lines.add(f'Link: <{target}>; rel="canonical"')
        if block not in source:
            errors.append(f"missing canonical header mapping: {route} -> {target}")
        if source.count(block) != 1:
            errors.append(f"canonical header mapping must appear exactly once for {route}")

    actual_link_lines = {
        line.strip()
        for line in source.splitlines()
        if line.strip().lower().startswith("link:")
    }
    unexpected_links = sorted(actual_link_lines - expected_link_lines)
    missing_links = sorted(expected_link_lines - actual_link_lines)
    for line in unexpected_links:
        errors.append(f"unexpected Link header rule: {line}")
    for line in missing_links:
        errors.append(f"missing Link header rule: {line}")

    if len(actual_link_lines) != len(CANONICAL_ROUTES):
        errors.append(
            f"expected {len(CANONICAL_ROUTES)} unique canonical Link headers, found {len(actual_link_lines)}"
        )

    for route in EXCLUDED_CANONICAL_ROUTES:
        if f"{route}\n  Link:" in source:
            errors.append(f"excluded route must not receive a canonical Link rule: {route}")

    if errors:
        print("Header source validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Header source validation passed, including canonical URL mappings.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
