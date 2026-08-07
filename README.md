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
- `sorathai-profile.js` — โมเดลโปรไฟล์กลาง การตรวจวันเกิด URL และ persistence
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

ทดสอบโมเดลโปรไฟล์ด้วย Node.js โดยไม่ต้องติดตั้ง dependency:

```bash
node --test tests/*.test.js
```

## Profile storage

วันเกิดถูกแปลงเป็น ISO `YYYY-MM-DD` และประมวลผลใน browser เท่านั้น โมเดลบันทึก object
`{ version: 2, dob, powers, exploredSciences, lastFocus }` ที่ key เดิม
`sorathai.profile.v1` ใน `localStorage` โดยโปรไฟล์ version 1 จะถูกย้ายข้อมูลอัตโนมัติ เมื่อ storage
ใช้งานไม่ได้ เว็บไซต์ยังทำงานต่อโดยไม่ persistence ได้ ลิงก์เดิม `?dob=DDMMYYYY` ยังคงรองรับ
และ query ที่ไม่ใช่วันจริงจะไม่แสดงคำอ่าน

หน้าแรกแสดงปีพุทธศักราชแก่ผู้ใช้ แต่แปลงและบันทึกวันเกิดเป็น Gregorian ISO ภายในเสมอ
Base Destiny Card ใช้ค่าพลัง deterministic เดิมร่วมกับเลขเส้นทางชีวิตและ archetype; ค่าดังกล่าว
เป็นสัญลักษณ์เพื่อการสะท้อนตนเอง ไม่ใช่ผลการวัดทางวิทยาศาสตร์ ผู้ใช้เปลี่ยนหรือล้างวันเกิดได้จากหน้าแรก

การเลือกการ์ดศาสตร์บนหน้าแรกจะเปิด exploration sheet แบบสองขั้นสั้น ๆ ผู้ใช้เลือกมุมคำอ่าน
`identity`, `love`, `career` หรือ `challenge` หรือข้ามไปยังคำอ่านทันทีได้ ลิงก์ยังคงเป็นลิงก์
HTML ปกติและนำทางตรงได้เมื่อ JavaScript ไม่ทำงาน

## Development workflow

1. สร้าง branch แยกจาก `main`
2. แก้ทีละ milestone ขนาดเล็ก
3. รัน validation
4. เปิด pull request
5. ตรวจ visual flow บนมือถือก่อน merge

ดูแผนงานที่ [`docs/ROADMAP.md`](docs/ROADMAP.md)

## Trust, privacy, and dependencies

Public trust routes are [`about.html`](about.html), [`privacy.html`](privacy.html), and
[`contact.html`](contact.html). The contact page states truthfully that this repository has not yet
published a public contact channel.

“เปลี่ยนวันเกิด” เปิดแบบฟอร์มโดยยังเก็บโปรไฟล์เดิม ส่วน “ล้างวันเกิด” ลบ key ของ Sorathai จาก
`localStorage` การล้าง site data ใน browser ให้ผลเดียวกัน แต่ไม่ลบ URL ในประวัติ รูปที่ดาวน์โหลด
หรือลิงก์ที่แชร์ พารามิเตอร์ `dob` ใน URL อาจเปิดเผยวันเกิดแก่ผู้ที่เห็นลิงก์ ข้อความฝันเก็บใน
`sorathai_dreams` และการตีความรุ่นนี้ใช้ข้อมูลภายใน browser โดยไม่เรียกบริการ AI ภายนอก

Google Fonts ใช้ `display=swap` และมี Georgia/system sans-serif fallback จึงยังอ่านได้เมื่อถูกบล็อก
`html2canvas` โหลดจาก cdnjs เฉพาะหน้าที่มี export; core reading/navigation ไม่พึ่ง CDN และ export
จะแจ้งสถานะอย่างสุภาพหาก library ไม่พร้อม

## Lightweight performance budget

- ห้ามเพิ่ม blocking third-party JavaScript ใน critical path; non-critical scripts ต้อง `defer`
- ไม่โหลด `html2canvas` บนหน้าที่ไม่มี export และ core reading ต้องไม่พึ่ง CDN
- ไม่มี autoplay และไม่เพิ่ม first-screen asset ขนาดใหญ่โดยไม่มี dimensions/พื้นที่สำรอง
- ใช้ shared module/CSS แทน large duplicated inline code เมื่อทำได้โดยไม่เปลี่ยน product logic
- third-party origins ใน flow ปัจจุบันจำกัดไว้ที่ Google Fonts และ cdnjs ตาม privacy page

## Manual QA status

Milestone 8 (Issue #14) มี release gate และแบบบันทึกหลักฐานแบบทีละขั้นที่
[`docs/RELEASE_QA.md`](docs/RELEASE_QA.md) ครอบคลุม core/combined/dream/trust, responsive,
accessibility, export, dependency failure และ console/network ตัว validator ยังล็อก public routes,
science ID/URL, trust/Combined/export contracts, external-model endpoints และ deferred html2canvas

คอนเทนเนอร์ที่ใช้ทำ Issue #14 ไม่มี Chromium/Chrome, Playwright, Puppeteer, Selenium
หรือ browser runtime ที่เชื่อถือได้ จึงไม่มีการอ้าง browser evidence หรือ screenshot สถานะปัจจุบันคือ
**static/integration QA complete; browser validation pending** และยังไม่ประกาศเป็น Release Candidate
ข้อจำกัดที่ไม่ block static gate คือ visual reflow, assistive technology, export pixels และ live
console/network ยังต้องตรวจตามเอกสารใน browser จริงก่อน release
