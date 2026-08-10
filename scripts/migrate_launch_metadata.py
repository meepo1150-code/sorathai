#!/usr/bin/env python3
"""Idempotent one-time migration for Milestone 10 launch metadata.

This script changes only static crawl/social metadata and the sitemap/validator
contract. It deliberately does not touch astrology calculations, profile state,
reading copy, or runtime navigation.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://sorathai.pages.dev"
NOINDEX = {"profile.html", "dream-result.html"}
PUBLIC = [
    "index.html",
    "profile.html",
    "thai-astrology.html",
    "western-astrology.html",
    "chinese-astrology.html",
    "numerology.html",
    "mayan.html",
    "biorhythm.html",
    "nakshatra.html",
    "celtic.html",
    "dream.html",
    "dream-result.html",
    "about.html",
    "privacy.html",
    "contact.html",
]


def page_url(name: str) -> str:
    return f"{ORIGIN}/" if name == "index.html" else f"{ORIGIN}/{name}"


def migrate_html(name: str) -> bool:
    path = ROOT / name
    source = path.read_text(encoding="utf-8")
    original = source

    # Replace the unconfigured custom-domain origin everywhere in static metadata.
    source = source.replace("https://sorathai.com/", f"{ORIGIN}/")
    source = source.replace("https://sorathai.com", ORIGIN)

    canonical = page_url(name)
    canonical_tag = f'    <link rel="canonical" href="{canonical}" />'
    if re.search(r'<link\s+rel=["\']canonical["\']', source, flags=re.I):
        source = re.sub(
            r'\s*<link\s+rel=["\']canonical["\'][^>]*>',
            "\n" + canonical_tag,
            source,
            count=1,
            flags=re.I,
        )
    else:
        source = source.replace("</head>", canonical_tag + "\n  </head>", 1)

    if name in NOINDEX:
        robots_tag = '    <meta name="robots" content="noindex,follow" />'
        if re.search(r'<meta\s+name=["\']robots["\']', source, flags=re.I):
            source = re.sub(
                r'\s*<meta\s+name=["\']robots["\'][^>]*>',
                "\n" + robots_tag,
                source,
                count=1,
                flags=re.I,
            )
        else:
            source = source.replace(canonical_tag, robots_tag + "\n" + canonical_tag, 1)

    # Static social URLs must be parameter-free and share one real asset.
    source = re.sub(
        r'(<meta\s+property=["\']og:url["\']\s+content=["\'])[^"\']+(["\'])',
        rf'\1{canonical}\2',
        source,
        flags=re.I,
    )
    source = re.sub(
        r'(<meta\s+property=["\']og:image["\']\s+content=["\'])[^"\']+(["\'])',
        rf'\1{ORIGIN}/og-image.png\2',
        source,
        flags=re.I,
    )
    source = re.sub(
        r'(<meta\s+name=["\']twitter:image["\']\s+content=["\'])[^"\']+(["\'])',
        rf'\1{ORIGIN}/og-image.png\2',
        source,
        flags=re.I,
    )

    if source != original:
        path.write_text(source, encoding="utf-8")
        return True
    return False


def migrate_sitemap() -> bool:
    path = ROOT / "sitemap.xml"
    source = path.read_text(encoding="utf-8")
    original = source
    for name in NOINDEX:
        source = re.sub(
            rf'\s*<url><loc>{re.escape(page_url(name))}</loc>.*?</url>',
            "",
            source,
            flags=re.S,
        )
    if source != original:
        path.write_text(source, encoding="utf-8")
        return True
    return False


def migrate_validator() -> bool:
    path = ROOT / "scripts/validate_site.py"
    source = path.read_text(encoding="utf-8")
    original = source

    old = 'expected = {page.name for page in ROOT.glob("*.html") if page.name != "404.html"}'
    new = 'expected = {page.name for page in ROOT.glob("*.html") if page.name not in {"404.html", "profile.html", "dream-result.html"}}'
    if old in source:
        source = source.replace(old, new, 1)

    marker = '        if page.name != "404.html":\n            required_meta = '
    if marker in source and 'user-specific route must declare noindex' not in source:
        replacement = (
            '        if page.name in {"profile.html", "dream-result.html"}:\n'
            '            page_source = page.read_text(encoding="utf-8").lower()\n'
            '            if \'name="robots"\' not in page_source or "noindex" not in page_source:\n'
            '                errors.append(f"{page.name}: user-specific route must declare noindex")\n\n'
            + marker
        )
        source = source.replace(marker, replacement, 1)

    if source != original:
        path.write_text(source, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for name in PUBLIC:
        if migrate_html(name):
            changed.append(name)
    if migrate_sitemap():
        changed.append("sitemap.xml")
    if migrate_validator():
        changed.append("scripts/validate_site.py")
    print("launch metadata migration:", ", ".join(changed) if changed else "no changes")


if __name__ == "__main__":
    main()
