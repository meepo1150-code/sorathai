# Sorathai Product Roadmap

## Guiding experience

Sorathai เป็น astrology-inspired character/profile experience ที่ต่อเนื่อง ไม่ใช่ชุดหน้าเว็บดูดวงแยกจากกัน

`Birth date → Base Destiny Card → RPG-style choice → Deep Reading Card → Combined Profile`

## Milestone 1 — Foundation readiness ✅

Repository มี README/roadmap, static validation, GitHub Actions, sitemap/link checks และ development workflow ที่ใช้ branch + PR + automated gates

## Milestone 2 — Base profile model ✅

- profile schema กลางและ ISO DOB ภายในระบบ
- deterministic powers
- localStorage พร้อม safe fallback/migration
- legacy `?dob=DDMMYYYY`
- cross-page profile continuity

## Milestone 3 — Home experience redesign ✅

Issue #4 ปิดแล้ว: Home → DOB → Base Destiny Card → science selection พร้อม accessible date form, profile restore/reset, export และ mobile/reduced-motion support

## Milestone 4 — RPG exploration layer ✅

มี exploration sheet สั้น ๆ พร้อม focus `identity`, `love`, `career`, `challenge`, skip action, keyboard/focus behavior และ no-JavaScript semantic links

## Milestone 5 — Layered deep-reading cards ✅

8 ศาสตร์ใช้ shared Deep Reading shell ที่ขยายจาก Base Profile เดิม รักษา DOB/focus continuity, export, disclaimers และ calculation contracts

## Milestone 6 — Combined Profile ✅

Combined Profile ใช้เฉพาะศาสตร์ที่ผู้ใช้สำรวจแล้ว มี repeated themes ที่ต้องมี evidence อย่างน้อย 2 ศาสตร์, distinct perspectives, explored/missing layers และ deterministic export/synthesis

## Milestone 7 — Content, trust, accessibility, performance ✅

Issue #12 ปิดแล้ว:

- About / Privacy / Contact + shared trust navigation
- disclaimer และ Biorhythm wording ที่ไม่อ้าง scientific validation
- accessibility/source hardening และ dependency fallbacks
- performance budget
- metadata/sitemap validation foundation
- Dream interpretation ทำงานใน browser โดยไม่เรียก external AI model

## Milestone 8 — Browser QA & Release Candidate hardening ✅ automated gate

Issue #14 และ PR #22 ปิดแล้ว:

- `docs/RELEASE_QA.md`
- Chromium/Playwright ใน GitHub Actions
- 8 sciences × focus navigation
- DOB/profile persistence และ Home return
- Combined Profile states
- Dream/trust flows
- storage failure, blocked Google Fonts และ html2canvas failure coverage
- responsive overflow and reduced-motion checks

Automated browser evidence ผ่านแล้ว สิ่งที่ยังไม่ควรอ้างว่า certified คือ real-device visual review, human 200% zoom inspection, downloaded PNG pixel inspection, full keyboard walkthrough และ screen-reader certification

## Milestone 9 — Visual & UX polish ✅

Issue #23 / PR #24 ปิดแล้ว:

- shared Thai typography/spacing/card hierarchy
- Home + Base Destiny Card action hierarchy
- coherent visual shell สำหรับ 8 Deep Reading pages
- Dream visual polish
- Combined 0/1/2/8 browser-state coverage
- responsive matrix 320 / 375 / 390 / 430 / 768 / 1280px

Functionality/calculation/profile contracts ถูกล็อกระหว่าง visual pass

## Milestone 10 — Launch readiness & discoverability ✅

Issue #25 / PR #27 ปิดแล้ว:

- production canonical origin ใช้ `https://sorathai.pages.dev/` จนกว่าจะมี custom domain ที่ยืนยันจริง
- canonical / Open Graph / Twitter / sitemap / robots ถูกทำให้สอดคล้องกัน
- indexable public routes แยกจาก user-specific `noindex` shells อย่างตั้งใจ
- default social preview asset มีอยู่จริง
- 8 science pages มี search context ที่ไม่พึ่ง user DOB
- `sorathai-events.js` เป็น provider-neutral privacy-safe no-op contract โดย default
- launch checklist และ static checks ป้องกัน production-origin drift

การติด analytics provider จริงยังเป็น explicit future decision ไม่ใช่ส่วนหนึ่งของ M10

## Milestone 11 — Public launch operations / owner handoff 🚧 manual evidence

Issue #28 แยกงานที่ต้องอาศัยสิทธิ์เจ้าของบัญชีหรือการตรวจมนุษย์ออกจาก repository automation เช่น Search Console submission/index feedback, real-device walkthrough, downloaded PNG inspection, keyboard walkthrough และ assistive-technology review

Repository automation ห้ามตีความงานเหล่านี้ว่าเสร็จเพียงเพราะ CI ผ่าน หาก owner evidence ยังไม่ถูกบันทึกไว้

## Milestone 12 — Sorathai Visual Identity System ✅

Issue #30 / PR #31 ปิดแล้วและ merge เข้า `main` ที่ `cbddaa442e65d294bce8abaade3b5e8804a0c2f6`

- warm ivory/crafted-paper visual system
- science-specific engraved motifs across 8 sciences
- Base Destiny element/zodiac/archetype visual identity
- result-specific semantic/deterministic variants
- typography and mobile-density balance
- visible no-emoji presentation contract
- Chinese legacy-schema `undefined` compatibility repair
- M12-specific Playwright regression coverage

Calculation, DOB/profile, SEO/indexability/Search Console verification, privacy และ monetization contracts ยังคงถูกล็อกระหว่าง visual milestone

## Milestone 13 — Post-launch quality, maintainability & operations handoff 🚧

Issue #32 / Draft PR #33

เป้าหมายคือทำให้ระบบหลัง M12 ดูแลต่อได้โดยไม่เพิ่ม feature แบบ speculative:

- document และ audit shared presentation cascade
- ตรวจ dead/unreferenced visual layers และลบเฉพาะเมื่อมี regression evidence
- เพิ่ม executable contract สำหรับ CSS manifest/no-emoji guard
- ตรวจ runtime/presentation boundary โดยไม่เสี่ยง calculation/profile contracts
- ทำ README/ROADMAP/issues ให้ตรงกับสถานะจริง
- review M11 manual handoff โดยไม่ claim account/manual evidence เกินจริง

ดู `docs/PRESENTATION_ARCHITECTURE.md` สำหรับ maintenance contract ของ visual stack

## Deferred until post-launch evidence

ยังไม่ควรทำเพียงเพราะทำได้:

- ระบบสมาชิก / backend sync
- AI chatbot ที่มี API cost ต่อข้อความ
- payment / premium report
- mobile application
- เพิ่มศาสตร์ใหม่
- ads/monetization optimization

ลำดับ feature หลัง launch ควรขึ้นกับข้อมูลจริงจาก traffic, completion, sciences-per-profile, Combined reach, return และ share/export behavior ไม่ใช่จำนวน feature ที่อยากเพิ่ม
