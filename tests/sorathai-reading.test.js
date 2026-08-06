const test = require("node:test");
const assert = require("node:assert/strict");
global.SorathaiProfile = require("../sorathai-profile.js");
const Reading = require("../sorathai-reading.js");

test("derives a valid reading context and ignores invalid focus", () => {
  const profile = SorathaiProfile.create("1990-01-01");
  assert.equal(Reading.deriveContext(profile, "?focus=love", "western").focusLabel, "ความรัก");
  assert.equal(Reading.deriveContext(profile, "?focus=money", "western").focus, null);
  assert.equal(Reading.deriveContext(profile, "", "western").focus, null);
});

test("derives the compact inherited Base layer", () => {
  const base = Reading.inheritedBase(SorathaiProfile.create("1990-01-01"), "career");
  assert.deepEqual(base, { dob: "1990-01-01", archetype: "นักสร้างสรรค์", westernSign: "ราศีมังกร", element: "ดิน", lifePath: 3, focusLabel: "การงาน" });
});

test("prefers the horoscope runtime western calculation when available", () => {
  let received;
  global.HR = {
    getWesternIdx(day, month) { received = [day, month]; return 1; },
    WESTERN: [{ n: "ไม่ควรใช้", el: "ไฟ" }, { n: "ราศีจาก HR", el: "ธาตุจาก HR" }]
  };
  assert.deepEqual(Reading.westernFor("1990-04-08"), { sign: "ราศีจาก HR", element: "ธาตุจาก HR" });
  assert.deepEqual(received, [8, 4]);
  delete global.HR;
});

test("fallback keeps both January and December Capricorn boundaries correct", () => {
  assert.deepEqual(Reading.westernFor("1990-01-01"), { sign: "ราศีมังกร", element: "ดิน" });
  assert.deepEqual(Reading.westernFor("1990-01-19"), { sign: "ราศีมังกร", element: "ดิน" });
  assert.deepEqual(Reading.westernFor("1990-01-20"), { sign: "ราศีกุมภ์", element: "ลม" });
  assert.deepEqual(Reading.westernFor("1990-12-21"), { sign: "ราศีธนู", element: "ไฟ" });
  assert.deepEqual(Reading.westernFor("1990-12-22"), { sign: "ราศีมังกร", element: "ดิน" });
});

test("inherited Base layer matches the existing horoscope result", () => {
  global.HR = { getWesternIdx: () => 0, WESTERN: [{ n: "ราศีเมษ", el: "ไฟ" }] };
  const base = Reading.inheritedBase(SorathaiProfile.create("1990-03-21"), null);
  assert.equal(base.westernSign, HR.WESTERN[HR.getWesternIdx(21, 3)].n);
  assert.equal(base.element, HR.WESTERN[HR.getWesternIdx(21, 3)].el);
  delete global.HR;
});

test("science URLs preserve DOB, focus, query, and fragment", () => {
  const profile = SorathaiProfile.create("2024-02-29");
  assert.equal(Reading.scienceUrl("mayan.html?ref=related#result", profile, "challenge"), "mayan.html?ref=related&dob=29022024&focus=challenge#result");
});

test("export filenames are stable and include a safe science id", () => {
  assert.equal(Reading.exportFilename("thai", "2024-02-29"), "sorathai-thai-2024-02-29.png");
  assert.equal(Reading.exportFilename("unknown", "bad"), "sorathai-reading.png");
});

test("unknown science configuration has a safe neutral fallback", () => {
  assert.deepEqual(Reading.safeConfig("missing"), { id: "reading", name: "Deep Reading", layer: "REFLECTION LAYER", origin: "มุมมองเชิงสัญลักษณ์", icon: "✦", accent: "#776b58" });
});

test("reading helpers leave deterministic profile powers unchanged", () => {
  const profile = SorathaiProfile.create("1990-01-01"), before = { ...profile.powers };
  Reading.inheritedBase(profile, "identity");
  Reading.deriveContext(profile, "?focus=identity", "thai");
  assert.deepEqual(profile.powers, before);
  assert.deepEqual(profile.powers, SorathaiProfile.create("1990-01-01").powers);
});
