# Sorathai

Sorathai คือเว็บไซต์ดูดวงแบบ mobile-first ที่เปลี่ยนวันเกิดของผู้ใช้ให้เป็น **Destiny Identity Card** และเปิดทางให้สำรวจคำอ่านเชิงลึกจากศาสตร์หลายระบบในประสบการณ์เดียวกัน

## Product vision

ประสบการณ์หลักของผู้ใช้ควรต่อเนื่องดังนี้:

1. กรอกวันเกิดจากหน้าแรก
2. รับ Base Destiny ID Card พร้อมข้อมูลตัวตนและค่าพลังเบื้องต้น
3. เลือกศาสตร์ที่ต้องการสำรวจผ่านบทสนทนาแบบ narrative/RPG
4. รับ Deep Reading Card ที่ซ้อนและขยายข้อมูลจาก Base Card เดิม
5. กลับไปเปิดศาสตร์อื่นและสะสมเป็น Combined Profile

เว็บไซต์ควรให้ความรู้สึกมินิมัล สะอาด สวยงาม ใช้งานง่าย และไม่บังคับสมัครสมาชิกในระยะแรก

## Current sciences

- โหราศาสตร์ไทย
- Western Astrology
- Chinese Astrology
- Numerology
- Mayan Tzolk'in
- Biorhythm
- Nakshatra
- Celtic Tree Astrology
- Dream interpretation

## Technical approach

ปัจจุบันเป็น static website ที่ใช้ HTML, CSS และ JavaScript ฝั่ง browser เหมาะกับ hosting ต้นทุนต่ำและการ deploy แบบ static

หลักการพัฒนาต่อ:

- Mobile-first
- Progressive enhancement
- วันเกิดและโปรไฟล์เก็บในอุปกรณ์ผู้ใช้เมื่อทำได้
- ผลลัพธ์จากวันเกิดเดียวกันต้องคงที่
- ลดโค้ดซ้ำระหว่างหน้าศาสตร์
- ทุกการเปลี่ยนแปลงสำคัญต้องผ่าน automated validation
- เนื้อหาความเชื่อต้องมี disclaimer และไม่อ้างเป็นคำแนะนำด้านสุขภาพ การเงิน กฎหมาย หรือความปลอดภัย

## Repository structure

ไฟล์หลักในปัจจุบัน:

- `index.html` — หน้าแรกและ Base Destiny ID Card
- `*-astrology.html`, `numerology.html`, `mayan.html`, `nakshatra.html`, `celtic.html`, `biorhythm.html` — หน้าคำอ่านแต่ละศาสตร์
- `dream.html`, `dream-result.html`, `dream-data.js` — ระบบทำนายฝัน
- `horoscope-data.js` — ข้อมูลคำอ่านหลัก
- `shared.css` — design system และ component ร่วม
- `sitemap.xml`, `robots.txt` — SEO foundation

## Local preview

เปิดเว็บด้วย static server แทนการดับเบิลคลิกไฟล์โดยตรง:

```bash
python -m http.server 8000
```

จากนั้นเปิด `http://localhost:8000`

## Validation

รันตัวตรวจพื้นฐาน:

```bash
python scripts/validate_site.py
```

ตัวตรวจจะตรวจไฟล์ HTML, internal links, sitemap targets และ metadata สำคัญเบื้องต้น

## Development workflow

1. สร้าง branch แยกจาก `main`
2. แก้ทีละ milestone ขนาดเล็ก
3. รัน validation
4. เปิด pull request
5. ตรวจ visual flow บนมือถือก่อน merge

ดูแผนงานที่ [`docs/ROADMAP.md`](docs/ROADMAP.md)
