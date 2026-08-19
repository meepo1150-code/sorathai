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

## Milestone 13 — Post-launch quality, maintainability & operations handoff ✅

Issue #32 / PR #33 ปิดแล้ว งาน maintainability หลัง M12 ถูก merge และใช้งานเป็น repository contract แล้ว:

- document/audit shared presentation cascade
- executable CSS manifest และ no-emoji presentation contracts
- dead/unreferenced visual layers ถูกตรวจและลดเฉพาะเมื่อมี regression evidence
- runtime/presentation boundary ถูก harden โดยไม่เปลี่ยน calculation/profile contracts
- README/ROADMAP/issues ถูก sync กับสถานะจริง
- M11 manual handoff ยังคงแยกจาก automated evidence อย่างชัดเจน

ดู `docs/PRESENTATION_ARCHITECTURE.md` สำหรับ maintenance contract ของ visual stack

## Milestone 14 — Privacy-safe measurement readiness ✅ local-only

Phase 1–2 ปิดแล้ว:

- event taxonomy และ closed-enum payload contract
- strict validator สำหรับ unknown/prohibited/unexpected/invalid fields
- core funnel call sites ถูก wire แบบ local-only
- `SorathaiEvents.emit()` ยังคงเป็น no-op และไม่ส่ง event ออกจาก browser
- ไม่มี analytics cookie, analytics localStorage identity, tracking pixel, fingerprinting หรือ telemetry endpoint

### Selected product decision

สำหรับ initial validation เลือก **No Analytics Transport**

ข้อดีคือ privacy boundary ชัด, ไม่มี third-party analytics dependency/cost และ production behavior audit ได้ง่าย ข้อแลกเปลี่ยนคือช่วงนี้ไม่มี production funnel counts, retention หรือ aggregate usage dataset

การเปิด transport ในอนาคตต้องเป็น explicit product decision + separate reviewed PR พร้อม privacy/provider/payload/retention/IP/consent/opt-out/browser-regression review ห้ามเปิดจาก incidental refactor

## Milestone 15 — CI observability & regression diagnostics ✅

Issue #43 / PR #44 ปิดแล้วและ merge เข้า `main` ที่ `1b3e3199ed38f57bdbed324fa604942e0df3c2c6`:

- Playwright เก็บ screenshot เฉพาะตอน fail และ trace ของ failed tests
- CI สร้าง HTML browser report แบบไม่เปิดอัตโนมัติ
- GitHub Actions upload failure diagnostics แบบ short retention เฉพาะเมื่อ fail
- concurrency guard ยกเลิก run เก่าที่ถูก commit ใหม่ใน PR/ref เดียวกันแทนที่
- ตอน M15 repository ยังไม่มี `package-lock.json` จึงบันทึกข้อจำกัด npm transitive reproducibility ไว้โดยไม่สร้าง lockfile ปลอม; limitation นี้ถูกแก้ภายหลังใน M24 ด้วย npm-generated lockfile + `npm ci`

PR run #179 ถูก supersede และ cancelled ตาม contract; run #180 ผ่านเต็มชุด และ post-merge static validation #181 + production crawler smoke #6 ผ่านบน main

ดู `docs/CI_DIAGNOSTICS.md` สำหรับวิธีอ่านหลักฐานเมื่อ browser gate ล้มเหลว

## Milestone 16 — Production semantic contract smoke ✅ implementation

Issue #45 / PR #46 เพิ่ม post-merge evidence จากเดิมที่ตรวจเพียง HTTP/crawler reachability ให้ตรวจ deployed semantics ที่สำคัญด้วย:

- Home Open Graph / launch schema
- representative Western public route Open Graph / schema และไม่มี accidental `noindex`
- `profile.html` และ `dream-result.html` ยังคง `noindex,follow` และอยู่นอก sitemap
- `og-image.png` ตอบ `image/png`
- PR CI ตรวจ shell syntax ของ production smoke โดยไม่ยิง production network ก่อน merge

M16 เป็น deployment sanity check ไม่ใช่หลักฐานว่า Google index สำเร็จ; Search Console ใน Issue #28 ยังเป็น source of truth สำหรับ Google-specific indexing

## Milestone 17 — External dependency boundary ✅

Issue #47 / PR #48 merge แล้วที่ `6790922988301db17abbb60cdafaee2fc0d24ac1`:

