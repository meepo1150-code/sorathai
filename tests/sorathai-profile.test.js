const test = require("node:test");
const assert = require("node:assert/strict");
const Profile = require("../sorathai-profile.js");

function memoryStorage(initial) {
  const values = new Map(Object.entries(initial || {}));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

test("validates real ISO dates and supported year bounds", () => {
  assert.equal(Profile.isValidISO("2000-01-31"), true);
  assert.equal(Profile.isValidISO("2000-04-31"), false);
  assert.equal(Profile.isValidISO("1899-12-31"), false);
  assert.equal(Profile.isValidISO("2100-01-01"), false);
  assert.equal(Profile.isValidISO("2000-1-01"), false);
});

test("handles Gregorian leap years strictly", () => {
  assert.equal(Profile.isValidISO("2000-02-29"), true);
  assert.equal(Profile.isValidISO("2024-02-29"), true);
  assert.equal(Profile.isValidISO("1900-02-29"), false);
  assert.equal(Profile.isValidISO("2023-02-29"), false);
});

test("converts legacy DDMMYYYY and ISO values", () => {
  assert.equal(Profile.toISO("29022024"), "2024-02-29");
  assert.equal(Profile.toLegacy("2024-02-29"), "29022024");
  assert.equal(Profile.toISO("31022024"), null);
});

test("generates deterministic, bounded powers", () => {
  assert.deepEqual(Profile.create("01011990"), Profile.create("1990-01-01"));
  assert.notDeepEqual(Profile.create("01011990"), Profile.create("02011990"));
  Object.values(Profile.create("01011990").powers).forEach((value) => {
    assert.ok(value >= 1 && value <= 100);
  });
});

test("persists, restores, and clears the versioned schema", () => {
  const storage = memoryStorage(), profile = Profile.create("1990-01-01");
  assert.equal(Profile.save(profile, storage), true);
  assert.deepEqual(Profile.restore(storage), profile);
  assert.equal(Profile.clear(storage), true);
  assert.equal(Profile.restore(storage), null);
});

test("handles corrupt and unavailable storage safely", () => {
  const corrupt = memoryStorage({ [Profile.STORAGE_KEY]: "{broken" });
  assert.equal(Profile.restore(corrupt), null);
  const unavailable = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } };
  assert.equal(Profile.restore(unavailable), null);
  assert.equal(Profile.save(Profile.create("1990-01-01"), unavailable), false);
  assert.equal(Profile.clear(unavailable), false);
});

test("valid query wins, invalid query never falls back to stored data", () => {
  const storage = memoryStorage();
  Profile.save(Profile.create("1990-01-01"), storage);
  assert.equal(Profile.fromLocation("", storage).dob, "1990-01-01");
  assert.equal(Profile.fromLocation("?dob=29022024", storage).dob, "2024-02-29");
  assert.equal(Profile.fromLocation("?dob=not-a-date", storage), null);
});

test("generates reading URLs while preserving parameters and fragments", () => {
  const profile = Profile.create("2024-02-29");
  assert.equal(Profile.readingUrl("thai-astrology.html", profile), "thai-astrology.html?dob=29022024");
  assert.equal(Profile.readingUrl("mayan.html?ref=home#card", profile), "mayan.html?ref=home&dob=29022024#card");
  assert.equal(Profile.readingUrl("index.html", null), "index.html");
});

test("derives stable card details without changing the persisted schema", () => {
  const profile = Profile.create("1990-01-01");
  const card = Profile.deriveBaseCard(profile);
  assert.equal(card.lifePath, 3);
  assert.equal(card.archetype, "นักสร้างสรรค์");
  assert.deepEqual(card.powers.map((power) => power.key), ["intuition", "vitality", "harmony", "focus"]);
  assert.deepEqual(Profile.deriveBaseCard(Profile.create("1990-01-01")), card);
  assert.deepEqual(Object.keys(profile), ["version", "dob", "powers", "exploredSciences", "lastFocus"]);
  assert.equal(Profile.deriveBaseCard(null), null);
  assert.equal(Profile.lifePath("not-a-date"), null);
});

test("accepts only supported reading focus values", () => {
  ["identity", "love", "career", "challenge"].forEach((focus) => assert.equal(Profile.isValidFocus(focus), true));
  ["", "money", "LOVE", null].forEach((focus) => assert.equal(Profile.isValidFocus(focus), false));
});

test("focus URL generation preserves DOB, query parameters, and fragments", () => {
  const profile = Profile.create("2024-02-29");
  assert.equal(Profile.readingUrl("mayan.html?ref=home#card", profile, "love"), "mayan.html?ref=home&dob=29022024&focus=love#card");
  assert.equal(Profile.readingUrl("mayan.html?ref=home&focus=bad#card", profile, "bad"), "mayan.html?ref=home&dob=29022024#card");
});

test("migrates the version 1 schema without changing deterministic powers", () => {
  const current = Profile.create("1990-01-01");
  const legacy = { version: 1, dob: current.dob, powers: current.powers };
  const migrated = Profile.migrate(legacy);
  assert.equal(migrated.version, Profile.VERSION);
  assert.deepEqual(migrated.powers, current.powers);
  assert.deepEqual(Profile.deriveBaseCard(migrated), Profile.deriveBaseCard(current));
  assert.deepEqual(migrated.exploredSciences, []);
  assert.equal(migrated.lastFocus, null);
});

test("deduplicates explored sciences and retains the latest valid focus", () => {
  let profile = Profile.create("1990-01-01");
  profile = Profile.markScienceExplored(profile, "thai", "identity");
  profile = Profile.markScienceExplored(profile, "thai", "love");
  assert.deepEqual(profile.exploredSciences, ["thai"]);
  assert.equal(profile.lastFocus, "love");
});

test("restores and clears a migrated profile", () => {
  const fresh = Profile.create("1990-01-01");
  const legacy = { version: 1, dob: fresh.dob, powers: fresh.powers };
  const storage = memoryStorage({ [Profile.STORAGE_KEY]: JSON.stringify(legacy) });
  assert.equal(Profile.restore(storage).version, Profile.VERSION);
  assert.equal(Profile.clear(storage), true);
  assert.equal(Profile.restore(storage), null);
});
