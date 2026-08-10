#!/usr/bin/env python3
"""Small idempotent terminology polish for Milestone 10 static landing surfaces."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PAGES = {
    "thai-astrology.html": ("โหราศาสตร์ไทยตามวันเกิด — Sorathai", "ดูดวง<br>โหราศาสตร์ไทย"),
    "western-astrology.html": ("โหราศาสตร์ตะวันตกจากวันเกิด — Sorathai", "ดูดวง<br>โหราศาสตร์ตะวันตก"),
    "chinese-astrology.html": ("โหราศาสตร์จีน: นักษัตร ธาตุ และหยินหยาง — Sorathai", "ดูดวง<br>โหราศาสตร์จีน"),
    "numerology.html": ("เลขศาสตร์: เลขเส้นทางชีวิตจากวันเกิด — Sorathai", "ดูดวง<br>เลขศาสตร์"),
    "mayan.html": ("ปฏิทินมายา Tzolk’in จากวันเกิด — Sorathai", "ดูดวง<br>ปฏิทินมายา"),
    "biorhythm.html": ("ไบโอริทึม: วัฏจักร 23/28/33 วัน — Sorathai", "ไบโอริทึม<br>23 · 28 · 33 วัน"),
    "nakshatra.html": ("ดาวฤกษ์อินเดีย Nakshatra จากวันเกิด — Sorathai", "ดูดวง<br>ดาวฤกษ์อินเดีย"),
    "celtic.html": ("ต้นไม้เคลต์ตามช่วงวันเกิด — Sorathai", "ดูดวง<br>ต้นไม้เคลต์"),
}


def set_meta(source: str, attr: str, key: str, value: str) -> str:
    pattern = rf'(<meta\s+{attr}=["\']{re.escape(key)}["\'][^>]*?content=["\'])[^"\']*(["\'])'
    return re.sub(pattern, rf'\1{value}\2', source, count=1, flags=re.I)


def main() -> None:
    changed = []
    for name, (title, heading) in PAGES.items():
        path = ROOT / name
        source = path.read_text(encoding="utf-8")
        original = source
        source = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', source, count=1, flags=re.S | re.I)
        source = set_meta(source, "property", "og:title", title)
        source = set_meta(source, "name", "twitter:title", title)
        source = re.sub(r'(<h1\s+class=["\']ettl["\'][^>]*>).*?(</h1>)', rf'\1{heading}\2', source, count=1, flags=re.S | re.I)
        source = source.replace('</svg>แชร์การ์ด', '</svg>บันทึกการ์ด')
        if name == "biorhythm.html":
            source = source.replace('กายภาพ · อารมณ์ · สติปัญญา', 'กาย · อารมณ์ · ความคิด/สมาธิ')
        if source != original:
            path.write_text(source, encoding="utf-8")
            changed.append(name)
    print("launch terminology migration:", ", ".join(changed) if changed else "no changes")


if __name__ == "__main__":
    main()
