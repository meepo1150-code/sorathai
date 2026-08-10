#!/usr/bin/env python3
"""Idempotent migration for Milestone 10 launch/search metadata.

Changes only static crawl/social metadata, short pre-reading context, sitemap,
and validation contracts. Astrology calculations, profile state, generated
reading logic, URLs used by the runtime, and navigation behavior are untouched.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://sorathai.pages.dev"
NOINDEX = {"profile.html", "dream-result.html"}
PUBLIC = [
    "index.html", "profile.html", "thai-astrology.html", "western-astrology.html",
    "chinese-astrology.html", "numerology.html", "mayan.html", "biorhythm.html",
    "nakshatra.html", "celtic.html", "dream.html", "dream-result.html",
    "about.html", "privacy.html", "contact.html",
]

SCIENCE = {
    "thai-astrology.html": {
        "name": "โหราศาสตร์ไทย",
        "description": "อ่านวันเกิดประจำสัปดาห์และดาวประจำวันตามคติไทย แล้วแปลเป็นบุคลิก วิธีตัดสินใจ ความสัมพันธ์ การงาน จุดแข็ง และสิ่งที่ควรระวัง",
        "context": "คำอ่านนี้ใช้วันเกิดเพื่อหาวันประจำสัปดาห์และสัญลักษณ์ดาวประจำวันตามคติไทย ก่อนแปลความหมายเป็นบุคลิก วิธีตัดสินใจ ความสัมพันธ์ การงาน จุดแข็ง และสิ่งที่ควรระวัง เพื่อการสะท้อนตนเอง ไม่ใช่การรับรองเหตุการณ์ในอนาคต",
    },
    "western-astrology.html": {
        "name": "โหราศาสตร์ตะวันตก",
        "description": "อ่านราศีอาทิตย์ ธาตุ และดาวครองจากวันเกิด แล้วเชื่อมกับบุคลิก วิธีตัดสินใจ ความสัมพันธ์ การงาน จุดแข็ง และเงาที่ควรเข้าใจ",
        "context": "ระบบนี้ใช้วันเกิดเพื่อหาราศีอาทิตย์ แล้วอ่านร่วมกับธาตุและดาวครองตามโหราศาสตร์ตะวันตก ผลลัพธ์ช่วยสำรวจบุคลิก วิธีตัดสินใจ ความสัมพันธ์ การงาน จุดแข็ง และด้านที่อาจต้องปรับสมดุล โดยไม่อ้างว่าเป็นการวัดทางวิทยาศาสตร์",
    },
    "chinese-astrology.html": {
        "name": "โหราศาสตร์จีน",
        "description": "อ่านนักษัตรปีเกิด ธาตุ และหยินหยางตามระบบที่คำนวณได้ เพื่อสำรวจรูปแบบสังคม การตัดสินใจ ความสัมพันธ์ การงาน จุดแข็ง และจุดบอด",
        "context": "คำอ่านจีนเริ่มจากนักษัตรปีเกิด และใช้ธาตุกับหยินหยางเมื่อข้อมูลนั้นถูกคำนวณได้ จากนั้นจึงแปลเป็นมุมมองเรื่องการเข้าสังคม การตัดสินใจ ความสัมพันธ์ การงาน จุดแข็ง และจุดบอด โดยไม่ตีกรอบว่านักษัตรเป็นนิสัยตายตัว",
    },
    "numerology.html": {
        "name": "เลขศาสตร์",
        "description": "คำนวณเลขเส้นทางชีวิตจากวันเกิด แล้วอ่านแรงจูงใจ จุดแข็ง บทเรียนที่มักเกิดซ้ำ ความสัมพันธ์ และแนวทางการทำงานตามความเชื่อเลขศาสตร์",
        "context": "เลขศาสตร์หน้านี้คำนวณเลขเส้นทางชีวิตจากตัวเลขในวันเกิด และคงเลขมาสเตอร์ตามกติกาที่ระบบรองรับ ก่อนตีความแรงจูงใจ จุดแข็ง บทเรียนที่มักเกิดซ้ำ ความสัมพันธ์ และการงานในฐานะภาษาสัญลักษณ์ ไม่ใช่การวัดความสามารถ",
    },
    "mayan.html": {
        "name": "ปฏิทินมายา",
        "description": "สำรวจ Tzolk’in วัฏจักร 260 วัน ผ่านสัญลักษณ์วัน 20 แบบและโทน 13 ระดับ แล้วอ่านความหมายของคู่สัญลักษณ์ที่คำนวณจากวันเกิด",
        "context": "ระบบ Tzolk’in ใช้วัฏจักร 260 วันซึ่งประกอบด้วยสัญลักษณ์วัน 20 แบบและโทน 13 ระดับ หน้านี้คำนวณคู่สัญลักษณ์จากวันเกิด แล้วอธิบายความหมาย จุดแข็ง และบทเรียนเชิงสัญลักษณ์เพื่อใช้คิดต่อ",
    },
    "biorhythm.html": {
        "name": "ไบโอริทึม",
        "description": "ดูตำแหน่งวัฏจักร 23, 28 และ 33 วันเทียบกับวันที่กำลังดู สำหรับกาย อารมณ์ และความคิดในฐานะแบบจำลองความเชื่อ ไม่ใช่การประเมินสุขภาพ",
        "context": "ไบโอริทึมต่างจากศาสตร์วันเกิดอื่นใน Sorathai เพราะค่าที่เห็นเปลี่ยนตามวันที่กำลังดู ระบบคำนวณวัฏจักร 23, 28 และ 33 วันสำหรับกาย อารมณ์ และความคิด/สมาธิ แล้วใช้เป็นคำถามสะท้อนตนเอง ไม่ใช่การวินิจฉัยสุขภาพหรือวัดสติปัญญา",
    },
    "nakshatra.html": {
        "name": "ดาวฤกษ์อินเดีย",
        "description": "อ่าน Nakshatra หรือการแบ่งแนวดวงจันทร์ 27 ส่วนจากวันเกิด แล้วอธิบายสัญลักษณ์ แรงจูงใจ ความสัมพันธ์ จุดแข็ง ความท้าทาย และข้อคิด",
        "context": "Nakshatra เป็นกรอบโหราศาสตร์อินเดียที่แบ่งแนวการเดินของดวงจันทร์เป็น 27 ส่วน หน้านี้หาดาวฤกษ์ที่สัมพันธ์กับวันเกิด แล้วอธิบายชื่อ สัญลักษณ์ แรงจูงใจ ความสัมพันธ์ จุดแข็ง ความท้าทาย และข้อคิดตามความเชื่อ",
    },
    "celtic.html": {
        "name": "ต้นไม้เคลต์",
        "description": "เชื่อมช่วงวันเกิดกับสัญลักษณ์ต้นไม้ในคติ Celtic Tree แล้วอ่านบุคลิก การเติบโต ความสัมพันธ์ จุดแข็ง ความท้าทาย และคำถามให้คิดต่อ",
        "context": "คำอ่านต้นไม้เคลต์เชื่อมช่วงวันเกิดกับต้นไม้เชิงสัญลักษณ์ตามระบบที่เว็บไซต์ใช้ จากนั้นอธิบายว่าต้นไม้นั้นสื่อถึงบุคลิก การเติบโต ความสัมพันธ์ จุดแข็ง และความท้าทายอย่างไร เพื่อใช้สะท้อนตนเอง ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์",
    },
}


def page_url(name: str) -> str:
    return f"{ORIGIN}/" if name == "index.html" else f"{ORIGIN}/{name}"


def set_meta_content(source: str, selector: str, value: str) -> str:
    if selector.startswith("property:"):
        attr, key = "property", selector.split(":", 1)[1]
    else:
        attr, key = "name", selector.split(":", 1)[1]
    pattern = rf'(<meta\s+{attr}=["\']{re.escape(key)}["\'][^>]*?content=["\'])[^"\']*(["\'])'
    return re.sub(pattern, rf'\1{value}\2', source, count=1, flags=re.I)


def inject_structured_data(source: str, name: str, description: str, url: str, kind: str = "WebPage") -> str:
    marker = 'data-sorathai-launch-schema="1"'
    if marker in source:
        return source
    if kind == "WebSite":
        data = {"@context": "https://schema.org", "@type": "WebSite", "name": "Sorathai", "url": url, "description": description, "inLanguage": "th"}
    else:
        data = {"@context": "https://schema.org", "@type": "WebPage", "name": name, "url": url, "description": description, "inLanguage": "th", "isPartOf": {"@type": "WebSite", "name": "Sorathai", "url": f"{ORIGIN}/"}}
    tag = f'    <script type="application/ld+json" {marker}>{json.dumps(data, ensure_ascii=False, separators=(",", ":"))}</script>'
    return source.replace("</head>", tag + "\n  </head>", 1)


def migrate_html(name: str) -> bool:
    path = ROOT / name
    source = path.read_text(encoding="utf-8")
    original = source

    source = source.replace("https://sorathai.com/", f"{ORIGIN}/")
    source = source.replace("https://sorathai.com", ORIGIN)
    # Visible export watermarks should be brand-only rather than tied to a temporary host.
    source = re.sub(r'sorathai\.com(?=\s*·)', "Sorathai", source, flags=re.I)

    canonical = page_url(name)
    canonical_tag = f'    <link rel="canonical" href="{canonical}" />'
    if re.search(r'<link\s+rel=["\']canonical["\']', source, flags=re.I):
        source = re.sub(r'\s*<link\s+rel=["\']canonical["\'][^>]*>', "\n" + canonical_tag, source, count=1, flags=re.I)
    else:
        source = source.replace("</head>", canonical_tag + "\n  </head>", 1)

    if name in NOINDEX:
        robots_tag = '    <meta name="robots" content="noindex,follow" />'
        if re.search(r'<meta\s+name=["\']robots["\']', source, flags=re.I):
            source = re.sub(r'\s*<meta\s+name=["\']robots["\'][^>]*>', "\n" + robots_tag, source, count=1, flags=re.I)
        else:
            source = source.replace(canonical_tag, robots_tag + "\n" + canonical_tag, 1)

    source = set_meta_content(source, "property:og:url", canonical)
    source = set_meta_content(source, "property:og:image", f"{ORIGIN}/og-image.png")
    source = set_meta_content(source, "name:twitter:image", f"{ORIGIN}/og-image.png")

    if name in SCIENCE:
        item = SCIENCE[name]
        description = item["description"]
        source = set_meta_content(source, "name:description", description)
        source = set_meta_content(source, "property:og:description", description)
        source = set_meta_content(source, "name:twitter:description", description)
        if 'data-sorathai-search-context="1"' not in source:
            context = (
                '<p class="science-index-context" data-sorathai-search-context="1" '
                'style="max-width:38rem;margin:16px auto 0;color:var(--t2);font-size:13px;line-height:1.75">'
                + item["context"] + '</p>'
            )
            match = re.search(r'(<p\s+class=["\']esub["\'][^>]*>.*?</p>)', source, flags=re.S | re.I)
            if match:
                source = source[:match.end()] + "\n    " + context + source[match.end():]
        source = inject_structured_data(source, item["name"], description, canonical)
    elif name == "index.html":
        source = inject_structured_data(
            source,
            "Sorathai",
            "ใส่วันเกิดเพื่อเปิด Base Destiny Card แล้วสำรวจตัวตนผ่านหลายระบบความเชื่อในประสบการณ์เดียวกัน",
            canonical,
            "WebSite",
        )
    elif name == "dream.html":
        source = inject_structured_data(
            source,
            "ทำนายฝัน — Sorathai",
            "ตีความสัญลักษณ์ในความฝันตามความเชื่อและใช้เป็นคำถามเพื่อการสะท้อนตนเอง",
            canonical,
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
        source = re.sub(rf'\s*<url><loc>{re.escape(page_url(name))}</loc>.*?</url>', "", source, flags=re.S)
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
