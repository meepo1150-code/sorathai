#!/usr/bin/env python3
"""Validate Sorathai's intentionally narrow browser dependency boundary."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]

HTML2CANVAS_URL = (
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
)
HTML2CANVAS_INTEGRITY = (
    "sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA=="
)
HTML2CANVAS_CROSSORIGIN = "anonymous"
GOOGLE_FONT_STYLESHEET_HOST = "fonts.googleapis.com"
GOOGLE_FONT_PRECONNECT_HOSTS = {"fonts.googleapis.com", "fonts.gstatic.com"}

SCIENCE_PAGES = {
    "thai-astrology.html",
    "western-astrology.html",
    "chinese-astrology.html",
    "numerology.html",
    "mayan.html",
    "biorhythm.html",
    "nakshatra.html",
    "celtic.html",
}
EXPORT_PAGES = {"index.html", "profile.html", "dream-result.html", *SCIENCE_PAGES}
RESOURCE_LINK_RELS = {
    "stylesheet",
    "preconnect",
    "dns-prefetch",
    "preload",
    "modulepreload",
    "icon",
    "manifest",
}


def is_external(url: str) -> bool:
    parsed = urlparse(url.strip())
    return parsed.scheme.lower() in {"http", "https"} or bool(parsed.netloc)


class DependencyParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.scripts: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.embeds: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value for key, value in attrs if value is not None}
        present = {key.lower() for key, _ in attrs}
        tag = tag.lower()

        if tag == "script" and values.get("src"):
            self.scripts.append({**values, **{key: "" for key in present - values.keys()}})
        elif tag == "link" and values.get("href"):
            rels = {part.lower() for part in values.get("rel", "").split()}
            if rels & RESOURCE_LINK_RELS:
                self.links.append({**values, "rel": " ".join(sorted(rels))})
        elif tag in {"img", "source", "iframe", "video", "audio", "object", "embed"}:
            candidate = values.get("src") or values.get("data")
            if candidate:
                self.embeds.append((tag, candidate))


def validate_html_page(page: Path) -> list[str]:
    errors: list[str] = []
    source = page.read_text(encoding="utf-8")
    parser = DependencyParser()
    parser.feed(source)

    external_scripts = [script for script in parser.scripts if is_external(script.get("src", ""))]
    html2canvas_scripts = [
        script for script in external_scripts if "html2canvas" in script.get("src", "").lower()
    ]

    for script in external_scripts:
        src = script.get("src", "")
        if src != HTML2CANVAS_URL:
            errors.append(f"{page.name}: unapproved external script: {src}")
        if src == HTML2CANVAS_URL:
            if "defer" not in script:
                errors.append(f"{page.name}: html2canvas must remain deferred")
            if script.get("integrity") != HTML2CANVAS_INTEGRITY:
                errors.append(
                    f"{page.name}: html2canvas must use the approved SRI hash"
                )
            if script.get("crossorigin", "").lower() != HTML2CANVAS_CROSSORIGIN:
                errors.append(
                    f"{page.name}: html2canvas must use crossorigin=\"anonymous\""
                )

    if page.name in EXPORT_PAGES:
        if len(html2canvas_scripts) != 1:
            errors.append(
                f"{page.name}: export page must load exactly one approved html2canvas script"
            )
    elif html2canvas_scripts:
        errors.append(f"{page.name}: html2canvas is not allowed on non-export pages")

    for link in parser.links:
        href = link.get("href", "")
        if not is_external(href):
            continue
        rels = set(link.get("rel", "").split())
        parsed = urlparse(href)
        host = parsed.netloc.lower()

        if "stylesheet" in rels:
            if host != GOOGLE_FONT_STYLESHEET_HOST or not parsed.path.startswith("/css2"):
                errors.append(f"{page.name}: unapproved external stylesheet: {href}")
            continue

        if "preconnect" in rels:
            if host not in GOOGLE_FONT_PRECONNECT_HOSTS:
                errors.append(f"{page.name}: unapproved preconnect origin: {href}")
            continue

        errors.append(
            f"{page.name}: unapproved external resource link ({link.get('rel', '')}): {href}"
        )

    for tag, src in parser.embeds:
        if is_external(src):
            errors.append(f"{page.name}: external <{tag}> resource is not approved: {src}")

    inline_external_css = re.findall(
        r"(?:url\(|@import\s+)[\"']?(https?://[^\"')\s;]+)", source, flags=re.IGNORECASE
    )
    for url in inline_external_css:
        errors.append(f"{page.name}: external inline CSS asset is not approved: {url}")

    return errors


def validate_css_files() -> list[str]:
    errors: list[str] = []
    pattern = re.compile(
        r"(?:url\(|@import\s+)[\"']?(https?://[^\"')\s;]+)", flags=re.IGNORECASE
    )
    for path in sorted(ROOT.glob("*.css")):
        source = path.read_text(encoding="utf-8")
        for url in pattern.findall(source):
            errors.append(f"{path.name}: external CSS asset/import is not approved: {url}")
    return errors


def main() -> int:
    errors: list[str] = []
    for page in sorted(ROOT.glob("*.html")):
        errors.extend(validate_html_page(page))
    errors.extend(validate_css_files())

    if errors:
        print("External dependency validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(
        "External dependency validation passed: Google Fonts + SRI-pinned deferred html2canvas 1.4.1 only."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
