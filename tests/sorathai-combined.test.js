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
