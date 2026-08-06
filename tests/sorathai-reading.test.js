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
  assert.deepEqual(base, { dob: "1990-01-01", archetype: "นักสร้างสรรค์", westernSign: "มังกร", element: "ดิน", lifePath: 3, focusLabel: "การงาน" });
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
