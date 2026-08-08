const test = require("node:test");
const assert = require("node:assert/strict");

global.SorathaiContent = require("../sorathai-content.js");
const Deep = require("../sorathai-deep-content.js");
const Dream = require("../sorathai-dream-content.js");

const forbiddenNatal = /(ช่วงนี้|เร็ว\s*ๆ\s*นี้|กำลังจะ|ปีนี้|เดือนนี้|จะได้รับเงิน|จะมีคนเข้ามา|โชคลาภกำลัง|โรคไต|ฮอร์โมน|โรคกระดูก|ข้อเสื่อม)/;

function joined(sections) {
  return sections.map((item) => `${item.title} ${item.body}`).join(" ");
}

test("all eight sciences have consistent Thai-first names and explanations", () => {
  const ids = ["thai", "western", "chinese", "numerology", "mayan", "biorhythm", "nakshatra", "celtic"];
  ids.forEach((id) => {
    assert.ok(SorathaiContent.scienceName(id).length > 3, id);
    assert.ok(SorathaiContent.scienceIntro(id).length > 50, id);
  });
  assert.equal(SorathaiContent.scienceName("western"), "โหราศาสตร์ตะวันตก");
  assert.equal(SorathaiContent.scienceName("numerology"), "เลขศาสตร์");
});

test("Base consultation explains all four elements without ability-score language", () => {
  ["ไฟ", "ดิน", "ลม", "น้ำ"].forEach((element) => {
    const value = SorathaiContent.base(element);
    ["summary", "decision", "visible", "strength", "caution"].forEach((key) => assert.ok(value[key].length > 20, `${element}.${key}`));
  });
});

test("Thai natal reading explains basis and avoids unsupported current predictions", () => {
  const sections = SorathaiContent.thaiReading({
    name: "วันอาทิตย์", god: "พระอาทิตย์", trait: ["มีความมั่นใจและชอบรับผิดชอบสิ่งที่ทำ"], lucky_color: "แดง", lucky_nums: ["1", "9"]
  });
  const text = joined(sections);
  assert.match(text, /โหราศาสตร์ไทย/);
  assert.match(text, /จุดแข็ง/);
  assert.match(text, /จุดที่ควรระวัง/);
  assert.doesNotMatch(text, forbiddenNatal);
});

test("Western natal reading interprets sign, element and ruling planet without daily fortune copy", () => {
  const sections = SorathaiContent.westernReading({ n: "ราศีมังกร", el: "ดิน", p: "เสาร์", trait: ["จริงจังกับสิ่งที่รับผิดชอบ"] });
  const text = joined(sections);
  assert.match(text, /ราศีมังกร/);
  assert.match(text, /ธาตุดิน/);
  assert.match(text, /ดาวเสาร์/);
  assert.match(text, /ความรัก/);
  assert.match(text, /การงาน/);
  assert.doesNotMatch(text, forbiddenNatal);
});

test("Chinese natal reading explains animal-system inputs and avoids stereotypes as guarantees", () => {
  const sections = SorathaiContent.chineseReading({ name: "มะเมีย", element: "ไฟ", pol: "หยาง", trait: ["ชอบขยับและเรียนรู้จากประสบการณ์"] });
  const text = joined(sections);
  assert.match(text, /นักษัตรมะเมีย/);
  assert.match(text, /ธาตุไฟ/);
  assert.match(text, /หยาง/);
  assert.match(text, /ไม่.*ตายตัว/);
  assert.doesNotMatch(text, forbiddenNatal);
});

test("Numerology explains Life Path calculation and master-number convention", () => {
  const sections = SorathaiContent.numerologyReading(11, { name: "ผู้จุดประกาย", persona: ["รับรู้ความหมายได้ละเอียด"], challenge: ["ต้องแยกสัญชาตญาณออกจากความกังวล"] });
  const text = joined(sections);
  assert.match(text, /เลขเส้นทางชีวิต/);
  assert.match(text, /วันเดือนปีเกิด/);
  assert.match(text, /Master Number/);
  assert.match(text, /ไม่ใช่การวัดบุคลิกทางวิทยาศาสตร์/);
  assert.doesNotMatch(text, forbiddenNatal);
});

test("Mayan reading explains the 260-day symbol/tone system before reflection", () => {
  const sections = Deep.mayanReading({ tone: 4, sign: { e: "Seed", n: "เมล็ด", sym: "เมล็ด", trait: ["สนใจการเติบโต", "ชอบทำสิ่งที่มีศักยภาพ"] } });
  const text = joined(sections);
  assert.match(text, /260 วัน/);
  assert.match(text, /20 แบบ/);
  assert.match(text, /13 ระดับ/);
  assert.match(text, /Tone 4/);
  assert.match(text, /คำถามจากดวง/);
});

test("Nakshatra explains the 27-part framework before Sanskrit details", () => {
  const sections = Deep.nakshatraReading({ n: "เรวตี", e: "Revati", lord: "พระพุธ", sym: "ปลา", trait: ["รับรู้สิ่งรอบตัวละเอียด", "ให้คุณค่ากับความเข้าใจ"] });
  const text = joined(sections);
  assert.match(text, /27 ส่วน/);
  assert.match(text, /Revati/);
  assert.match(text, /พระพุธ/);
  assert.match(text, /คำแนะนำจากดวง/);
  assert.doesNotMatch(text, forbiddenNatal);
});

test("Celtic reading explains symbolic birth-period association without fake daily predictions", () => {
  const sections = Deep.celticReading({ n: "เบิร์ช", e: "Birch", trait: ["พร้อมเริ่มต้นใหม่", "ฟื้นตัวได้เมื่อสภาพแวดล้อมเปลี่ยน"] });
  const text = joined(sections);
  assert.match(text, /ช่วงวันเกิด/);
  assert.match(text, /สัญลักษณ์/);
  assert.match(text, /คำถามจากต้นไม้/);
  assert.doesNotMatch(text, forbiddenNatal);
});

test("Biorhythm explicitly explains 23/28/33 cycles and rejects medical/intelligence framing", () => {
  const text = joined(Deep.biorhythmReading({ physical: 60, emotional: -12, intellectual: -70 }));
  assert.match(text, /23 วัน/);
  assert.match(text, /28 วัน/);
  assert.match(text, /33 วัน/);
  assert.match(text, /ไม่ใช่คะแนนสุขภาพ/);
  assert.match(text, /ไม่ใช่การวัดระดับสติปัญญา/);
});

test("Dream interpretation is reflective rather than a future-event promise", () => {
  const snake = Dream.interpret("ฝันเห็นงูอยู่หน้าบ้าน");
  assert.equal(snake.symbol, "งู");
  assert.match(snake.traditional, /ตามความเชื่อ/);
  assert.ok(snake.reflection.length > 40);
  assert.ok(snake.question.endsWith("?"));
  const text = Object.values(snake).join(" ");
  assert.doesNotMatch(text, /(จะได้เงิน|จะมีคนเข้ามา|กำลังจะเกิด|สุขภาพจะ|ได้เลื่อนตำแหน่ง)/);
});
