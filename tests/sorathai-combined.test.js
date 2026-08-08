const test = require("node:test");
const assert = require("node:assert/strict");
global.SorathaiProfile = require("../sorathai-profile.js");
const Combined = require("../sorathai-combined.js");

function profile(sciences) {
  const value = SorathaiProfile.create("1990-01-01");
  value.exploredSciences = sciences;
  return value;
}

test("normalises aliases, deduplicates, orders, and ignores unknown IDs", () => {
  assert.deepEqual(Combined.normaliseSciences(["num", "west", "western", "chin", "bio", "naksh", "???", null]), ["western", "chinese", "numerology", "biorhythm", "nakshatra"]);
  assert.deepEqual(Combined.normaliseSciences(null), []);
});

test("requires two explored sciences for availability", () => {
  assert.equal(Combined.synthesize(profile([])).available, false);
  assert.equal(Combined.synthesize(profile(["thai"])).available, false);
  assert.equal(Combined.synthesize(profile(["thai", "western"])).available, true);
});

test("extracts deterministic, readable evidence in canonical order", () => {
  const first = Combined.synthesize(profile(["numerology", "thai", "western"]));
  const second = Combined.synthesize(profile(["western", "numerology", "thai"]));
  assert.deepEqual(first, second);
  assert.deepEqual(first.explored, ["thai", "western", "numerology"]);
  assert.match(first.evidence[0].basis, /วันเกิดตรงกับวัน/);
  assert.equal(first.evidence[1].basis, "ราศีมังกร · ธาตุดิน");
  assert.equal(first.evidence[2].basis, "เลขเส้นทางชีวิต 3");
});

test("prefers the existing HR western calculation when available", () => {
  let received;
  global.HR = { getWesternIdx(day, month) { received = [day, month]; return 1; }, WESTERN: [{ n: "ไม่ควรใช้", el: "ไฟ" }, { n: "ราศีจาก HR", el: "น้ำ" }] };
  assert.deepEqual(Combined.western("1990-04-08"), { sign: "ราศีจาก HR", element: "น้ำ" });
  assert.deepEqual(received, [8, 4]);
  delete global.HR;
});

test("uses SorathaiProfile deriveBaseCard for life-path evidence", () => {
  const original = SorathaiProfile.deriveBaseCard;
  let received;
  SorathaiProfile.deriveBaseCard = (value) => { received = value; return { lifePath: 8 }; };
  try {
    const value = profile(["numerology"]), evidence = Combined.evidenceFor("numerology", value);
    assert.equal(received, value);
    assert.equal(evidence.basis, "เลขเส้นทางชีวิต 8");
    assert.deepEqual(evidence.themes, Combined.MAPS.numerology[8]);
  } finally { SorathaiProfile.deriveBaseCard = original; }
});

test("repeated themes have at least two sources and one-source themes stay distinct", () => {
  const result = Combined.synthesize(profile(["thai", "western", "numerology"]));
  assert.ok(result.repeatedThemes.every((theme) => theme.sciences.length >= 2));
  result.distinctPerspectives.forEach((item) => item.themes.forEach((theme) => {
    assert.equal(result.evidence.filter((evidence) => evidence.themes.includes(theme)).length, 1);
  }));
});

test("only explored sciences contribute and output changes with explored layers", () => {
  const two = Combined.synthesize(profile(["thai", "western", "unknown"]));
  const three = Combined.synthesize(profile(["thai", "western", "numerology"]));
  assert.deepEqual(two.evidence.map((item) => item.scienceId), ["thai", "western"]);
  assert.notDeepEqual(two, three);
});

test("reflective synthesis names repeated support and a distinct perspective in Thai", () => {
  const result = Combined.synthesize(profile(["western", "chinese", "numerology"]));
  assert.match(result.statement, /^จาก 3 ศาสตร์ที่คุณเปิดแล้ว/);
  assert.match(result.statement, /เรื่องที่พูดตรงกันเด่นที่สุดคือ “การแสดงออก”/);
  assert.match(result.statement, /โหราศาสตร์จีน และ เลขศาสตร์/);
  assert.match(result.statement, /โหราศาสตร์ตะวันตกเติมมุมเรื่องความมั่นคง/);
  assert.match(result.statement, /ไม่ใช่หลักฐานว่าคำทำนายเป็นข้อเท็จจริงทางวิทยาศาสตร์/);
});

test("reflective synthesis has a scoped fallback and changes with layers", () => {
  const two = Combined.synthesize(profile(["thai", "western"]));
  const three = Combined.synthesize(profile(["western", "chinese", "numerology"]));
  assert.match(two.statement, /ยังไม่มีประเด็นใดปรากฏซ้ำจากอย่างน้อย 2 ศาสตร์/);
  assert.notEqual(two.statement, three.statement);
  assert.equal(Combined.synthesize(profile(["numerology", "chinese", "western"])).statement, three.statement);
});

test("combined science names are Thai-first", () => {
  assert.equal(Combined.SCIENCES.western.name, "โหราศาสตร์ตะวันตก");
  assert.equal(Combined.SCIENCES.chinese.name, "โหราศาสตร์จีน");
  assert.equal(Combined.SCIENCES.numerology.name, "เลขศาสตร์");
  assert.equal(Combined.SCIENCES.mayan.name, "ปฏิทินมายา");
  assert.equal(Combined.SCIENCES.biorhythm.name, "ไบโอริทึม");
  assert.equal(Combined.SCIENCES.nakshatra.name, "ดาวฤกษ์อินเดีย");
  assert.equal(Combined.SCIENCES.celtic.name, "ต้นไม้เคลต์");
});

test("synthesis never changes deterministic profile powers", () => {
  const value = profile(["thai", "western", "numerology"]), before = { ...value.powers };
  Combined.synthesize(value);
  assert.deepEqual(value.powers, before);
  assert.deepEqual(value.powers, SorathaiProfile.create(value.dob).powers);
});

test("profile URLs preserve DOB, query values, focus, and fragment", () => {
  const value = profile(["thai", "western"]);
  assert.equal(Combined.profileUrl("profile.html", value, "?ref=reading&focus=love&dob=old", "#card"), "profile.html?ref=reading&focus=love&dob=01011990#card");
  assert.equal(Combined.profileUrl("index.html?source=combined#base", value, "?focus=love", "#ignored"), "index.html?source=combined&dob=01011990#base");
});

test("uses a stable export filename and handles empty/reset profiles", () => {
  assert.equal(Combined.exportFilename("2024-02-29"), "sorathai-combined-2024-02-29.png");
  assert.equal(Combined.exportFilename("bad"), "sorathai-combined.png");
  assert.equal(Combined.synthesize(profile([])).count, 0);
  assert.equal(Combined.synthesize(null), null);
});
