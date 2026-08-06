# Sorathai Product Roadmap

## Guiding experience

Sorathai จะพัฒนาเป็น astrology character-building experience ไม่ใช่ชุดหน้าเว็บดูดวงที่แยกจากกัน

เส้นทางหลัก:

`Birth date → Base Destiny Card → RPG-style choice → Deep Reading Card → Combined Profile`

## Milestone 1 — Foundation readiness

เป้าหมาย: ทำให้ repository พร้อมแก้ไขอย่างปลอดภัย

- [x] เพิ่ม README และ product vision
- [x] เพิ่ม roadmap
- [ ] เพิ่ม automated static validation
- [ ] เพิ่ม GitHub Actions
- [ ] ตรวจทุก URL ใน sitemap
- [ ] บันทึก baseline ของหน้าและ flow ปัจจุบัน

เกณฑ์ผ่าน:

- Pull request ทุกชุดมี automated checks
- internal links และ sitemap targets ไม่พัง
- มีเอกสารอธิบายโครงสร้างและแนวทางพัฒนา

## Milestone 2 — Base profile model

เป้าหมาย: ทำให้ทุกหน้าอ้างอิงตัวตนผู้ใช้ชุดเดียวกัน

- นิยาม schema ของ `SorathaiProfile`
- ใช้วันเกิดรูปแบบ ISO `YYYY-MM-DD` ภายในระบบ
- สร้างค่าพลังแบบ deterministic และอธิบายที่มาได้
- เก็บ profile ใน `localStorage`
- รองรับ URL เดิมที่ใช้ `?dob=` โดยไม่ทำลายลิงก์เก่า
- เพิ่ม privacy copy ว่าข้อมูลประมวลผลบนอุปกรณ์ เมื่อพฤติกรรมจริงสอดคล้อง

เกณฑ์ผ่าน:

- วันเกิดเดียวกันได้ Base Card เดิมทุกครั้ง
- เปิดหน้าศาสตร์อื่นแล้วยังเห็น profile เดิม
- ไม่มีข้อมูลสำคัญสูญหายระหว่าง navigation

## Milestone 3 — Home experience redesign

เป้าหมาย: ทำหน้าแรกให้เป็น entry point ที่สวยและชัดเจนที่สุด

- Hero แบบ minimal/clean
- date picker ที่เข้าถึงง่าย
- loading/reveal transition ที่ไม่หน่วง
- Base Destiny ID Card รุ่นใหม่
- คำอธิบายสั้นของค่าพลัง
- CTA เลือกศาสตร์ต่อที่เด่นชัด
- รองรับมือถือขนาดเล็กและ reduced motion

สถานะ: เสร็จสิ้นใน Issue #4 — หน้าแรกใช้ flow `วันเกิด → Base Destiny Card → เลือกศาสตร์ต่อ`
พร้อม date form ที่เข้าถึงได้, profile continuity, image export และแยกทำนายฝันออกจากศาสตร์ที่คำนวณจากวันเกิด

เกณฑ์ผ่าน:

- ผู้ใช้เข้าใจว่าต้องทำอะไรโดยไม่อ่านคำอธิบายยาว
- ไม่มี layout shift รุนแรง
- ใช้งานด้วย keyboard ได้

## Milestone 4 — RPG exploration layer

เป้าหมาย: เปลี่ยนการเลือกศาสตร์ให้มี narrative แต่ไม่ขวางการเข้าถึงผลลัพธ์

- บทสนทนาไม่เกิน 2–3 ขั้น
- เลือกเป้าหมายคำอ่าน เช่น ตัวตน ความรัก งาน หรือจุดท้าทาย
- skip dialogue ได้
- จดจำศาสตร์ที่เปิดแล้ว
- animation เบาและมี reduced-motion fallback

เกณฑ์ผ่าน:

- ผู้ใช้เข้าถึงคำอ่านเชิงลึกได้เร็ว
- narrative ช่วยเพิ่มบริบท ไม่ใช่เพิ่มขั้นตอนโดยไร้ประโยชน์

## Milestone 5 — Layered deep-reading cards

เป้าหมาย: ทำให้แต่ละศาสตร์ขยาย Base Card เดิมอย่างต่อเนื่อง

- สร้าง component card กลาง
- แสดง Base layer และ Science layer
- ลด HTML/JS ซ้ำระหว่างหน้าศาสตร์
- เพิ่มคำอธิบาย calculation/source/limitations
- แชร์เป็นภาพพร้อม watermark ได้

เกณฑ์ผ่าน:

- ทุกศาสตร์ใช้ visual language เดียวกัน
- ผู้ใช้เห็นความสัมพันธ์ระหว่าง Base Card กับข้อมูลใหม่

## Milestone 6 — Combined profile

เป้าหมาย: รวมศาสตร์ที่ผู้ใช้เปิดแล้วเป็นโปรไฟล์เดียว

- progress ของศาสตร์ที่สำรวจ
- synthesis ที่ไม่สร้างข้อสรุปเกินข้อมูล
- combined card สำหรับแชร์
- reset/export profile

## Milestone 7 — Content, trust, accessibility, performance

- About, Privacy, Contact และ disclaimer
- ปรับถ้อยคำ Biorhythm ไม่ให้สื่อว่าเป็นวิทยาศาสตร์ที่ยืนยันแล้ว
- ตรวจ contrast, labels, focus states และ screen-reader semantics
- self-host หรือเพิ่ม fallback สำหรับ dependency สำคัญ
- performance budget และ image/font optimization
- structured data เฉพาะที่ตรงตามเนื้อหาจริง

## Deferred

งานต่อไปนี้ยังไม่ควรทำจนกว่า core experience จะเสถียร:

- ระบบสมาชิก
- backend sync
- AI chatbot ที่เสียค่า API ต่อข้อความ
- payment และ premium report
- mobile application
- เพิ่มศาสตร์ใหม่เกินรายการปัจจุบัน
- optimization เพื่อรายได้โฆษณา
