# Sorathai

Sorathai คือเว็บไซต์ดูดวงแบบ mobile-first ที่เปลี่ยนวันเกิดของผู้ใช้ให้เป็น **Base Destiny Card** และเปิดทางให้สำรวจคำอ่านเชิงลึกจากหลายระบบความเชื่อในประสบการณ์เดียวกัน

## Product vision

ประสบการณ์หลักของผู้ใช้:

1. กรอกวันเกิดจากหน้าแรก
2. รับ Base Destiny Card พร้อมข้อมูลตัวตนและค่าพลังเชิงสัญลักษณ์
3. เลือกศาสตร์ที่ต้องการสำรวจผ่านบทสนทนาแบบ narrative/RPG สั้น ๆ
4. รับ Deep Reading Card ที่ขยายจาก Base Card เดิม
5. กลับไปเปิดศาสตร์อื่นและสะสมเป็น Combined Profile

เว็บไซต์เน้นความมินิมัล สะอาด อ่านง่าย และไม่บังคับสมัครสมาชิก

## Current readings

- โหราศาสตร์ไทย
- โหราศาสตร์ตะวันตก
- โหราศาสตร์จีน
- เลขศาสตร์
- ปฏิทินมายา
- ไบโอริทึม
- ดาวฤกษ์อินเดีย
- ต้นไม้เคลต์
- ทำนายฝัน (เส้นทางแยกจากโปรไฟล์วันเกิด)

## Technical approach

ปัจจุบันเป็น static website ที่ใช้ HTML, CSS และ JavaScript ฝั่ง browser เหมาะกับ hosting ต้นทุนต่ำและ deployment แบบ static

หลักการพัฒนา:

- Mobile-first และ progressive enhancement
- วันเกิด/โปรไฟล์ประมวลผลและเก็บในอุปกรณ์ผู้ใช้เมื่อทำได้
- ผลลัพธ์จากวันเกิดเดียวกันต้อง deterministic
- ลดโค้ดซ้ำด้วย shared modules/design system
- การเปลี่ยนแปลงสำคัญต้องผ่าน static, unit/content และ Playwright browser regression
- เนื้อหาความเชื่อใช้เพื่อความบันเทิง/สะท้อนตนเอง ไม่ใช่คำแนะนำด้านสุขภาพ การเงิน กฎหมาย หรือความปลอดภัย

## Repository structure

ไฟล์หลัก:

- `index.html` — Home + Base Destiny Card
- `profile.html` — Combined Profile
- `*-astrology.html`, `numerology.html`, `mayan.html`, `nakshatra.html`, `celtic.html`, `biorhythm.html` — 8 deep readings
- `dream.html`, `dream-result.html` — เส้นทางทำนายฝัน
- `horoscope-data.js` — ข้อมูล/ตารางคำนวณหลัก
- `sorathai-profile.js` — profile, DOB validation, URL และ persistence
- `sorathai-reading.js`, `sorathai-content.js`, `sorathai-combined.js` — shared reading/synthesis layers
- `sorathai-site.js`, `shared.css` — shared UX/design system
- `m12-*.css` — visual identity layers ที่ถูกโหลดตามลำดับผ่าน `shared.css`; ดู [`docs/PRESENTATION_ARCHITECTURE.md`](docs/PRESENTATION_ARCHITECTURE.md)
- `sorathai-events.js` — provider-neutral privacy-safe measurement contract; no network transport by default
- `sitemap.xml`, `robots.txt` — crawl/index foundation

## Local preview

```bash
python -m http.server 8000
```

จากนั้นเปิด `http://localhost:8000`

## Validation

```bash
python scripts/validate_site.py
node --test tests/*.test.js
node scripts/review_readings.js
npm run test:e2e
git diff --check
```

GitHub Actions ติดตั้ง Chromium และรัน Playwright จริง จึงใช้เป็น browser regression gate ของ core journey นอกจากนี้ static validator ตรวจ presentation manifest ว่า import CSS มีไฟล์จริง ไม่ซ้ำ และ visual guard ที่ตั้งใจไว้ยังอยู่ใน cascade ที่ถูกต้อง

เมื่อ browser regression ล้มเหลว CI จะเก็บ screenshot/trace/HTML report แบบ failure-only เพื่อให้ไล่สาเหตุได้จากหลักฐานโดยไม่ต้องเดา ดูวิธีอ่าน artifact และข้อจำกัดด้าน dependency reproducibility ที่ [`docs/CI_DIAGNOSTICS.md`](docs/CI_DIAGNOSTICS.md)

## Profile storage

วันเกิดถูกแปลงเป็น ISO `YYYY-MM-DD` และประมวลผลใน browser โมเดลบันทึก `{ version: 2, dob, powers, exploredSciences, lastFocus }` ที่ key `sorathai.profile.v1` ใน `localStorage` พร้อม migration จาก profile รุ่นก่อน เมื่อ storage ใช้งานไม่ได้ core reading ยังทำงานต่อโดยไม่ persistence ได้ และ legacy `?dob=DDMMYYYY` ยังรองรับ