- `scripts/validate_external_dependencies.py` เป็น executable allowlist สำหรับ third-party browser resources
- Google Fonts stylesheet/preconnect ถูกจำกัดตาม allowlist
- html2canvas ถูกจำกัดที่ exact cdnjs URL/version และต้อง `defer`
- html2canvas โหลดได้เฉพาะ export-capable pages
- external JavaScript/styles/resource links/media/embed/CSS URL อื่นถูก reject โดย default
- `docs/DEPENDENCY_BOUNDARY.md` บันทึก review path สำหรับ intentional allowlist changes
- M17 ไม่สร้าง `package-lock.json` ปลอม; npm reproducibility gap ที่ยังอยู่ ณ ตอนนั้นถูกแก้แยกภายหลังใน M24

PR CI และ post-merge validation/production smoke ของ M17 ผ่านแล้วตาม Issue #47

## Milestone 18 — Static response security headers ✅

Issue #49 / PR #50 ปิดแล้ว:

- Sorathai-owned `X-Frame-Options: DENY`
- Sorathai-owned `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- source validator สำหรับ `_headers`
- production verification ของ custom headers รวมถึง Cloudflare defaults `X-Content-Type-Options: nosniff` และ `Referrer-Policy: strict-origin-when-cross-origin`
- CSP ถูก defer อย่างตั้งใจ เพราะ inline CSS/JS, Google Fonts และ html2canvas ต้องมี compatibility design/regression pass แยกต่างหาก

ดู `docs/SECURITY_HEADERS.md` สำหรับ ownership และ CSP rationale

## Milestone 19 — GitHub Actions supply-chain pinning 🚧 implementation merged / post-merge evidence pending

Issue #51 / PR #52 merge แล้วที่ `b56b2b5ac490efe5b0a6349f93c4f84d1a0bf686`:

- remote GitHub Actions ทั้งหมดใช้ full commit SHA pins
- `scripts/validate_action_pins.py` ป้องกัน mutable refs กลับเข้ามา
- workflow permissions ไม่ถูก broaden
- PR CI ผ่านพร้อม pinned actions

สิ่งที่ยังไม่อ้างว่า complete ใน Issue #51 คือ direct observation ของ push-triggered Production crawler smoke บน post-merge evidence ที่เกี่ยวข้อง เนื่องจาก connector ใน session ปัจจุบันไม่ enumerate push runs ตาม SHA

## Milestone 20 — Canonical URL response-header contract 🚧 implementation merged / post-merge evidence pending

Issue #53 / PR #54 merge แล้วที่ `dd1f8887c1a0f35dd9604255157c4729b438fd02`:

- sitemap-listed public routes มี matching HTTP `Link: <...>; rel="canonical"`
- `profile.html`, `dream-result.html`, `404.html` ไม่รับ canonical response-header mapping ตาม indexability contract
- source validator ป้องกัน missing/wrong/duplicate mappings
- production smoke ถูกขยายให้ตรวจ canonical response headers ทุก sitemap URL
- HTML canonical / OG / sitemap / robots contracts เดิมยังคงอยู่

Issue #53 ยังเปิดจนกว่าจะมี direct post-merge production-smoke evidence ที่สังเกตได้จริง

## Milestone 21 — Subresource Integrity for external export script 🚧 implementation merged / post-merge evidence pending

Issue #55 / PR #56 merge แล้วที่ `d517ae7374d03cf45d1d287e481c1f142d1a757d`:

- html2canvas 1.4.1 บน 11 export-capable pages ใช้ exact SHA-512 SRI เดียวกัน
- เพิ่ม `crossorigin="anonymous"` โดยคง URL/version และ `defer` เดิม
- external dependency validator ตรวจ exact URL/SRI/crossorigin/defer
- Playwright export coverage ผ่านหลังเปิด SRI
- ไม่มี external browser dependency เพิ่ม

Issue #55 ยังเปิดเพราะ direct post-merge production verification ยังไม่ถูกสังเกตผ่าน connector ใน session นี้

## Milestone 22 — Production external dependency metadata verification 🚧 implementation merged / post-merge evidence pending

Issue #57 / PR #58 merge แล้วที่ `358deaf66e6bc486f063fdc8d8b6ba239da4ba47`:

- `scripts/production_smoke.sh` ตรวจ deployed html2canvas contract ครบ 11 export routes
- แต่ละ route ต้องมี exact approved URL เพียงหนึ่งครั้ง และต้องมี exact SRI, `crossorigin="anonymous"`, `defer`
- crawler/canonical/semantic/noindex/security-header/social-preview checks เดิมไม่ถูกลด
- PR Validate static website #195 ผ่านครบ รวม Playwright และ whitespace

workflow รองรับทั้ง `push` บน `main` และ `workflow_dispatch` แต่ Issue #57 ยังคงเปิดจนกว่าจะมี direct observation ของ post-merge Production crawler smoke บน M22 merge SHA จริง

## Milestone 23 — Repository roadmap and release-state synchronization ✅

Issue #59 / PR #60 merge แล้วที่ `ae2c4d0bc66824e18650494afa761ef4f974a1c0`:

- README/ROADMAP ถูก sync ให้ตรงกับ merged state ผ่าน M22
- แก้ M17 scope ให้ตรงกับ External dependency boundary จริง
- รักษา M11 manual evidence, No Analytics Transport, CSP deferral และ unresolved M19–M22 post-merge evidence ไว้อย่างตรงไปตรงมา
- documentation-only; full Validate static website #197 ผ่านก่อน merge

## Milestone 24 — Reproducible npm browser-test dependencies ✅

Issue #61 / PR #62 merge แล้วที่ `08fe245455639518bbca85e5a74860277e75075a`; follow-up documentation PR #63 merge ที่ `a9e5e24c71df70d29c855bc6e9e7a36b978e9616`:

- ใช้ GitHub-hosted Node 22/npm สร้าง `package-lock.json` จาก `package.json` จริง แทนการ hand-author dependency graph
- ตรวจ candidate artifact แล้วว่าเป็น lockfile v3 และมีเฉพาะ Playwright 1.55.0 dependency chain กับ optional macOS `fsevents`
- commit exact npm-generated lockfile
- validation workflow เปลี่ยน browser-test install จาก `npm install` เป็น `npm ci --no-audit --no-fund`
- temporary lockfile generation/upload helpers ถูกลบออกจาก final workflow
- production browser dependency boundary ไม่เปลี่ยน
- Validate static website #206 ผ่านครบก่อน PR #62 merge และ #208 ผ่านครบก่อน documentation follow-up merge
- post-merge audit แก้ stale M19-era npm limitation ใน `docs/ACTION_PINNING.md` แล้ว ก่อนปิด Issue #61 เป็น completed

## Milestone 25 — Review-only dependency update automation 🚧

Issue #64 เพิ่ม low-noise dependency update discovery สำหรับ controls ที่ M19/M24 ทำให้ reproducible แล้ว:

- `.github/dependabot.yml` เฝ้าเฉพาะ `github-actions` และ `npm` ที่ repository root
- ทั้งสอง ecosystem ใช้ monthly schedule และจำกัดจำนวน open update PR เพื่อลด noise
- Dependabot PR เป็น proposal สำหรับ review เท่านั้น ไม่ใช่ approval/auto-merge
- ไม่มี private registry, credential, production browser dependency หรือ workflow permission expansion
- `docs/DEPENDENCY_UPDATES.md` กำหนด review contract สำหรับ full-SHA Action pins และ npm-generated lockfile
- dependency PR ทุกตัวต้องผ่าน repository validation gate เดิมก่อน merge

M25 จะปิดเมื่อ diff review ยืนยัน scope, full static/model/content/Playwright/whitespace CI ผ่าน และ PR merge สำเร็จ โดยไม่อ้างว่าการตั้ง config เท่ากับมี Dependabot update PR เกิดขึ้นจริงจนกว่าจะสังเกตได้หลัง merge

## Deferred until post-launch evidence

ยังไม่ควรทำเพียงเพราะทำได้:

- ระบบสมาชิก / backend sync
- AI chatbot ที่มี API cost ต่อข้อความ
- payment / premium report
- mobile application
- เพิ่มศาสตร์ใหม่
- ads/monetization optimization
- analytics transport โดยไม่มีเหตุผลผลิตภัณฑ์ที่ชัดเจน
- Content-Security-Policy แบบ improvised โดยไม่มี compatibility design สำหรับ inline CSS/JS, Google Fonts และ external export dependency

ในช่วง No Analytics Transport การตัดสินใจ feature ถัดไปควรอิง **direct user feedback, reproducible defects, Search Console/operational evidence และ product goals ที่ชัดเจน** แทนการสมมติ funnel/retention metrics ที่เราไม่ได้เก็บอยู่จริง หากอนาคตเปิด measurement transport อย่างตั้งใจ ค่อยใช้ baseline aggregate behavior เพื่อช่วยเลือก bottleneck ถัดไป
