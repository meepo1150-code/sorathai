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

## Milestone 10 — Launch readiness & discoverability 🚧

Issue #25 / PR #27

เป้าหมาย: ทำให้ product พร้อมเปิดให้ผู้ใช้จริงและเริ่มพิสูจน์ traffic/engagement ก่อน monetization

งานหลัก:

- production canonical origin ที่ตรงกับ deployment จริง
- canonical / Open Graph / Twitter / sitemap / robots consistency
- intentional indexability ของ landing pages เทียบกับ user-specific result shells
- default social preview asset ที่มีอยู่จริง
- search context ที่มีประโยชน์บน 8 science pages โดยไม่ทำ thin/doorway SEO spam
- provider-neutral `sorathai-events.js` contract ที่ no-op โดย default และห้าม DOB/dream/reading text
- launch checklist + Search Console owner actions
- 90-day baseline metrics โดยไม่สร้าง target ก่อนมีข้อมูลจริง
- static/unit/content/Playwright gates ต้องเขียวเหมือนเดิม

## Deferred until post-launch evidence

ยังไม่ควรทำเพียงเพราะทำได้:

- ระบบสมาชิก / backend sync
- AI chatbot ที่มี API cost ต่อข้อความ
- payment / premium report
- mobile application
- เพิ่มศาสตร์ใหม่
- ads/monetization optimization

ลำดับหลัง Milestone 10 ควรขึ้นกับข้อมูลจริงจาก traffic, completion, sciences-per-profile, Combined reach, return และ share/export behavior ไม่ใช่จำนวน feature ที่อยากเพิ่ม