หน้าแรกแสดงปีพุทธศักราชแก่ผู้ใช้ แต่ใช้ Gregorian ISO ภายใน Base Destiny Card ใช้ค่าพลัง deterministic ที่ถูกอธิบายว่าเป็นตัวชี้วัดเชิงสัญลักษณ์ ไม่ใช่ผลการวัดทางวิทยาศาสตร์ ผู้ใช้เปลี่ยนหรือล้างวันเกิดได้จากหน้าแรก

RPG exploration รองรับ `identity`, `love`, `career`, `challenge` และมีทางข้ามไปคำอ่านได้ทันที ลิงก์ HTML ปกติยังนำทางได้เมื่อ JavaScript ไม่ทำงาน

## Trust, privacy, and dependencies

Public trust routes: [`about.html`](about.html), [`privacy.html`](privacy.html), [`contact.html`](contact.html)

“เปลี่ยนวันเกิด” เปิดแบบฟอร์มโดยยังเก็บโปรไฟล์เดิม ส่วน “ล้างวันเกิด” ลบ Sorathai profile จาก `localStorage` พารามิเตอร์ `dob` ใน URL อาจเปิดเผยวันเกิดแก่ผู้ที่เห็นลิงก์ จึงห้ามส่ง raw URL/DOB เข้า measurement payload

Google Fonts ใช้ `display=swap` และมี system fallbacks `html2canvas` โหลดแบบ deferred เฉพาะหน้าที่มี export; core reading/navigation ไม่พึ่ง CDN และ export มี graceful fallback เมื่อ library ไม่พร้อม

## Lightweight performance budget

- ห้ามเพิ่ม blocking third-party JavaScript ใน critical path
- non-critical scripts ต้อง `defer` เมื่อปลอดภัย
- ไม่โหลด `html2canvas` บนหน้าที่ไม่มี export
- ไม่มี autoplay และไม่เพิ่ม first-screen asset ขนาดใหญ่โดยไม่มีเหตุผล
- ใช้ shared module/CSS แทน duplicated inline code เมื่อทำได้โดยไม่เปลี่ยน product behavior

## Release status

Milestones 2–10 และ 12–14 Phase 1–2 ปิดแล้วในเชิง repository implementation: core profile flow, deep readings, Combined Profile, trust/accessibility/performance hardening, Playwright release gates, discoverability contracts, Sorathai Visual Identity System, presentation-maintenance contracts และ privacy-safe local-only measurement instrumentation อยู่ใน `main`

Milestone 11 (Issue #28) เป็น **owner/manual operations handoff** สำหรับสิ่งที่ CI พิสูจน์แทนเจ้าของบัญชีหรือมนุษย์ไม่ได้ เช่น Search Console crawl/index feedback, real-device walkthrough, downloaded PNG pixel inspection, full keyboard walkthrough และ assistive-technology review งานเหล่านี้ห้ามถูกอ้างว่า certified เพียงเพราะ automated tests ผ่าน

Milestone 13 ปิดแล้วหลังงาน post-launch quality/maintainability ถูก merge: presentation cascade มีเอกสารและ executable contracts, stale/dead visual layers ถูกตรวจอย่างมีหลักฐาน และ repository state ถูกทำให้ตรงกับ runtime จริง

M14 Phase 1–2 ปิดแล้ว: event taxonomy, strict privacy validation และ local-only core-funnel instrumentation ถูกผูกเข้ากับระบบโดย `SorathaiEvents.emit()` ยังคงเป็น local no-op

**Measurement decision สำหรับ initial validation:** No Analytics Transport. ไม่มี analytics provider, telemetry endpoint, tracking cookie/localStorage identity, pixel, fingerprinting หรือ production event transport การเปิด transport ในอนาคตต้องเป็น explicit product decision + reviewed PR แยกต่างหาก

M15 (Issue #43) เป็น CI observability/regression diagnostics hardening: failure-only Playwright evidence, stale-run concurrency control และเอกสาร reproducibility โดยไม่เปลี่ยน production runtime

## Production identity

ระหว่างที่ยังไม่มี custom domain ที่ตั้งค่าและยืนยันใน repository จะใช้ Cloudflare Pages root origin เป็น canonical ชั่วคราว:

`https://sorathai.pages.dev/`

เมื่อมี custom domain ให้เปลี่ยน canonical, Open Graph, sitemap และ robots ใน release เดียว พร้อมตั้ง redirect ก่อน migration ใน Search Console เพื่อไม่สร้าง SEO signals ซ้ำซ้อน

## Development workflow

1. สร้าง branch จาก `main`
2. แก้เป็น checkpoint ขนาดเล็ก
3. เปิด Draft PR ตั้งแต่ต้นเพื่อให้ CI เฝ้า
4. รัน static/unit/content/browser regression
5. merge เมื่อ scope เสร็จและ gates เขียว

ดูแผนงานที่ [`docs/ROADMAP.md`](docs/ROADMAP.md)
