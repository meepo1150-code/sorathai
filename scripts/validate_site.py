#!/usr/bin/env python3
"""Lightweight validation for the Sorathai static website."""

from __future__ import annotations

import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
SKIP_SCHEMES = {"http", "https", "mailto", "tel", "data", "javascript"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_text: list[str] = []
        self.in_title = False
        self.meta_names: set[str] = set()
        self.links: list[tuple[str, str]] = []
        self.ids: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value for key, value in attrs if value is not None}
        tag = tag.lower()

        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            name = values.get("name") or values.get("property")
            if name:
                self.meta_names.add(name.lower())
        elif tag in {"a", "link"} and values.get("href"):
            self.links.append(("href", values["href"]))
        elif tag in {"script", "img", "source"} and values.get("src"):
            self.links.append(("src", values["src"]))

        if values.get("id"):
            self.ids.append(values["id"])

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_text.append(data)


def local_target(page: Path, raw_url: str) -> Path | None:
    raw_url = raw_url.strip()
    if not raw_url or raw_url.startswith(("#", "//")):
        return None

    parsed = urlparse(raw_url)
    if parsed.scheme.lower() in SKIP_SCHEMES or parsed.netloc:
        return None

    path_text = unquote(parsed.path)
    if not path_text:
        return None

    if path_text.startswith("/"):
        target = ROOT / path_text.lstrip("/")
    else:
        target = page.parent / path_text

    if path_text.endswith("/"):
        target = target / "index.html"

    return target.resolve()


def validate_html() -> list[str]:
    errors: list[str] = []
    html_files = sorted(ROOT.glob("*.html"))

    if not html_files:
        return ["No HTML files found at repository root"]

    for page in html_files:
        parser = PageParser()
        try:
            parser.feed(page.read_text(encoding="utf-8"))
        except (OSError, UnicodeError) as exc:
            errors.append(f"{page.name}: cannot read UTF-8 content ({exc})")
            continue

        title = "".join(parser.title_text).strip()
        if not title:
            errors.append(f"{page.name}: missing non-empty <title>")
        if "viewport" not in parser.meta_names:
            errors.append(f"{page.name}: missing viewport meta tag")
        if page.name not in {"404.html"} and "description" not in parser.meta_names:
            errors.append(f"{page.name}: missing meta description")

        seen_ids: set[str] = set()
        for element_id in parser.ids:
            if element_id in seen_ids:
                errors.append(f"{page.name}: duplicate id '{element_id}'")
            seen_ids.add(element_id)

        for attribute, raw_url in parser.links:
            target = local_target(page, raw_url)
            if target is None:
                continue
            try:
                target.relative_to(ROOT)
            except ValueError:
                errors.append(f"{page.name}: {attribute} escapes repository root: {raw_url}")
                continue
            if not target.exists():
                errors.append(f"{page.name}: broken local {attribute}: {raw_url}")

    return errors


def validate_sitemap() -> list[str]:
    errors: list[str] = []
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        return ["sitemap.xml: file is missing"]

    try:
        tree = ET.parse(sitemap)
    except ET.ParseError as exc:
        return [f"sitemap.xml: invalid XML ({exc})"]

    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locations = tree.findall(".//sm:loc", namespace)
    if not locations:
        errors.append("sitemap.xml: no <loc> entries found")

    for loc in locations:
        url = (loc.text or "").strip()
        parsed = urlparse(url)
        if parsed.scheme != "https" or not parsed.netloc:
            errors.append(f"sitemap.xml: invalid public URL: {url}")
            continue
        relative = parsed.path.lstrip("/") or "index.html"
        if relative.endswith("/"):
            relative += "index.html"
        if not (ROOT / relative).exists():
            errors.append(f"sitemap.xml: target does not exist: {url}")

    return errors


def main() -> int:
    errors = validate_html() + validate_sitemap()
    if errors:
        print("Sorathai validation failed:\n")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Sorathai validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
